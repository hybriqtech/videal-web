const fs = require("fs");
const path = require("path");

// Cache-busting: versión basada en la fecha de modificación del CSS fuente.
// Cuando style.css cambia, cambia ?v=... y el navegador no reutiliza la copia
// cacheada (causa habitual de ver estilos rancios en el dev server).
module.exports = () => {
  let cssV = Date.now();
  try {
    cssV = Math.floor(fs.statSync(path.join(__dirname, "..", "css", "style.css")).mtimeMs);
  } catch (e) {
    /* si no existe aún, usamos el timestamp actual */
  }
  return { cssV };
};
