(() => {
  const esc = (s) => String(s ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const load = (url) => fetch(url).then(r => { if (!r.ok) throw new Error(`${url}: ${r.status}`); return r.json(); });
  const groupBy = (items, key) => items.reduce((m,x) => ((m[x[key]] ||= []).push(x), m), {});

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
    host.innerHTML=`<div class="section-card"><div class="video-grid">${data.map(v=>`<article class="section-card video-card"><iframe class="video-embed" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen src="${esc(v.embedUrl)}" title="${esc(v.title)}"></iframe><div class="video-content"><div class="video-meta">${esc(v.meta)}</div><h3>${esc(v.title)}</h3><p>${esc(v.description)}</p><div class="video-links">${v.links.map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`).join('')}</div></div></article>`).join('')}</div></div>`;
  }

  async function renderSelectedPublications() {
    const host=document.getElementById('selected-publications-content'); if(!host) return;
    const data=await load('data/publications.json'); const selected=data.filter(p=>p.selected).sort((a,b)=>(a.selectedOrder??999)-(b.selectedOrder??999));
    host.className='pub-grid';
    host.innerHTML=selected.map(p=>`<div class="pub-item"><span class="tag">${esc(p.selectedTag)}</span><h4>${esc(p.title)}</h4><p>${esc(p.selectedSummary)}</p></div>`).join('');
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

  Promise.allSettled([renderMembers(),renderCollaboration(),renderVideos(),renderSelectedPublications(),renderPublications()]).then(results=>results.forEach(r=>{if(r.status==='rejected') console.error(r.reason)}));
})();