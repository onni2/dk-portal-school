import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CustomerTransaction } from "../types/invoices.types";

function fmt(amount: number, currency: string): string {
  return amount.toLocaleString("is-IS") + " " + (currency || "ISK");
}

function fmtDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("is-IS");
}

/** Generates and downloads an "HREYFINGAR SKULDUNAUTA" PDF for the given transactions. */
export function downloadInvoicesPdf(
  transactions: CustomerTransaction[],
  dateFrom: string,
  dateTo: string,
  companyName: string,
): void {
  if (transactions.length === 0) return;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Download timestamp shown in header
  const now = new Date();
  const nowStr =
    now.toLocaleDateString("is-IS") +
    " " +
    now.toLocaleTimeString("is-IS", { hour: "2-digit", minute: "2-digit" });

  // Sort chronologically so the running balance is meaningful
  const sorted = [...transactions].sort(
    (a, b) =>
      new Date(a.JournalDate).getTime() - new Date(b.JournalDate).getTime(),
  );

  // ── Period label ─────────────────────────────────────────────────────────
  // Use filter values when set; otherwise fall back to the actual data range.
  const fromStr = dateFrom
    ? fmtDate(dateFrom + "T00:00:00")
    : fmtDate(sorted[0].JournalDate);
  const toStr = dateTo
    ? fmtDate(dateTo + "T00:00:00")
    : fmtDate(sorted[sorted.length - 1].JournalDate);
  const periodMsg = `Valið var að prenta út hreyfingar fyrir tímabilið ${fromStr} til ${toStr}`;

  // ── Running balance + data rows ──────────────────────────────────────────
  let running = 0;
  const dataRows = sorted.map((tx) => {
    running += tx.Amount;
    return [
      fmtDate(tx.JournalDate),
      tx.InvoiceNumber || "",
      fmtDate(tx.DueDate),
      tx.Voucher || "",
      tx.Text,
      tx.Amount >= 0 ? fmt(tx.Amount, tx.Currency) : "",
      tx.Amount < 0 ? fmt(Math.abs(tx.Amount), tx.Currency) : "",
      fmt(running < 0 ? 0 : running, tx.Currency),
    ];
  });

  // ── Totals ───────────────────────────────────────────────────────────────
  let totalDebit = 0;
  let totalCredit = 0;
  sorted.forEach((tx) => {
    if (tx.Amount >= 0) totalDebit += tx.Amount;
    else totalCredit += Math.abs(tx.Amount);
  });
  const netBalance = Math.max(0, totalDebit - totalCredit);
  const primaryCurrency = sorted[0].Currency || "ISK";

  // ── Page header (company name + timestamp left, title centered) ──────────
  // Called for page 1 directly and via didDrawPage for subsequent pages.
  function drawPageHeader() {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(companyName || "", 14, 10);
    doc.text(nowStr, 14, 15);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("HREYFINGAR SKULDUNAUTA", pageW / 2, 13, { align: "center" });

    // thin rule below header
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(14, 19, pageW - 14, 19);
  }

  drawPageHeader();

  // ── Table ────────────────────────────────────────────────────────────────
  // margin.top: 24 keeps the table below the header on ALL pages (not just page 1)
  autoTable(doc, {
    startY: 22,
    margin: { top: 22, left: 14, right: 14 },
    head: [
      ["Dagsetn.", "Rnúmer", "Eindagi", "Fylgisk.", "Texti", "Debet", "Kredit", "Staða"],
    ],
    body: [
      // Period message spans all columns
      [{ content: periodMsg, colSpan: 8, styles: { fontStyle: "italic" as const, textColor: [80, 80, 80] as [number, number, number], fillColor: [245, 246, 248] as [number, number, number] } }],
      ...dataRows,
      // Subtotal row
      [
        { content: "Samtals hreyfing:", colSpan: 5, styles: { fontStyle: "bold" as const, fillColor: [220, 224, 232] as [number, number, number] } },
        { content: fmt(totalDebit, primaryCurrency),  styles: { fontStyle: "bold" as const, halign: "right" as const, fillColor: [220, 224, 232] as [number, number, number] } },
        { content: fmt(totalCredit, primaryCurrency), styles: { fontStyle: "bold" as const, halign: "right" as const, fillColor: [220, 224, 232] as [number, number, number] } },
        { content: fmt(netBalance, primaryCurrency),  styles: { fontStyle: "bold" as const, halign: "right" as const, fillColor: [220, 224, 232] as [number, number, number] } },
      ],
    ],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 24 },
      2: { cellWidth: 22 },
      3: { cellWidth: 26 },
      4: { cellWidth: "auto" },
      5: { cellWidth: 30, halign: "right" },
      6: { cellWidth: 30, halign: "right" },
      7: { cellWidth: 30, halign: "right" },
    },
    // Redraw header + add page number on every page
    didDrawPage: (data) => {
      if (data.pageNumber > 1) drawPageHeader();

      // Page number at bottom center
      const total = doc.internal.pages.length - 1;
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(`${data.pageNumber} / ${total}`, pageW / 2, pageH - 6, {
        align: "center",
      });
    },
  });

  // ── Save ──────────────────────────────────────────────────────────────────
  const from = dateFrom || fromStr.replace(/\./g, "-");
  const to   = dateTo   || toStr.replace(/\./g, "-");
  doc.save(`reikningar-${from}-${to}.pdf`);
}
