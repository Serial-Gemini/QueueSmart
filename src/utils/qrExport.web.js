import QRCode from "qrcode";

export const canExportQr = true;

export const makeQrPng = (text) =>
  QRCode.toDataURL(text, { width: 1024, margin: 2, errorCorrectionLevel: "M" });

export function downloadPng(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function printPng(url, title, subtitle) {
  const w = window.open("", "_blank");
  if (!w) throw new Error("Your browser blocked the print window. Allow popups for this site and try again.");
  w.document.write(
    `<!doctype html><html><head><title>${esc(title)}</title><style>
      body{font-family:Arial,sans-serif;text-align:center;padding:40px;color:#004D2C}
      h1{margin:0 0 4px}p{color:#555}img{width:380px;height:380px;margin-top:24px}
    </style></head><body><h1>${esc(title)}</h1><p>${esc(subtitle)}</p>
    <img src="${url}" onload="window.focus();window.print()" /></body></html>`
  );
  w.document.close();
}