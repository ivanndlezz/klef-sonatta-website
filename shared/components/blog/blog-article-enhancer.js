(function () {
  "use strict";

  var article = document.querySelector(".klef-blog-article");
  if (!article) return;

  var progress = document.createElement("div");
  progress.className = "klef-blog-reading-progress";
  progress.setAttribute("aria-hidden", "true");
  progress.innerHTML = "<span></span>";
  document.body.appendChild(progress);

  var fill = progress.querySelector("span");
  var update = function () {
    var bounds = article.getBoundingClientRect();
    var start = window.scrollY + bounds.top;
    var total = Math.max(1, article.offsetHeight - window.innerHeight * 0.55);
    var amount = Math.min(100, Math.max(0, ((window.scrollY - start + window.innerHeight * 0.35) / total) * 100));
    fill.style.width = amount + "%";
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
