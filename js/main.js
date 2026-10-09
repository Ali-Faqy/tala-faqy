/* Tala Othman Shukri Faqi: portfolio behaviour. Theme, menu, filters, page routing, image viewer, copy buttons. */
(function(){
  /* ---------- Theme: light by default, dark only when the visitor switches ---------- */
  var root=document.documentElement;
  var themeBtn=document.getElementById('theme');
  function stored(){try{return localStorage.getItem('tala-theme')}catch(e){return null}}
  function store(v){try{localStorage.setItem('tala-theme',v)}catch(e){}}
  function isDark(){return root.getAttribute('data-theme')==='dark'}
  function sync(){var d=isDark();themeBtn.classList.toggle('is-dark',d);themeBtn.setAttribute('aria-pressed',d?'true':'false');themeBtn.setAttribute('aria-label',d?'Switch to light theme':'Switch to dark theme')}
  root.setAttribute('data-theme',stored()==='dark'?'dark':'light');
  sync();
  themeBtn.addEventListener('click',function(){var n=isDark()?'light':'dark';root.setAttribute('data-theme',n);store(n);sync()});

  /* ---------- Mobile menu ---------- */
  var menu=document.getElementById('menu'), links=document.getElementById('navlinks');
  menu.addEventListener('click',function(){var o=links.classList.toggle('open');menu.setAttribute('aria-expanded',o?'true':'false')});
  links.addEventListener('click',function(e){if(e.target.tagName==='A'){links.classList.remove('open');menu.setAttribute('aria-expanded','false')}});

  /* ---------- Project filters and the asymmetric card rhythm ---------- */
  var cards=[].slice.call(document.querySelectorAll('.card')), pattern=['s12','s7','s5','s5','s7'];
  function layout(){var i=0;cards.forEach(function(c){c.classList.remove('s12','s7','s5');if(!c.hidden){c.classList.add(pattern[i%pattern.length]);i++}})}
  document.getElementById('filters').addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    [].forEach.call(this.querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
    var f=b.getAttribute('data-f');
    cards.forEach(function(c){c.hidden=!(f==='all'||c.getAttribute('data-cats').split(' ').indexOf(f)>-1)});
    layout();
  });
  layout();

  /* ---------- Routing between the home page and the project pages (#p-name) ---------- */
  var home=document.getElementById('home'), pvs=[].slice.call(document.querySelectorAll('.pv')), baseTitle=document.title, homeY=0, current=null;
  function route(){
    var h=location.hash.slice(1), art=h.indexOf('p-')===0?document.getElementById(h):null;
    if(art){
      if(!current) homeY=window.scrollY;
      home.hidden=true; pvs.forEach(function(p){p.hidden=p!==art}); current=art;
      document.title=art.getAttribute('data-title')+' — Tala Othman Shukri Faqi';
      root.style.scrollBehavior='auto'; window.scrollTo(0,0); root.style.scrollBehavior='';
    }else{
      var was=current; pvs.forEach(function(p){p.hidden=true}); home.hidden=false; current=null; document.title=baseTitle;
      var el=h&&h!=='top'?document.getElementById(h):null;
      root.style.scrollBehavior='auto';
      if(el) el.scrollIntoView(); else if(was&&!h) window.scrollTo(0,homeY); else if(h==='top'||!h) window.scrollTo(0,0);
      root.style.scrollBehavior='';
    }
  }
  window.addEventListener('hashchange',route); route();

  /* ---------- Image viewer ---------- */
  var lb=document.getElementById('lb'), lbImg=document.getElementById('lb-img'), lbCap=document.getElementById('lb-cap'), set=[], idx=0;
  function show(i){idx=(i+set.length)%set.length;var b=set[idx];lbImg.src=b.getAttribute('data-full');lbImg.alt=b.querySelector('img').alt;lbCap.textContent=b.getAttribute('data-cap')||''}
  document.addEventListener('click',function(e){
    var z=e.target.closest('.zoom'); if(!z||typeof lb.showModal!=='function')return;
    set=[].slice.call(z.closest('.pv').querySelectorAll('.zoom')); show(set.indexOf(z)); lb.showModal();
  });
  document.getElementById('lb-prev').addEventListener('click',function(){show(idx-1)});
  document.getElementById('lb-next').addEventListener('click',function(){show(idx+1)});
  document.getElementById('lb-close').addEventListener('click',function(){lb.close()});
  lb.addEventListener('click',function(e){if(e.target===lb)lb.close()});
  lb.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')show(idx-1);if(e.key==='ArrowRight')show(idx+1)});

  /* ---------- Back-to-top button: shown after scrolling ~600px ---------- */
  var toTop=document.getElementById('to-top'), ticking=false;
  function toggleTop(){toTop.classList.toggle('show',window.scrollY>600);ticking=false}
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(toggleTop)}},{passive:true});
  toTop.addEventListener('click',function(){
    var calm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({top:0,behavior:calm?'auto':'smooth'});
  });
  toggleTop();

  /* ---------- Download CV ----------
     A normal <a download> link works on any host. Inside the claude.ai artifact viewer plain
     downloads are blocked, so there the file is handed over through the optional "downloads"
     capability instead. If that is unavailable the link just opens the PDF. */
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[data-cv]');
    if(!a||!window.claude||typeof window.claude.use!=='function')return;
    e.preventDefault();
    var href=a.getAttribute('href'), name=a.getAttribute('download')||'CV.pdf';
    window.claude.use('downloads').then(function(d){
      if(!d)throw 0;
      return fetch(href).then(function(r){return r.blob()}).then(function(b){return d.save({filename:name,data:b})});
    }).catch(function(err){
      if(err&&err.code==='declined')return;
      window.open(href,'_blank');
    });
  });

  /* ---------- Copy buttons in the contact section ---------- */
  document.addEventListener('click',function(e){
    var b=e.target.closest('.copy');if(!b)return;
    var t=b.getAttribute('data-copy'), done=function(){var o=b.textContent;b.textContent='Copied';setTimeout(function(){b.textContent=o},1600)};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,function(){sel(b)})}else sel(b);
  });
  function sel(b){var d=b.previousElementSibling;var r=document.createRange();r.selectNodeContents(d);var s=window.getSelection();s.removeAllRanges();s.addRange(r)}
})();