(() => {
  const host = document.getElementById("site-nav");
  if (!host) return;

  const path = (window.location.pathname || "").toLowerCase();
  const onHome = path.endsWith("/") || path.endsWith("/index.html") || path.endsWith("\\index.html");
  const onNews = path.endsWith("/news.html") || path.endsWith("\\news.html");
  const onPublications = path.endsWith("/publications.html") || path.endsWith("\\publications.html");

  const home = (anchor) => onHome ? `#${anchor}` : `index.html#${anchor}`;

  const links = [
    ["About", onHome ? "#top" : "index.html#top", "top"],
    ["Research", home("research"), "research"],
    ["News", onNews ? "news.html" : home("news"), "news"],
    ["Members", home("members"), "members"],
    ["Publications", onPublications ? "publications.html" : (onHome ? "#publications" : "index.html#publications"), "publications"],
    ["Collaboration", home("collaboration"), "collaboration"],
    ["Demos", home("videos"), "videos"],
    ["Alumni", home("alumni"), "alumni"]
  ];

  function activeKey() {
    if (onNews) return "news";
    if (onPublications) return "publications";
    if (!onHome) return "";
    const hash=(window.location.hash||"#top").slice(1) || "top";
    return ["research","news","members","collaboration","videos","publications","alumni"].includes(hash) ? hash : "top";
  }

  const render = () => {
    const active=activeKey();
    const menu = links
      .map(([label, href, key]) => {
        const isActive=key===active;
        return `<a href="${href}"${isActive?' class="active" aria-current="page"':''}>${label}</a>`;
      })
      .join("");

    host.innerHTML = `
      <header class="site-header">
        <div class="brand-bar">
          <div class="wrap brand-inner">
            <a class="brand" href="index.html">
              <img class="brand-logo" src="images/logos/ufsc-brasao.png" alt="Universidade Federal de Santa Catarina">
              <span class="brand-copy">
                <span class="brand-name">GSAI</span>
                <span class="brand-subtitle">Intelligent Autonomous Systems Group</span>
                <span class="brand-affiliation">EAS · Federal University of Santa Catarina</span>
              </span>
            </a>
          </div>
        </div>
        <nav class="nav" aria-label="Primary navigation">
          <div class="wrap inner">
            <div class="menu-shell"><div class="menu">${menu}</div></div>
          </div>
        </nav>
      </header>`;
  };

  render();
  if (onHome) window.addEventListener("hashchange", render);
})();