# DK Plus API — Plain English Guide

This document explains what the DK Plus API can do, written so that anyone on the team can understand it — not just developers.

---

## What is an API?

An API is like a waiter at a restaurant. You (the portal) place an order, the waiter (the API) goes to the kitchen (DK's database), and brings back what you asked for. You never touch the database directly — you always go through the API.

Every request you make needs a **token** — think of it as your key card. Without it, you get nothing back.

---

## How requests work (for developers)

- **Base URL:** `https://api.dkplus.is/api/v1` (some newer endpoints use `/api/v2`)
- **Auth header:** `Authorization: Bearer <your-token>` — sent with every request
- **Methods:** GET = fetch data, POST = create something, PUT = update something, DELETE = remove something
- **Errors:** Always come back as `{ "Message": "explanation" }`
- **Test company:** LOK - HR (`lokhr`)

---

## What we're actually using in this project

These are the parts of the API we've connected to so far:

| What | API endpoint | Used for |
|------|-------------|----------|
| Company info | `/company` | Dashboard company name |
| Licence modules | `/company/licence` | Deciding which nav items to show |
| Login / token lookup | `/Token`, `/Token/{user}/{company}` | Logging in with an API token |
| Employee list | `/general/employee` | Starfsmenn page + eID role lookup |
| Timeclock | `/TimeClock/in`, `/TimeClock/out`, `/TimeClock/stamp/{employee}` | Stimpilklukka |
| Customer transactions | `/customer/transaction/page/1/100` | Reikningar page |
| Invoice PDF | `/sales/invoice/{number}/pdf` | Downloading invoices |
| Customer list | `/Customer` | Viðskiptavinir page |
| Portal invites | `/mypages/invites` | Notendur page (see note below) |

---

## Company

**What it is:** Basic information about the company using the system — name, address, which modules they've paid for.

**What you'd use it for:** Showing the company name on the dashboard, knowing which features to turn on or off.

| What it does | Technical path |
|---|---|
| Get company info and address | `GET /company` |
| Check if the connection to DK is working | `GET /company/connection` |
| See which modules are licensed/enabled | `GET /company/licence` |
| Trigger a data sync with DK | `PUT /company/sync` |

**Licence modules you might see:** GeneralLedger, Customer, Vendor, Sales, Product, Project, Payroll, Member, Purchase — these control which sections appear in the portal sidebar.

---

## Tokens (API Keys)

**What it is:** API tokens are like passwords — each token belongs to a user and gives access to a specific company's data.

**What you'd use it for:** Logging in. When a user enters their token, we call `/Token` to verify it and find out who they are.

| What it does | Technical path | Tested |
|---|---|---|
| List all tokens for the company | `GET /Token` | ✅ returns only your own token |
| Get a single token | `GET /Token/{id}` | ✅ works |
| Get the employee linked to a user+company | `GET /Token/{userID}/{companyID}` | ✅ returns employee number (kennitala) |
| Get companies the token has access to | `GET /Token/companies` | ✅ returns `[{ ID, Number, Name, SSN }]` |
| Create a new token | `POST /Token` | untested |
| Update a token | `PUT /Token/{id}` | untested |
| Delete a token | `DELETE /Token/{id}` | untested |
| Get request logs for a token | `GET /token/report/logs` | untested |
| Download usage report as PDF | `GET /token/report/usage/pdf` | untested |

**Token shape:**
```json
{
  "Token": "be5efec7-...",
  "Company": "cfb71469-...",
  "User": "21f532e3-...",
  "Type": 0,
  "Description": "prufan",
  "Notify": [],
  "Created": "2026-02-14T13:46:23.473"
}
```

> `Type` is always `0` on our token. It may encode permission levels — worth asking DK what the possible values are.

---

## Permissions

**What it is:** A breakdown of what the current token is allowed to do, per module.

| What it does | Technical path | Tested |
|---|---|---|
| Get current token's permissions | `GET /permission` | ✅ works |

**Permission levels (confirmed from official DK docs):**

| Value | Meaning |
|---|---|
| `0` | Full |
| `1` | View |
| `2` | Modify |
| `3` | None |
| `4` | Deny |

**Enabled field values:** `Enabled`, `Disabled`, `Blocked`

**Response shape:**
```json
{
  "GeneralPermission": { "Employee": 0, "MyPages": 3, "TimeClock": 0, ... },
  "SalesPermission":   { "Invoices": 0, "Orders": 0, "Salespersons": 3, ... },
  "CustomerPermission": { "Customers": 0, "Invoices": 0, "Transactions": 3, ... },
  "PayrollPermission": { "Payslip": 4, "Enabled": 2 },
  ...
}
```

So on our token: `Employee: 0` = full access to employees, `MyPages: 3` = no access to MyPages, `Payslip: 4` = explicitly denied.

> This is per-token, not per-user. If DK allows setting these values when creating a token via `POST /Token`, you could issue per-employee tokens with restricted permissions instead of using the `Tag`/Merking workaround.

**This is per-token, not per-user.** The API has no concept of per-user permissions (see Known Limitations). The permission response only reflects the token being used, not the individual who logged in.

---

## eID Login — How to know what a user can see

When a user logs in via eID (rafræn skilríki) you get their kennitala. Use it like this:

1. `GET /general/employee` — find the employee where `SSNumber === kennitala`
2. Read `employee.Tag` — this is the **Merking** field in DK Plus
3. Use the value to decide what nav items to show

**Role values we use in Merking:**

| Merking value | What they can see |
|---|---|
| `admin` | Everything |
| `worker` | Dashboard + Stimpilklukka |
| `bokari` | Dashboard + Reikningar + Viðskiptavinir |
| missing/empty | Deny access |

> This is a workaround because the DK API has no per-user permission system. Roles live in the `Tag`/Merking field on each employee record in DK Plus, and the portal enforces them in the UI.

---

## Portal Users (MyPages / Notendur)

**What it is:** Inviting people to access the portal and managing those invites.

**What you'd use it for:** The Notendur page — admins can invite new people and cancel invites.

| What it does | Technical path | Tested |
|---|---|---|
| See pending invites | `GET /mypages/invites` | ❌ GET not supported |
| Invite someone to the portal | `POST /mypages/invites` | untested |
| Cancel an invite | `DELETE /mypages/invites/{id}` | untested |

**Invite body:**
```json
{
  "Email": "user@example.is",
  "Customer": "customerNumber",
  "Role": "Admin"
}
```

> **Note:** `GET /mypages/users`, `DELETE /mypages/users/{id}` and `PUT /mypages/users/{id}` do not exist in the API — they return 404. The only working endpoint is `/mypages/invites` for creating/cancelling invites.

---

## Customers (Viðskiptavinir)

**What it is:** The businesses or people that the company sells to. These are stored in DK's accounting system and show up on invoices.

**What you'd use it for:** The Viðskiptavinir page — browsing and searching through customers, seeing their outstanding balance, their contact people, and their delivery addresses.

| What it does | Technical path |
|---|---|
| Get a page of customers | `GET /Customer/page/{page}/{count}` |
| Get total customer count | `GET /Customer/info/count` |
| Look up one customer | `GET /Customer/{customer}` |
| Search customers | `GET /Customer/search/{value}/{max}` |
| Create a new customer | `POST /Customer` |
| Update a customer | `PUT /Customer/{customer}` |
| Look up customer by phone number | `GET /Customer/Phone/{number}` |
| Get invoices for a customer | `GET /Customer/{customer}/invoice` |
| Get transactions for a customer | `GET /Customer/{customer}/transaction` |

**Important fields on a customer:**
- `Name` — company or person name
- `SSNumber` — Icelandic kennitala (must be valid if provided)
- `BalanceAmount` — how much they owe
- `Blocked` — whether they're blocked from buying

---

## Contacts

**What it is:** Specific people attached to a customer. For example, a customer company might have a CEO, a project manager, and an accountant — these are the contacts.

| What it does | Technical path |
|---|---|
| List contacts for a customer | `GET /Customer/{customer}/Contact` |
| Add a contact | `POST /Customer/{customer}/Contact` |
| Update a contact | `PUT /Customer/{customer}/Contact/{contactId}` |
| Remove a contact | `DELETE /Customer/{customer}/Contact/{contactId}` |

---

## Delivery Addresses (Receivers / Vörumóttakendur)

**What it is:** Some customers have goods delivered to a different address than their billing address. These are called "receivers" in the system.

| What it does | Technical path |
|---|---|
| List delivery addresses for a customer | `GET /Customer/{customer}/Reciver` |
| Add a delivery address | `POST /Customer/{customer}/reciver` |
| Update a delivery address | `PUT /Customer/{customer}/reciver/{reciverId}` |

---

## Sales Invoices (Reikningar)

**What it is:** The invoices the company sends to customers. You can view them, download them as PDF, email them, or create new ones.

**What you'd use it for:** The Reikningar page — showing the list of invoices, letting users download PDFs.

| What it does | Technical path |
|---|---|
| Get a page of invoices | `GET /sales/invoice/page/{page}/{count}` |
| Get one invoice | `GET /sales/invoice/{number}` |
| Download invoice as PDF | `GET /sales/invoice/{number}/pdf` |
| Email invoice to customer | `POST /sales/invoice/{number}/email` |
| Create an invoice | `POST /sales/invoice` |
| Create a credit note (reverse an invoice) | `POST /sales/invoice/{id}/reverse` |

> **Note:** Creating invoices requires a salesperson to already exist in the DK ERP. This has to be set up there directly.

---

## Sales Orders

**What it is:** An order placed by a customer before it becomes an invoice. Orders can be converted into invoices once fulfilled.

There are two versions — v1 (older, simpler) and v2 (newer, more flexible). v2 lets you add/edit individual lines on an order.

| What it does | Technical path |
|---|---|
| List orders | `GET /sales/order` or `GET /v2/sales/order/{page}/{size}` |
| Create an order | `POST /sales/order` |
| Convert order to invoice | `PUT /v2/sales/order/{uid}/invoice` |
| Download order as PDF | `GET /sales/order/{number}/pdf` |

---

## Sales Quotes

**What it is:** A price offer sent to a potential customer before they agree to buy. If they say yes, the quote becomes an order or invoice.

Works the same as orders — has v1 and v2 versions.

---

## Recurring Invoices

**What it is:** Invoices that repeat on a schedule (monthly, yearly, etc.) — like a subscription. Set it up once and it bills automatically.

---

## Point of Sale (dkPOS)

**What it is:** For businesses that have a physical checkout — this is the till/register system. Orders from dkPOS show up here.

---

## Vendors / Suppliers (Lánardrottnar)

**What it is:** The companies or people that the company *buys from* (opposite of customers). Their invoices are purchase invoices.

| What it does | Technical path |
|---|---|
| List all vendors | `GET /Vendor` |
| Get one vendor | `GET /Vendor/{id}` |
| Create a vendor | `POST /Vendor` |
| Get vendor transactions | `GET /vendor/transaction/{page}/{count}` |

---

## Purchase / Vendor Invoices

**What it is:** Bills that come *in* to the company (from vendors). These go through an approval process before being booked.

| What it does | Technical path |
|---|---|
| List unbooked (unapproved) vendor invoices | `GET /vendor/invoice/unprocessed` |
| List booked vendor invoices | `GET /vendor/invoice/processed/page/{page}/{count}` |
| Approve or reject a vendor invoice | `PUT /vendor/invoice/my/approval/{id}` |

---

## Products (Vörur)

**What it is:** The product catalogue — everything the company sells. Includes barcodes, categories, pricing, and stock levels.

| What it does | Technical path | Tested |
|---|---|---|
| Get a page of products | `GET /Product/page/{page}/{count}` | ✅ works |
| Get products modified after date | `GET /Product/modified/{date}/{page}/{size}` | untested |
| Search products | `GET /Product/search/{value}/{max}` | untested |
| Get one product | `GET /Product/{id}` | untested |
| Create a product | `POST /Product` | untested |
| Update a product | `PUT /Product/{id}` | untested |
| Get product groups/categories | `GET /productgroup` | ✅ works |
| Search by barcode | `GET /barcode/{code}` | untested |
| Get barcodes for a product | `GET /Product/{number}/barcode` | untested |

---

## Stock / Inventory

**What it is:** Tracking how many of each product is in stock, moving stock between warehouses, and doing stock counts.

| What it does | Technical path | Tested |
|---|---|---|
| Get product transactions | `GET /product/transaction/{page}/{count}` | untested |
| Transfer products between warehouses | `POST /product/register/transfer` | untested |
| Record inventory count | `POST /product/register/Inventorying` | untested |

---

## General Ledger (Fjárhagur)

**What it is:** The accounting backbone — every financial movement in the company ends up here as a ledger entry. This is the "books."

| What it does | Technical path | Tested |
|---|---|---|
| List all accounts | `GET /generalledger/account` | ✅ works |
| View transactions on an account | `GET /generalledger/account/{id}/transaction/{page}/{count}` | untested |
| List all transactions | `GET /generalledger/transaction/page/{page}/{count}` | ✅ works |
| Create a journal entry (manual booking) | `POST /generalLedger/journal` | untested |

Supports filters on `GET /generalledger/transaction/page/{page}/{count}`: `createdAfter`, `createdBefore`, `dueAfter`, `reference`, `dim1`, `voucher`, `account`.

---

## Payroll (Launagreiðslur)

**What it is:** Employee payslips. Currently read-only — you can view payslips but not create them through the API.

| What it does | Technical path |
|---|---|
| List payslips | `GET /payroll/payslip/{page}/{count}` |

---

## Employees (Starfsmenn)

**What it is:** The people who work at the company. Separate from customers and separate from portal users.

**What you'd use it for:** The Starfsmenn page — listing employees, viewing their details.

| What it does | Technical path |
|---|---|
| List all employees | `GET /general/employee` |
| Get one employee | `GET /general/employee/{number}` |
| Create an employee | `POST /general/employee` |
| Update an employee | `PUT /general/employee/{number}` |
| See their project assignments | `GET /general/employee/{number}/worker` |

**Key fields:**
- `Number` — employee ID (often their kennitala)
- `Name` — full name
- `Status` — 0 means active
- `StampStatus` — whether they're currently clocked in (1) or out (-1)

---

## Timeclock (Stimpilklukka)

**What it is:** Tracks when employees clock in and out. The portal's Stimpilklukka page reads from and writes to this.

| What it does | Technical path | Tested |
|---|---|---|
| Get all timeclock entries | `GET /TimeClock/entries` | ✅ works — returns `[]` on demo |
| See who is currently clocked in | `GET /TimeClock/in` | ✅ works — returns `[]` on demo |
| See who is currently clocked out | `GET /TimeClock/out` | ✅ works — returns `[]` on demo |
| Clock an employee in or out | `POST /TimeClock/stamp/{employee}` | ✅ works — needs a real employee number |
| Get timeclock settings | `GET /TimeClock/settings` | ✅ works — see shape below |
| Map a hostname to a company | `GET /TimeClock/web/config?host=` | ✅ works — see shape below |
| Look up employee by phone number | `GET /TimeClock/Employee?phone=` | ❌ 401 — token lacks permission |
| Get project info for timeclock | `GET /TimeClock/project/{number}?company=` | ⚠️ returns "request is invalid" on demo |
| Force clock out an employee | `POST /TimeClock/quit?company=&employee=` | ⚠️ returns "request is invalid" on demo |
| Register employee stamp | `POST /TimeClock/register/{employee}` | ⚠️ returns server error on demo |
| Register via dkPOS | `POST /TimeClock/dkposregister/{employee}` | ❌ 401 — token lacks permission |

**Settings response shape** (`GET /TimeClock/settings`):
```json
{
  "Enabled": false,
  "Text": 1,
  "Project": 1,
  "Phase": 1,
  "Task": 1,
  "Dim1": 0,
  "Dim2": 0,
  "Dim3": 0,
  "SendToProjectTransaction": false,
  "RoundUpDaytimeAlso": false,
  "RoundFactor": 1
}
```
> Field values (`0` / `1`) appear to be enums — `0` = Disabled, `1` = likely Optional or Enabled. Needs confirmation from DK.
> Settings are **read-only** — `PUT /TimeClock/settings` returns 405.

**Web config response shape** (`GET /TimeClock/web/config?host=<hostname>`):
```json
{
  "Enabled": true,
  "Company": "a89e47c2-5baa-48ff-8da9-3ab512274d19",
  "CompanyName": "Prufufyrirtækið ehf(Demo Dev)"
}
```
> Maps a kiosk hostname to a company. The `host` param is required — calling without it returns 404.
> Currently any host returns the demo company. Used by self-service kiosk terminals to identify themselves.

**Entries query params** (`GET /TimeClock/entries`):

| Param | Type | Description |
|---|---|---|
| `from` | date-time | Stamped in after |
| `to` | date-time | Stamped out before |
| `employee` | string | Filter by employee number |
| `project` | string | Filter by project |
| `phase` | string | Filter by phase |
| `task` | string | Filter by task |
| `dim1/2/3` | string | Dimension filters |

---

## Projects (Verk)

**What it is:** Jobs or projects the company is working on. Employees can log hours against projects. Projects link to invoices and customers.

| What it does | Technical path |
|---|---|
| List all projects | `GET /project` |
| Get one project | `GET /project/{number}` |
| Create a project | `POST /project` |
| Get invoices linked to a project | `GET /project/{number}/invoice` |
| Log hours on a project | `POST /general/employee/{employee}/work` |

---

## Members (Félagar)

**What it is:** For organisations that have *members* rather than customers — like unions or clubs. Members can have fees, grants, fund memberships, and applications.

This section is only relevant if the company uses DK's membership module.

| What it does | Technical path | Tested |
|---|---|---|
| Get a page of members | `GET /member/{page}/{count}` | ✅ works |
| Get one member | `GET /member/{number}` | untested |
| Create a member | `POST /member` | untested |
| Update a member | `PUT /member/{number}` | untested |
| Get member applications | `GET /member/{number}/application` | untested |
| Create a member fee | `POST /member/{number}/fee` | untested |

---

## Search

**What it is:** A global search across all modules. You can search for customers, products, or everything at once.

| What it does | Technical path |
|---|---|
| Search everything | `GET /search` |
| Search customers only | `GET /search/customer` |
| Search products only | `GET /search/product` |

---

## National Registry Lookup

**What it is:** Look up a person or company in the Icelandic national registry (Þjóðskrá) by their kennitala. Useful for auto-filling customer details.

| What it does | Technical path | Tested |
|---|---|---|
| Look up by kennitala | `GET /nation/entry/{kennitala}` | ❌ returns error on LOK-HR — may not be enabled for this company |

---

## Salespersons

**What it is:** The salespeople attached to invoices. Required for creating invoices — an invoice must have a salesperson.

| What it does | Technical path | Tested |
|---|---|---|
| List salespersons | `GET /sales/person/page/{page}/{count}` | ✅ works — Jón and Óðinn already set up |
| Get one salesperson | `GET /sales/person/{number}` | untested |
| Create a salesperson | `POST /sales/person` | untested |
| Update a salesperson | `PUT /sales/person/{number}` | untested |
| Delete a salesperson | `DELETE /sales/person/{number}` | untested |

> Salespersons already exist in LOK-HR so invoice creation should work without any extra setup.

---

## Payment Reference Data

| What it does | Technical path | Tested |
|---|---|---|
| Get payment terms | `GET /general/payment/term` | ✅ works — 8 terms (stgr, lm, d15, d20, d30, m15, m20, post) |
| Get payment modes | `GET /general/payment/mode` | ✅ works — empty on LOK-HR |
| Get sales payment types (POS) | `GET /sales/payment/type` | ✅ works — card types, cash, bank transfer etc. |

---

## WebHooks

**What it is:** Instead of the portal asking "has anything changed?" every few seconds, webhooks let DK *tell* the portal when something changes — like a notification system.

| What it does | Technical path | Tested |
|---|---|---|
| List subscriptions | `GET /admin/webhook` | ✅ works — empty on LOK-HR |
| Create subscription | `POST /admin/webhook` | untested |
| Update subscription | `PUT /admin/webhook/{id}` | untested |
| Delete subscription | `DELETE /admin/webhook/{id}` | untested |
| Test webhook | `POST /admin/webhook/action/test` | untested |

---

## Company Settings

**What it is:** A simple key-value store attached to the company. Useful for saving portal-specific settings that DK doesn't have a field for.

---

## Raw Table Access

**What it is:** Low-level direct access to DK's underlying database tables by name. Very powerful but also dangerous — deleting from a table is permanent.

> **Use with extreme caution.** This is only for advanced cases where no specific endpoint exists.

---

# Test Data in the Test Company

Here's what's currently set up in the test company (LOK - HR):

### Customers
| Name | Email |
|------|-------|
| Jói Test | joi.test@example.is |
| Anna Test Sigurðardóttir | anna.test@example.is |
| Magnús Test Jónsson | magnus.test@example.is |
| Helga Test Björnsdóttir | helga.test@example.is |

### Employees (our team)
| Name | Email |
|------|-------|
| Jón Ágústsson | jonagu@ru.is |
| Óðinn Karl Skúlason | odinnkarl@gmail.com |
| Þóra Xue Reynisdóttir | thora.reynisdottir@gmail.com |
| Ísak Máni Þrastarson | isakmanithrastarson@gmail.com |

---

# Known Limitations

These are things the API *can't* do, or things we haven't been able to figure out:

1. **No support ticket system** — The design shows a support/ticket section but the DK API has no ticket system. Would need a separate integration (e.g. Zoho).

2. **Creating invoices needs a salesperson** — You can't create an invoice through the API unless a salesperson already exists. Jón and Óðinn are already set up as salespersons in LOK-HR so this is no longer a blocker.

3. **No per-user permissions** — The API works with one token per company. There is no way to ask the API what a specific logged-in user is allowed to see. We tested Tokens, Permissions, and MyPages endpoints exhaustively — none of them solve this. Access control is handled in the portal using the `Tag`/Merking field on each employee (see eID Login section).

4. **Products and projects need ERP setup** — Some features (like logging hours on a project) require the project to exist in the DK ERP first. Can't be created entirely through the API.

5. **Kennitala must be valid** — If you include an SSNumber (kennitala) on a customer or member, it must pass Icelandic kennitala validation. You can't use a fake number.

6. **Some v2 endpoints are in beta** — The newer v2 endpoints (especially Purchase Journal) are marked beta and may change or have bugs.

7. **Timeclock phone number management** — `GET /TimeClock/Employee?phone=` exists but returns `401` with our token. There is no known write endpoint for registering or managing employee phone numbers. Needs clarification from DK.

8. **No IP whitelist API** — There is no endpoint for reading or writing IP whitelist rules for the timeclock kiosk. This is likely managed server-side by DK and would need a new endpoint or a different approach.

---

# Error Reference

When something goes wrong, the API always returns a message explaining why:

```json
{ "Message": "Validation error: SSNumber is not a valid kennitala" }
```

**Common status codes:**
- `200` — Everything worked
- `204` — Worked, nothing to return
- `400` — Something was wrong with your request (read the Message)
- `401` — Token is missing or invalid
- `404` — The thing you asked for doesn't exist
