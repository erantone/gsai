(() => {
  const host = document.getElementById("site-nav");
  if (!host) return;

  const path = (window.location.pathname || "").toLowerCase();
  const onHome = path.endsWith("/") || path.endsWith("/index.html") || path.endsWith("\\index.html");
  const onPublications = path.endsWith("/publications.html") || path.endsWith("\\publications.html");

  const home = (anchor) => onHome ? `#${anchor}` : `index.html#${anchor}`;

  const links = [
    ["About", home("about")],
    ["Research", home("research")],
    ["News", home("news")],
    ["Members", home("members")],
    ["Collaboration", home("collaboration")],
    ["Research demos", home("videos")],
    ["Publications", onHome ? "#publications" : (onPublications ? "publications.html" : "index.html#publications")],
    ["Alumni", home("alumni")]
  ];

  const menu = links
    .map(([label, href]) => `<a href="${href}">${label}</a>`)
    .join("");

  host.innerHTML = `
    <nav class="nav">
      <div class="wrap inner">
        <a class="brand" href="index.html">GSAI · UFSC</a>
        <div class="menu">${menu}</div>
      </div>
    </nav>`;
})();