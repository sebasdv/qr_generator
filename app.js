'use strict';

const LOGO_PATH        = 'assets/UAI.svg';
const LOGO_RATIO       = 0.22;
const LOGO_PADDING     = 10;
const LOGO_CORNER_R    = 10;
const QR_DARK_COLOR    = '#000000';
const QR_LIGHT_COLOR   = '#FFFFFF';

const state = {
  mode:       'url',
  size:       300,
  canvasEl:   null,
  qrInstance: null,
};

/* ===== DOM REFS ===== */
const tabUrl       = document.getElementById('tab-url');
const tabText      = document.getElementById('tab-text');
const panelUrl     = document.getElementById('panel-url');
const panelText    = document.getElementById('panel-text');
const inputUrl     = document.getElementById('input-url');
const inputText    = document.getElementById('input-text');
const sizeBtns     = document.querySelectorAll('.size-btn');
const btnGenerate  = document.getElementById('btn-generate');
const btnDownload  = document.getElementById('btn-download');
const qrContainer  = document.getElementById('qr-container');
const qrPlaceholder = document.getElementById('qr-placeholder');
const errorMsg     = document.getElementById('error-msg');

/* ===== INIT ===== */
function init() {
  tabUrl.addEventListener('click', () => setMode('url'));
  tabText.addEventListener('click', () => setMode('text'));

  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => setSize(Number(btn.dataset.size), btn));
  });

  btnGenerate.addEventListener('click', handleGenerate);
  btnDownload.addEventListener('click', handleDownload);

  inputUrl.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleGenerate();
  });
}

/* ===== MODE ===== */
function setMode(mode) {
  state.mode = mode;
  const isUrl = mode === 'url';

  tabUrl.classList.toggle('active', isUrl);
  tabText.classList.toggle('active', !isUrl);
  tabUrl.setAttribute('aria-selected', String(isUrl));
  tabText.setAttribute('aria-selected', String(!isUrl));

  panelUrl.hidden  = !isUrl;
  panelText.hidden = isUrl;

  clearError();
  (isUrl ? inputUrl : inputText).focus();
}

/* ===== SIZE ===== */
function setSize(px, clickedBtn) {
  state.size = px;
  sizeBtns.forEach(b => b.classList.toggle('active', b === clickedBtn));
}

/* ===== INPUT ===== */
function getActiveInput() {
  return state.mode === 'url' ? inputUrl : inputText;
}

function getInputValue() {
  let value = getActiveInput().value.trim();

  if (!value) {
    showError('El campo no puede estar vacío.');
    return null;
  }

  if (state.mode === 'url') {
    if (!/^https?:\/\//i.test(value)) {
      value = 'https://' + value;
    }
    if (value.length < 11) {
      showError('Por favor ingresa una URL válida.');
      return null;
    }
  }

  return value;
}

/* ===== ERROR ===== */
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.hidden = false;
}

function clearError() {
  errorMsg.textContent = '';
  errorMsg.hidden = true;
}

/* ===== GENERATE ===== */
async function handleGenerate() {
  clearError();

  const text = getInputValue();
  if (!text) return;

  setGenerating(true);

  try {
    await renderQR(text, state.size);
    btnDownload.disabled = false;
    btnDownload.removeAttribute('aria-disabled');
  } catch (err) {
    const msg = err.message && err.message.includes('largo')
      ? err.message
      : 'No se pudo generar el QR. Intenta con un texto más corto o un tamaño mayor.';
    showError(msg);
    resetOutput();
  } finally {
    setGenerating(false);
  }
}

function setGenerating(active) {
  btnGenerate.disabled = active;
  btnGenerate.classList.toggle('loading', active);
}

function resetOutput() {
  state.canvasEl = null;
  state.qrInstance = null;
  qrContainer.innerHTML = '';
  qrPlaceholder.hidden = false;
  btnDownload.disabled = true;
  btnDownload.setAttribute('aria-disabled', 'true');
}

/* ===== RENDER QR ===== */
async function renderQR(text, size) {
  qrContainer.innerHTML = '';
  qrPlaceholder.hidden = true;
  state.qrInstance = null;
  state.canvasEl = null;

  state.qrInstance = new QRCode(qrContainer, {
    text:         text,
    width:        size,
    height:       size,
    colorDark:    QR_DARK_COLOR,
    colorLight:   QR_LIGHT_COLOR,
    correctLevel: QRCode.CorrectLevel.H,
  });

  /* wait for qrcodejs to finish all internal async redraws */
  await new Promise(resolve => setTimeout(resolve, 150));

  const canvas = qrContainer.querySelector('canvas');
  if (!canvas) throw new Error('No se generó el canvas QR.');
  state.canvasEl = canvas;

  await overlayLogo(canvas);
}

/* ===== LOGO OVERLAY ===== */
function overlayLogo(canvas) {
  return fetch(LOGO_PATH)
    .then(r => r.blob())
    .then(blob => new Promise(resolve => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        drawLogoOnCanvas(canvas, img);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        drawLogoOnCanvas(canvas, null);
        resolve();
      };
      img.src = url;
    }))
    .catch(() => { drawLogoOnCanvas(canvas, null); });
}

function drawLogoOnCanvas(canvas, img) {
  const ctx       = canvas.getContext('2d');
  const size      = canvas.width;
  const logoSize  = Math.round(size * LOGO_RATIO);
  const totalSize = logoSize + LOGO_PADDING * 2;
  const x         = Math.round((size - totalSize) / 2);
  const y         = Math.round((size - totalSize) / 2);

  ctx.save();

  /* shadow behind white badge */
  ctx.shadowColor = 'rgba(0, 32, 96, 0.18)';
  ctx.shadowBlur  = 8;

  ctx.fillStyle = '#000000';
  roundedRect(ctx, x, y, totalSize, totalSize, LOGO_CORNER_R);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  if (img) {
    /* preserve aspect ratio */
    const ratio = img.naturalWidth / img.naturalHeight;
    let dw = logoSize;
    let dh = logoSize;
    if (ratio > 1) { dh = Math.round(logoSize / ratio); }
    else           { dw = Math.round(logoSize * ratio); }
    const dx = x + LOGO_PADDING + Math.round((logoSize - dw) / 2);
    const dy = y + LOGO_PADDING + Math.round((logoSize - dh) / 2);
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    /* text fallback: UAI / FIC */
    const cx = x + totalSize / 2;
    const cy = y + totalSize / 2;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `bold ${Math.round(logoSize * 0.3)}px Inter, system-ui, sans-serif`;
    ctx.fillText('UAI', cx, cy - Math.round(logoSize * 0.1));

    ctx.fillStyle = '#00afd8';
    ctx.font = `600 ${Math.round(logoSize * 0.19)}px Inter, system-ui, sans-serif`;
    ctx.fillText('FIC', cx, cy + Math.round(logoSize * 0.23));
  }

  ctx.restore();
}

/* ===== CANVAS HELPER ===== */
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ===== DOWNLOAD ===== */
function handleDownload() {
  if (!state.canvasEl) return;

  const dataURL = state.canvasEl.toDataURL('image/png');
  const raw     = getActiveInput().value.trim() || 'qr';
  const slug    = raw.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').substring(0, 30);
  const a       = document.createElement('a');
  a.href        = dataURL;
  a.download    = `QR-UAI-${slug}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ===== START ===== */
document.addEventListener('DOMContentLoaded', init);
