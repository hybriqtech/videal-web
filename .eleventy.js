const fs = require("fs");
const path = require("path");
const { HtmlBasePlugin } = require("@11ty/eleventy");

// Minificador CSS conservador (basado en el de CLN): quita comentarios no-bang,
// colapsa whitespace y espacios junto a delimitadores. No toca strings ni los
// operadores + / ~ (preservarlos es necesario para que calc()/clamp() sigan
// siendo válidos: en calc() el + exige espacios alrededor).
function minifyCss(css) {
  return css
    .replace(/\/\*(?!\!)[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

module.exports = function (eleventyConfig) {
  // CSS: minificar al copiar al output (la fuente en src/ queda legible)
  eleventyConfig.on("eleventy.before", () => {
    const srcDir = path.join(__dirname, "src", "css");
    const outDir = path.join(__dirname, "_site", "css");
    if (!fs.existsSync(srcDir)) return;
    fs.mkdirSync(outDir, { recursive: true });
    for (const f of fs.readdirSync(srcDir)) {
      if (!f.endsWith(".css")) continue;
      const raw = fs.readFileSync(path.join(srcDir, f), "utf8");
      fs.writeFileSync(path.join(outDir, f), minifyCss(raw));
    }
  });

  // Reescribe rutas absolutas (/css, /img, /quienes-somos…) anteponiendo el
  // pathPrefix, para que la web funcione bajo el subdirectorio de GitHub Pages.
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  // El CSS se minifica en el hook eleventy.before (no es passthrough), así que
  // hay que vigilarlo explícitamente para que `--serve` recompile y recargue
  // el navegador al editar estilos. Sin esto, el dev server sirve CSS rancio.
  eleventyConfig.addWatchTarget("src/css");

  // Filtro de fechas en español (para uso futuro en eventos)
  eleventyConfig.addFilter("fechaEs", function (dateVal) {
    const meses = ["enero","febrero","marzo","abril","mayo","junio",
                   "julio","agosto","septiembre","octubre","noviembre","diciembre"];
    const d = dateVal instanceof Date ? dateVal : new Date(dateVal + "T00:00:00");
    return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    pathPrefix: "/videal-web/",
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};

module.exports.minifyCss = minifyCss;
