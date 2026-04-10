// PygHTML
// ------
// Runs real pygame in the browser using the vendored pygame-web "archives" bundle.
//
// This is intentionally thin glue:
// - creates a <script type="module" src=".../pythons.js" id="site"> tag
// - injects Python source into that tag's textContent (pythons.js reads it)
// - optionally fetches Python from a URL first

const DEFAULT_ARCHIVE_VERSION = "0.9";
const DEFAULT_PYTHON = "python312";
const DEFAULT_OS = "gui,fs,snd";

function mustBeDefined(value, name) {
  if (value === null || value === undefined) {
    throw new Error(`PygHTML: missing required option: ${name}`);
  }
  return value;
}

function resolveCanvas(canvasOrSelector) {
  if (!canvasOrSelector) return null;
  if (canvasOrSelector instanceof HTMLCanvasElement) return canvasOrSelector;
  if (typeof canvasOrSelector === "string") {
    const el = document.querySelector(canvasOrSelector);
    if (!el) throw new Error(`PygHTML: canvas not found: ${canvasOrSelector}`);
    if (!(el instanceof HTMLCanvasElement)) {
      throw new Error(`PygHTML: selector is not a <canvas>: ${canvasOrSelector}`);
    }
    return el;
  }
  throw new Error("PygHTML: canvas must be a <canvas> or a selector string");
}

function resolveCode(scriptOrSelectorOrCode) {
  if (typeof scriptOrSelectorOrCode === "string") {
    // If it's a selector to a <script>, use it. Otherwise treat as raw code.
    const el = document.querySelector(scriptOrSelectorOrCode);
    if (el instanceof HTMLScriptElement) return el.textContent ?? "";
    return scriptOrSelectorOrCode;
  }
  if (scriptOrSelectorOrCode instanceof HTMLScriptElement) return scriptOrSelectorOrCode.textContent ?? "";
  throw new Error("PygHTML: python must be a string, <script>, or a selector");
}

function pythonsUrl(archiveVersion) {
  // Keep everything self-hostable by resolving relative to this module.
  return new URL(`./engine/vendor/archives/${archiveVersion}/pythons.js`, import.meta.url).toString();
}

function ensureCanvasInBody(canvas) {
  if (!canvas) return;
  if (canvas.isConnected) return;
  document.body.appendChild(canvas);
}

function removeOldSiteScript() {
  const old = document.getElementById("site");
  if (old) old.remove();
}

function wrapPythonForPythonsJs(code) {
  // pythons.js expects to read Python source out of the script tag text.
  // The "#<!--" / "#-->" markers match the upstream templates.
  return `#<!--\n${code.trim()}\n#-->\n`;
}

async function fetchText(url) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`PygHTML: failed to fetch ${url} (${res.status})`);
  return await res.text();
}

export const PygHTML = {
  async autorun(opts = {}) {
    const archiveVersion = opts.archiveVersion ?? DEFAULT_ARCHIVE_VERSION;
    const python = opts.python ?? DEFAULT_PYTHON;
    const os = opts.os ?? DEFAULT_OS;

    const canvas = resolveCanvas(opts.canvas ?? null);
    ensureCanvasInBody(canvas);
    if (canvas) canvas.dataset.pyghtml = "1";

    let code = "";
    if (opts.pyUrl) {
      code = await fetchText(String(opts.pyUrl));
    } else if (opts.py) {
      code = resolveCode(opts.py);
    } else if (opts.python) {
      code = resolveCode(opts.python);
    } else {
      // Back-compat: common attribute used by the examples.
      const el = document.querySelector('script[type="text/pyghtml"][data-pyghtml]');
      if (el instanceof HTMLScriptElement) code = el.textContent ?? "";
    }

    code = mustBeDefined(code, "python code (py / pyUrl)");
    if (!code.trim()) throw new Error("PygHTML: python code is empty");

    removeOldSiteScript();

    const site = document.createElement("script");
    site.id = "site";
    site.type = "module";
    site.async = true;
    site.defer = true;
    site.src = pythonsUrl(archiveVersion);
    site.dataset.python = String(python);
    site.dataset.os = String(os);
    site.text = wrapPythonForPythonsJs(code);

    document.head.appendChild(site);
  },
};

