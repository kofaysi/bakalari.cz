// ==UserScript==
// @name         Simple cell highlighter (leaf cells only)
// @namespace    https://github.com/kofaysi/bakalari.cz/blob/main/bakalari-cz_cell_highlighter.user.js
// @version      0.3
// @description  Highlight only "leaf" table cells (td/th) that directly contain the matched text, not parent container cells that only contain nested tables.
// @match        https://*/next/zmeny.aspx*
// @grant        none
// @author       https://github.com/kofaysi
// @run-at       document-idle
// ==/UserScript==

(() => {
  "use strict";

  // ===== USER CONFIG =====
  const RULES = [
    { text: "1.V", color: "#ff9500" },
    //{ text: "Fousová", color: "#34c759" },
    //{ text: "odpadá", color: "#ff3b30" },
  ];
  const IGNORE_CASE = true;

  // ===== HELPERS =====
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
  const prep = (s) => (IGNORE_CASE ? norm(s).toLowerCase() : norm(s));

  const rules = RULES
    .map(r => ({ ...r, needle: prep(r.text) }))
    .filter(r => r.needle.length > 0);

  // Only highlight cells where the match exists in the cell's OWN text,
  // excluding text coming from nested tables inside the cell.
  function ownTextOnly(cell) {
    let out = "";
    for (const n of cell.childNodes) {
      if (n.nodeType === Node.TEXT_NODE) out += n.nodeValue;
      // include non-table element text, but skip anything inside nested TABLEs
      if (n.nodeType === Node.ELEMENT_NODE) {
        const el = /** @type {Element} */ (n);
        if (el.tagName === "TABLE") continue;
        out += el.innerText || el.textContent || "";
      }
    }
    return prep(out);
  }

  // Extra guard: if a cell contains a nested table, it is usually a "container" cell
  // and should not be highlighted for matches coming from inside that table.
  function isContainerCell(cell) {
    return !!cell.querySelector(":scope table");
  }

  document.querySelectorAll("td, th").forEach(cell => {
    const hayOwn = ownTextOnly(cell);

    for (const r of rules) {
      if (!hayOwn.includes(r.needle)) continue;

      // If it's a container cell with nested tables, allow highlight ONLY if the container
      // itself contains the text outside the nested table (hayOwn already enforces that).
      // So no extra logic needed, but we keep the guard for clarity:
      if (isContainerCell(cell) && !hayOwn.includes(r.needle)) continue;

      cell.style.setProperty("box-shadow", `inset 0 0 0 9999px ${r.color}`, "important");
      break;
    }
  });
})();
