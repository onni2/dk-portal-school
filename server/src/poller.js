const pool = require("./db");
const { notifyCompany } = require("./notifications");

const DK_API = "https://api.dkplus.is/api/v1";
const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Last seen max invoice ID per company: { [companyId]: number }
const lastSeenId = {};

async function fetchMaxInvoiceId(dkToken) {
  const res = await fetch(`${DK_API}/customer/transaction/page/1/100`, {
    headers: { Authorization: `Bearer ${dkToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return Math.max(...data.map((t) => t.ID));
}

async function checkInvoices() {
  let companies;
  try {
    const { rows } = await pool.query(
      "SELECT id, name, dk_token FROM companies WHERE dk_token IS NOT NULL",
    );
    companies = rows;
  } catch (err) {
    console.error("[Poller] DB error fetching companies:", err.message);
    return;
  }

  for (const company of companies) {
    try {
      const maxId = await fetchMaxInvoiceId(company.dk_token);
      if (maxId === null) continue;

      const prev = lastSeenId[company.id];

      if (prev === undefined) {
        // First run — just record, don't notify
        lastSeenId[company.id] = maxId;
        continue;
      }

      if (maxId > prev) {
        const newCount = maxId - prev;
        lastSeenId[company.id] = maxId;

        const message =
          newCount === 1
            ? "Nýr reikningur hefur borist."
            : `${newCount} nýir reikningar hafa borist.`;

        await notifyCompany(company.id, "Nýr reikningur", message);
        console.log(`[Poller] ${newCount} new invoice(s) for ${company.name}`);
      }
    } catch (err) {
      console.error(`[Poller] Error checking invoices for ${company.name}:`, err.message);
    }
  }
}

function startPoller() {
  // Run once shortly after startup, then on interval
  setTimeout(() => {
    void checkInvoices();
    setInterval(() => { void checkInvoices(); }, INTERVAL_MS);
  }, 10_000); // 10s delay so DB is ready

  console.log("[Poller] Invoice poller started (5 min interval)");
}

module.exports = { startPoller };
