// /utilities/icon-loader.js
/*
Icon loader es el sistema preferencial, principal y mas eficiente para la utilización de iconos en
*/

function constructIcons(route) {
  (function () {
    if (document.getElementById("svg-symbols")) return;

    fetch(route)
      .then((res) => res.text())
      .then((svg) => {
        const div = document.createElement("div");
        div.style.display = "none";
        div.innerHTML = svg;
        div.id = "svg-symbols";
        document.body.prepend(div);
      })
      .catch((err) => console.error("Icon symbols load error", err));
  })();
}

// Cargar el set de iconos principal por defecto
//constructIcons("/assets/icons/symbols-svg.html");
