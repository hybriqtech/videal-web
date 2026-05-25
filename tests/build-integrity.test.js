const { test } = require("node:test");
const assert = require("node:assert");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const SITE = path.join(__dirname, "..", "_site");
const read = (p) => fs.readFileSync(path.join(SITE, p), "utf8");

test("el build genera _site/index.html", () => {
  execSync("npx eleventy", { cwd: path.join(__dirname, "..") });
  assert.ok(fs.existsSync(path.join(SITE, "index.html")), "falta index.html");
});

test("la home no contiene artefactos de Cloudflare", () => {
  const html = read("index.html");
  assert.ok(!html.includes("cdn-cgi"), "queda un cdn-cgi");
  assert.ok(!html.includes("__cf_email__"), "queda un __cf_email__");
});

test("la home expone el contacto institucional real", () => {
  const html = read("index.html");
  assert.ok(html.includes("videalasociacion@gmail.com"), "falta el email");
  assert.ok(html.includes("649 65 38 04"), "falta el teléfono institucional");
});

test("no se publican móviles personales de facilitadoras", () => {
  const html = read("index.html");
  for (const tel of ["687 92 63 86", "669 34 51 75", "658 97 07 83", "622 23 82 85", "690 35 34 21", "680 98 53 62", "605 26 30 67"]) {
    assert.ok(!html.includes(tel), `móvil personal filtrado: ${tel}`);
  }
});

test("existen las páginas stub", () => {
  for (const p of ["quienes-somos", "actividades", "programas", "hazte-socio", "contacto"]) {
    assert.ok(fs.existsSync(path.join(SITE, p, "index.html")), `falta /${p}/`);
  }
});

test("la home renderiza las 12 actividades", () => {
  const html = read("index.html");
  const n = (html.match(/class="act"/g) || []).length;
  assert.strictEqual(n, 12, `esperaba 12 actividades, hay ${n}`);
});
