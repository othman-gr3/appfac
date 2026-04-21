import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TVA_RATES, STATUTS_LABELS } from "./constants";

// ── Constants ─────────────────────────────────────────────────

const r2 = (n) => (typeof n === "number" ? Math.round(n * 100) / 100 : 0);

const GREEN  = [45, 106, 79];
const DARK   = [28,  32,  35];
const GRAY   = [100, 106, 115];
const LGRAY  = [160, 165, 172];
const LLGRAY = [240, 241, 238];
const WHITE  = [255, 255, 255];
const RED    = [185,  28,  28];
const AMBER  = [180, 120,  10];

const METHODE_LABELS = {
  "1": "HT + TVA simple",
  "2": "Remise par ligne",
  "3": "Remise globale",
  "4": "TVA par catégorie",
};

// ── Tiny helpers ──────────────────────────────────────────────

/** Draw a thin horizontal rule */
const hRule = (doc, x, y, w, thick = 0.25, color = LLGRAY) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(thick);
  doc.line(x, y, x + w, y);
};

/** Draw a filled rectangle */
const fillRect = (doc, x, y, w, h, color) => {
  doc.setFillColor(...color);
  doc.rect(x, y, w, h, "F");
};

/** Uppercase label then value on same line */
const labelVal = (doc, label, value, lx, vx, y, lColor, vColor, fontSize = 8.5) => {
  doc.setFontSize(fontSize);
  doc.setTextColor(...lColor);
  doc.setFont("helvetica", "normal");
  doc.text(label, lx, y);
  doc.setTextColor(...vColor);
  doc.setFont("helvetica", "bold");
  doc.text(value, vx, y, { align: "right" });
};

// ── Main export ───────────────────────────────────────────────

export const generateInvoicePDF = (facture, client) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const ML = 18;   // margin left
  const MR = 18;   // margin right
  const CW = W - ML - MR;  // content width = 174

  const articles = Array.isArray(facture.articles) ? facture.articles : [];
  const statut   = facture.statut ?? "en_attente";

  // ─────────────────────────────────────────────────────────
  // SECTION 1 — Top accent bar
  // ─────────────────────────────────────────────────────────
  fillRect(doc, 0, 0, W, 4, GREEN);

  // ─────────────────────────────────────────────────────────
  // SECTION 2 — Company block (left) + Invoice meta (right)
  // ─────────────────────────────────────────────────────────
  const hdrY = 14;

  // Company name + tag
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text("AppFac", ML, hdrY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...LGRAY);
  doc.text("Solutions de facturation", ML, hdrY + 5);
  doc.text("contact@appfac.ma  ·  +212 600 000 000", ML, hdrY + 10);
  doc.text("Casablanca, Maroc", ML, hdrY + 15);

  // Invoice title block (right column)
  const metaX = W - MR - 68;
  const metaW = 68;

  // "FACTURE" large title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...GREEN);
  doc.text("FACTURE", W - MR, hdrY, { align: "right" });

  // Invoice number box
  fillRect(doc, metaX, hdrY + 6, metaW, 7, LLGRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text("N° FACTURE", metaX + 3, hdrY + 10.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(facture.numero ?? "—", W - MR - 3, hdrY + 10.5, { align: "right" });

  // Date row
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text("Date d'émission", metaX, hdrY + 19);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(facture.date_creation ?? "—", W - MR, hdrY + 19, { align: "right" });

  // Statut badge
  let badgeFill = AMBER;
  if (statut === "payee")   badgeFill = [22, 101, 52];
  if (statut === "rejetee") badgeFill = RED;

  fillRect(doc, W - MR - 30, hdrY + 23, 30, 6.5, badgeFill);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text(
    (STATUTS_LABELS[statut] ?? statut).toUpperCase(),
    W - MR - 15, hdrY + 27.5,
    { align: "center" }
  );

  // ─────────────────────────────────────────────────────────
  // SECTION 3 — Divider
  // ─────────────────────────────────────────────────────────
  const divY = hdrY + 34;
  hRule(doc, ML, divY, CW, 0.5, GREEN);

  // ─────────────────────────────────────────────────────────
  // SECTION 4 — Bill-from (left) | Bill-to (right)
  // ─────────────────────────────────────────────────────────
  const billingY = divY + 6;
  const colW     = CW / 2 - 6;

  // Left: from
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...GREEN);
  doc.text("DE", ML, billingY + 4);

  hRule(doc, ML, billingY + 6, colW, 0.25, LLGRAY);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("AppFac Entreprise", ML, billingY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("RC: 123456  ·  ICE: 001234567890000", ML, billingY + 17.5);
  doc.text("TVA: 12345678", ML, billingY + 23);
  doc.text("Email: contact@appfac.ma", ML, billingY + 28.5);

  // Right: to
  const toX = ML + colW + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...GREEN);
  doc.text("FACTURÉ À", toX, billingY + 4);

  hRule(doc, toX, billingY + 6, colW, 0.25, LLGRAY);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(client?.nom ?? "Client inconnu", toX, billingY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);

  let clientLineY = billingY + 17.5;
  if (client?.email) {
    doc.text(client.email, toX, clientLineY);
    clientLineY += 5.5;
  }
  if (client?.tel) {
    doc.text(client.tel, toX, clientLineY);
    clientLineY += 5.5;
  }
  if (client?.adresse) {
    const lines = doc.splitTextToSize(client.adresse, colW);
    doc.text(lines, toX, clientLineY);
  }

  // ─────────────────────────────────────────────────────────
  // SECTION 5 — Billing method info bar
  // ─────────────────────────────────────────────────────────
  const methY = billingY + 36;
  fillRect(doc, ML, methY, CW, 7, LLGRAY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text("MÉTHODE DE FACTURATION", ML + 3, methY + 4.5);

  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(
    METHODE_LABELS[facture.methode_facturation] ?? "—",
    ML + 55, methY + 4.5
  );

  if (facture.methode_facturation === "3" && facture.remise_globale) {
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    doc.text("  ·  Remise globale :", ML + 102, methY + 4.5);
    doc.setTextColor(RED[0], RED[1], RED[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`${facture.remise_globale}%`, ML + 138, methY + 4.5);
  }

  // ─────────────────────────────────────────────────────────
  // SECTION 6 — Articles table
  // ─────────────────────────────────────────────────────────
  const tableY = methY + 12;
  const hasRemiseLigne  = facture.methode_facturation === "2";
  const hasRemiseGlobal = facture.methode_facturation === "3";

  const columns = [
    { header: "#",              dataKey: "idx"   },
    { header: "Désignation",    dataKey: "nom"   },
    { header: "Qté",            dataKey: "qty"   },
    { header: "Prix HT unit.",  dataKey: "prix"  },
    { header: "TVA",            dataKey: "tva"   },
    ...(hasRemiseLigne ? [{ header: "Remise", dataKey: "remise" }] : []),
    { header: "Total HT",       dataKey: "total" },
  ];

  const rows = articles.map((art, i) => {
    const tvaRate = TVA_RATES[art.tva_type] ?? 0;
    let ht = (art.prix_ht ?? 0) * (art.quantite ?? 1);
    if (hasRemiseLigne)  ht *= (1 - (art.remise_ligne ?? 0) / 100);
    if (hasRemiseGlobal) ht *= (1 - (facture.remise_globale ?? 0) / 100);

    return {
      idx:    i + 1,
      nom:    art.nom ?? "—",
      qty:    art.quantite ?? 1,
      prix:   `${r2(art.prix_ht).toFixed(2)} DH`,
      tva:    `${(tvaRate * 100).toFixed(0)}%`,
      ...(hasRemiseLigne ? { remise: `${art.remise_ligne ?? 0}%` } : {}),
      total:  `${r2(ht).toFixed(2)} DH`,
    };
  });

  autoTable(doc, {
    startY: tableY,
    columns,
    body: rows,
    theme: "plain",
    headStyles: {
      fillColor: DARK,
      textColor: WHITE,
      fontSize: 7.5,
      fontStyle: "bold",
      cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
      lineWidth: 0,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: DARK,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      lineColor: LLGRAY,
      lineWidth: { bottom: 0.2 },
    },
    alternateRowStyles: {
      fillColor: [249, 249, 247],
    },
    columnStyles: {
      idx:    { halign: "center", cellWidth: 9, textColor: LGRAY },
      qty:    { halign: "center", cellWidth: 12 },
      prix:   { halign: "right",  cellWidth: 28 },
      tva:    { halign: "center", cellWidth: 14 },
      remise: { halign: "center", cellWidth: 18, textColor: RED },
      total:  { halign: "right",  cellWidth: 28, fontStyle: "bold" },
    },
    margin: { left: ML, right: MR },
    tableLineWidth: 0,
  });

  // ─────────────────────────────────────────────────────────
  // SECTION 7 — Totals + Payment (two columns)
  // ─────────────────────────────────────────────────────────
  const afterTable = doc.lastAutoTable.finalY;
  hRule(doc, ML, afterTable, CW, 0.25, LLGRAY);

  const totalsY   = afterTable + 8;
  const totLabelX = ML + colW + 12;
  const totValueX = W - MR;
  const totBlockW = W - MR - totLabelX;

  // ── Payment info (left column) ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...GREEN);
  doc.text("INFORMATIONS DE PAIEMENT", ML, totalsY);

  hRule(doc, ML, totalsY + 2.5, colW, 0.25, LLGRAY);

  const pInfo = [
    ["Mode de paiement",    facture.type_virement       ?? "—"],
    ["Date de dépôt",       facture.date_depot          ?? "—"],
    ["Date d'encaissement", facture.date_encaissement   ?? "—"],
  ];

  pInfo.forEach(([label, val], i) => {
    const py = totalsY + 8 + i * 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...LGRAY);
    doc.text(label, ML, py);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    doc.text(val, ML, py + 4.5);
  });

  // ── Totals (right column) ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...GREEN);
  doc.text("RÉCAPITULATIF", totLabelX, totalsY);

  hRule(doc, totLabelX, totalsY + 2.5, totBlockW, 0.25, LLGRAY);

  let tRowY = totalsY + 9;

  // Remise globale row
  if (hasRemiseGlobal && facture.remise_globale) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(`Remise globale (${facture.remise_globale}%)`, totLabelX, tRowY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...RED);
    doc.text(`−${facture.remise_globale}%`, totValueX, tRowY, { align: "right" });
    tRowY += 7;
  }

  // HT row
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("Total HT", totLabelX, tRowY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(`${r2(facture.total_ht).toFixed(2)} DH`, totValueX, tRowY, { align: "right" });
  tRowY += 7;

  // TVA row
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text("TVA", totLabelX, tRowY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(`${r2(facture.tva).toFixed(2)} DH`, totValueX, tRowY, { align: "right" });
  tRowY += 4;

  hRule(doc, totLabelX, tRowY, totBlockW, 0.5, DARK);
  tRowY += 5;

  // TTC — green filled block
  fillRect(doc, totLabelX - 2, tRowY - 1, totBlockW + 2, 9, GREEN);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text("TOTAL TTC", totLabelX + 1, tRowY + 5.5);
  doc.setFontSize(11);
  doc.text(`${r2(facture.total_ttc).toFixed(2)} DH`, totValueX - 1, tRowY + 5.5, { align: "right" });

  // ─────────────────────────────────────────────────────────
  // SECTION 8 — Signature boxes
  // ─────────────────────────────────────────────────────────
  const sigY = tRowY + 18;
  const sigW = 72;

  const drawSigBox = (x, label) => {
    doc.setDrawColor(...LLGRAY);
    doc.setLineWidth(0.4);
    doc.rect(x, sigY, sigW, 25);

    // top label band
    fillRect(doc, x, sigY, sigW, 7, LLGRAY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(label, x + sigW / 2, sigY + 4.5, { align: "center" });

    // signature line
    doc.setDrawColor(...LGRAY);
    doc.setLineWidth(0.25);
    doc.line(x + 6, sigY + 21, x + sigW - 6, sigY + 21);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...LGRAY);
    doc.text("Signature et cachet", x + sigW / 2, sigY + 24, { align: "center" });
  };

  drawSigBox(ML, "SIGNATURE ÉMETTEUR");
  drawSigBox(ML + sigW + 10, "SIGNATURE CLIENT");

  // ─────────────────────────────────────────────────────────
  // SECTION 9 — Notes / legal footer text
  // ─────────────────────────────────────────────────────────
  const noteY = sigY + 30;
  if (noteY < H - 22) {
    hRule(doc, ML, noteY, CW, 0.25, LLGRAY);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(...LGRAY);
    doc.text(
      "Ce document est une facture officielle. Tout paiement doit être effectué dans les délais convenus.",
      ML, noteY + 5
    );
    doc.text(
      "En cas de litige, veuillez contacter contact@appfac.ma.",
      ML, noteY + 9.5
    );
  }

  // ─────────────────────────────────────────────────────────
  // SECTION 10 — Bottom footer band
  // ─────────────────────────────────────────────────────────
  fillRect(doc, 0, H - 14, W, 14, DARK);

  // Left: company
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(170, 175, 170);
  doc.text("AppFac · contact@appfac.ma · +212 600 000 000", ML, H - 6);

  // Center: invoice ref
  doc.setTextColor(120, 125, 120);
  doc.text(facture.numero ?? "", W / 2, H - 6, { align: "center" });

  // Right: page
  doc.setTextColor(170, 175, 170);
  doc.text("Page 1 / 1", W - MR, H - 6, { align: "right" });

  // Bottom green accent line
  fillRect(doc, 0, H - 2.5, W, 2.5, GREEN);

  // ── Save ─────────────────────────────────────────────────
  doc.save(`${facture.numero ?? "facture"}.pdf`);
};
