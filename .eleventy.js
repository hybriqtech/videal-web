const fs = require("fs");
const path = require("path");

// Minificador CSS conservador (idéntico al de CLN): quita comentarios no-bang,
// colapsa whitespace y espacios junto a delimitadores. No toca strings.
function minifyCss(css) {
  return css
    .replace(/\/\*(?!\!)[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
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

  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  // Filtro de fechas en español (para uso futuro en eventos)
  eleventyConfig.addFilter("fechaEs", function (dateVal) {
    const meses = ["enero","febrero","marzo","abril","mayo","junio",
                   "julio","agosto","septiembre","octubre","noviembre","diciembre"];
    const d = dateVal instanceof Date ? dateVal : new Date(dateVal + "T00:00:00");
    return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};

module.exports.minifyCss = minifyCss;
