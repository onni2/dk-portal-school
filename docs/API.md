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
| Employee list | `/general/employee` | Starfsmenn page |
| Timeclock | `/TimeClock/in`, `/TimeClock/out`, `/TimeClock/stamp/{employee}` | Stimpilklukka |
| Customer transactions | `/customer/transaction/page/1/100` | Reikningar page |
| Invoice PDF | `/sales/invoice/{number}/pdf` | Downloading invoices |
| Customer list | `/Customer` | Viðskiptavinir page |
| Portal users | `/mypages/users`, `/mypages/invites` | Notendur page |

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

| What it does | Technical path |
|---|---|
| List all tokens for the company | `GET /Token` |
| Get the employee linked to a user+company | `GET /Token/{userID}/{companyID}` |
| Create a new token | `POST /Token` |
| Delete a token | `DELETE /Token/{id}` |
| Get request logs for a token | `GET /token/report/logs` |
| Download usage report as PDF | `GET /token/report/usage/pdf` |

---

## Portal Users (MyPages / Notendur)

**What it is:** The list of people who have been given access to log into *this portal* (Mínar síður). This is separate from employees or customers — it's specifically about who can use this website.

**What you'd use it for:** The Notendur page — admins can invite new people, see who has access, and remove access.

| What it does | Technical path |
|---|---|
| See who has portal access | `GET /mypages/users` |
| Remove someone's access | `DELETE /mypages/users/{userId}` |
| Update which customers a user can see | `PUT /mypages/users/{userId}` |
| See pending invites (not yet accepted) | `GET /mypages/invites` |
| Invite someone to the portal | `POST /mypages/invites` |
| Cancel an invite | `DELETE /mypages/invites/{id}` |

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

| What it does | Technical path |
|---|---|
| List all products | `GET /Product` |
| Get product count | `GET /Product/info/count` |
| Search products | `GET /Product/search/{value}/{max}` |
| Get one product | `GET /Product/{id}` |
| Create a product | `POST /Product` |

---

## Stock / Inventory

**What it is:** Tracking how many of each product is in stock, moving stock between warehouses, and doing stock counts.

---

## General Ledger (Fjárhagur)

**What it is:** The accounting backbone — every financial movement in the company ends up here as a ledger entry. This is the "books."

| What it does | Technical path |
|---|---|
| List all accounts | `GET /generalledger/account` |
| View transactions on an account | `GET /generalledger/account/{id}/transaction/{page}/{count}` |
| Create a journal entry (manual booking) | `POST /generalLedger/journal` |
| List all transactions | `GET /generalledger/transaction/page/{page}/{count}` |

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

| What it does | Technical path |
|---|---|
| Get all timeclock entries | `GET /TimeClock/entries` |
| See who is currently clocked in | `GET /TimeClock/in` |
| See who is currently clocked out | `GET /TimeClock/out` |
| Clock an employee in or out | `POST /TimeClock/stamp/{employee}` |
| Get timeclock settings | `GET /TimeClock/settings` |

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

| What it does | Technical path |
|---|---|
| Look up by kennitala | `GET /nation/entry/{kennitala}` |

---

## WebHooks

**What it is:** Instead of the portal asking "has anything changed?" every few seconds, webhooks let DK *tell* the portal when something changes — like a notification system.

Not currently used in this project.

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

2. **Creating invoices needs a salesperson** — You can't create an invoice through the API unless a salesperson already exists in the DK ERP system. Has to be set up there manually.

3. **No per-user permissions** — The API works with one token per company. It doesn't have a concept of "this user can only see invoices, not employees." Access control has to be built into the portal itself.

4. **Products and projects need ERP setup** — Some features (like logging hours on a project) require the project to exist in the DK ERP first. Can't be created entirely through the API.

5. **Kennitala must be valid** — If you include an SSNumber (kennitala) on a customer or member, it must pass Icelandic kennitala validation. You can't use a fake number.

6. **Some v2 endpoints are in beta** — The newer v2 endpoints (especially Purchase Journal) are marked beta and may change or have bugs.

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
