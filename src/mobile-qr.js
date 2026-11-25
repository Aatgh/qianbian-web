import QRCode from "qrcode";

function render(payload, canvas) {
  return QRCode.toCanvas(canvas, String(payload || ""), {
    width: 176,
    margin: 1,
    color: {
      dark: "#17201d",
      light: "#ffffff",
    },
  });
}

window.QianbianQR = Object.freeze({ render });
