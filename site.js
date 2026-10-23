(() => {
  const esc = (s) => String(s ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const load = (url) => fetch(url, { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error(`${url}: ${r.status}`); return r.json(); });
  const groupBy = (items, key) => items.reduce((m,x) => ((m[x[key]] ||= []).push(x), m), {});

  async function renderNews() {
    const host=document.getElementById('news-content'); if(!host) return;
    const data=(await load('data/news.json')).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    const latest=data.slice(0,3);
    host.innerHTML=`<div class="news-list">${latest.map(n=>`
      <article class="news-summary-card">
        <div class="label">${esc(n.label)}</div>
        <h3><a href="news.html#${esc(n.slug)}">${esc(n.title)}</a></h3>
        <p class="muted">${esc(n.summary||'')}</p>
        <a class="news-read-more" href="news.html#${esc(n.slug)}">Read more →</a>
      </article>`).join('')}</div>${data.length>3?'<div class="news-all-link"><a href="news.html">View all news →</a></div>':''}`;
  }

  async function renderNewsPage() {
    const host=document.getElementById('all-news-content'); if(!host) return;
    const data=(await load('data/news.json')).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    host.innerHTML=`<div class="news-stack">${data.map(n=>`
      <article class="news-card${n.type==='conference'?' featured-news':''}" id="${esc(n.slug||'')}">
        <div class="label">${esc(n.label)}</div>
        <h2 class="news-full-title">${esc(n.title)}</h2>
        ${n.heroImage?`<img class="news-hero" src="${esc(n.heroImage)}" alt="${esc(n.heroAlt||n.title)}">`:''}
        <div class="news-copy">
          ${(n.paragraphs||[]).map(p=>`<p class="muted">${esc(p)}</p>`).join('')}
          ${(n.paragraphsHtml||[]).map(p=>`<p class="muted">${p}</p>`).join('')}
        </div>
        ${n.gallery?.length?`<div class="news-gallery">${n.gallery.map(g=>`<figure><img src="${esc(g.src)}" alt="${esc(g.alt||'')}"><figcaption>${esc(g.caption||'')}</figcaption></figure>`).join('')}</div>`:''}
        ${n.meta?.length?`<div class="news-meta">${n.meta.map(m=>`<div class="box"><strong>${esc(m.label)}</strong><br>${esc(m.value)}</div>`).join('')}</div>`:''}
        ${n.related?.length?`<div class="news-related"><strong>Related publications</strong><ul>${n.related.map(r=>`<li><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a> <span class="muted">· ${esc(r.label)}</span></li>`).join('')}</ul></div>`:''}
      </article>`).join('')}</div>`;

    if (window.location.hash) {
      const targetId = decodeURIComponent(window.location.hash.slice(1));
      const target = document.getElementById(targetId);
      if (target) {
        requestAnimationFrame(() => target.scrollIntoView({behavior:'smooth', block:'start'}));
      }
    }
  }

  async function renderMembers() {
    const host=document.getElementById('members-content'); if(!host) return;
    const data=await load('data/members.json');
    const groups=groupBy(data,'category');
    const order=['Staff','PhD students','Master students','Undergraduate students'];
    host.innerHTML=order.filter(k=>groups[k]).map((k,i)=>`<div class="section-card"${i<order.filter(x=>groups[x]).length-1?' style="margin-bottom:18px"':''}><h3 style="margin-top:0">${esc(k)}</h3><div class="grid-3">${groups[k].map(m=>`<article class="member-card">${m.photo?`<img class="avatar" src="${esc(m.photo)}" alt="${esc(m.name)}"${m.photoStyle?` style="${esc(m.photoStyle)}"`:''}>`:''}<h3>${esc(m.name)}</h3><p class="role">${esc(m.role)}</p><p>${m.descriptionHtml||''}</p></article>`).join('')}</div></div>`).join('');
  }

  async function renderCollaboration() {
    const host=document.getElementById('collaboration-content'); if(!host) return;
    const data=await load('data/collaborators.json'); const groups=groupBy(data,'category');
    host.innerHTML=['External','Internal'].filter(k=>groups[k]).map(k=>`<div class="section-card"><h3>${esc(k)}</h3><div class="grid-3">${groups[k].map(x=>`<article class="member-card"><h3>${esc(x.name)}</h3><p class="role">${esc(x.affiliation)}</p><p>${esc(x.keywords)}</p></article>`).join('')}</div></div>`).join('');
  }

  async function renderVideos() {
    const host=document.getElementById('videos-content'); if(!host) return;
    const data=await load('data/videos.json');
    const videoId=(url)=>String(url||'').match(/\/embed\/([^?&/]+)/)?.[1]||'';
    host.innerHTML=`<div class="section-card"><div class="video-grid">${data.map(v=>{
      const id=videoId(v.embedUrl);
      const thumb=id?`https://i.ytimg.com/vi/${esc(id)}/hqdefault.jpg`:'';
      return `<article class="section-card video-card"><button class="video-thumb video-thumb-button" type="button" data-embed="${esc(v.embedUrl)}" data-title="${esc(v.title)}" aria-label="Play ${esc(v.title)}"><img loading="lazy" src="${thumb}" alt=""><span class="video-play" aria-hidden="true">▶</span></button><div class="video-content"><div class="video-meta">${esc(v.meta)}</div><h3>${esc(v.title)}</h3><p>${esc(v.description)}</p><div class="video-links">${v.links.map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`).join('')}</div></div></article>`;
    }).join('')}</div></div>`;

    host.querySelectorAll('.video-thumb-button').forEach(button=>{
      button.addEventListener('click',()=>{
        const iframe=document.createElement('iframe');
        iframe.className='video-embed';
        iframe.referrerPolicy='strict-origin-when-cross-origin';
        iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen=true;
        iframe.title=button.dataset.title||'Research video';
        const src=button.dataset.embed||'';
        iframe.src=src+(src.includes('?')?'&':'?')+'autoplay=1';
        button.replaceWith(iframe);
      },{once:true});
    });
  }

  async function renderSelectedPublications() {
    const host=document.getElementById('selected-publications-content'); if(!host) return;
    const data=await load('data/publications.json'); const selected=data.filter(p=>p.selected).sort((a,b)=>(a.selectedOrder??999)-(b.selectedOrder??999));
    host.className='pub-grid';
    host.innerHTML=selected.map(p=>`<div class="pub-item"><span class="tag">${esc(p.selectedTag)}</span><h4>${esc(p.title)}</h4><p>${esc(p.selectedSummary)}</p>${p.links?.length?`<div class="pub-actions">${p.links.map(l=>`<a class="pub-link${l.localPdf?' local-pdf':''}" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`).join('')}</div>`:''}</div>`).join('');
  }

  function normalizeText(s) { return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim(); }

  async function renderPublications() {
    const host=document.getElementById('publications-content'); if(!host) return;
    const data=await load('data/publications.json');
    const years=[...new Set(data.map(p=>p.year))].sort((a,b)=>b-a);
    host.innerHTML=years.map(y=>`<section class="publication-year-group" data-year="${y}"><h2 class="pub-year">${y}</h2><div class="publication-list">${data.filter(p=>p.year===y).map(p=>`<article class="publication-row" data-members="${esc((p.members||[]).join(' '))}" data-search="${esc([p.authorsText,p.title,p.venue].join(' '))}"><p class="authors">${p.authorsHtml||''}</p><h3>${esc(p.title)}</h3><p class="venue">${esc(p.venue)}</p>${p.links?.length?`<div class="pub-actions">${p.links.map(l=>`<a class="pub-link${l.localPdf?' local-pdf':''}" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`).join('')}</div>`:''}</article>`).join('')}</div></section>`).join('');

    const memberFilter=document.getElementById('memberFilter'), searchInput=document.getElementById('publicationSearch'), countEl=document.getElementById('publicationCount');
    if(!memberFilter||!searchInput||!countEl) return;
    const articles=()=>Array.from(host.querySelectorAll('article.publication-row'));
    function applyFilters(){ const member=memberFilter.value, query=normalizeText(searchInput.value); let n=0; articles().forEach(a=>{const visible=(member==='all'||(a.dataset.members||'').split(/\s+/).includes(member))&&(!query||normalizeText(a.dataset.search||a.innerText).includes(query));a.hidden=!visible;if(visible)n++;}); host.querySelectorAll('.publication-year-group').forEach(g=>g.classList.toggle('year-section-hidden',!g.querySelector('article.publication-row:not([hidden])')));countEl.textContent=n+(n===1?' publication':' publications'); }
    memberFilter.addEventListener('change',applyFilters); searchInput.addEventListener('input',applyFilters); applyFilters();
  }

  Promise.allSettled([renderNews(),renderMembers(),renderCollaboration(),renderVideos(),renderSelectedPublications(),renderPublications(),renderNewsPage()]).then(results=>results.forEach(r=>{if(r.status==='rejected') console.error(r.reason)}));
})();