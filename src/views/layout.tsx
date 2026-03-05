export function Layout({ children, title }: { children: any; title?: string }) {
  return (
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ? `${title} - ` : ''}Fortunova - AI 사주/명리 운세</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0e27" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script src="https://unpkg.com/htmx.org@2.0.4"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `tailwind.config = {
            theme: {
              extend: {
                colors: {
                  navy: { 900: '#0a0e27', 800: '#0f1433', 700: '#141a3d', 600: '#1a2147', 500: '#232b5c' },
                  gold: { 600: '#b8923d', 500: '#d4a853', 400: '#e8c170', 300: '#f0d590', 200: '#f5e3af' }
                },
                fontFamily: {
                  serif: ['Noto Serif KR', 'serif'],
                  sans: ['Noto Sans KR', 'sans-serif']
                }
              }
            }
          }`,
        }} />
        <link rel="stylesheet" href="/public/styles.css" />
      </head>
      <body class="min-h-screen font-sans text-gray-200">
        <div class="aurora-bg"></div>
        <div class="stars-container" id="stars"></div>

        <header class="glass-card sticky top-0 z-50" style="border-radius: 0; border-left: none; border-right: none; border-top: none;">
          <div class="max-w-md mx-auto flex items-center justify-between p-4">
            <a href="/" class="block group">
              <h1 class="text-xl font-serif font-bold text-gold-400 group-hover:text-gold-300 transition-colors">Fortunova</h1>
              <p class="text-xs text-gray-400 tracking-wider">AI 사주/명리 운세</p>
            </a>
            <nav class="flex items-center gap-3 text-sm">
              <a href="/login" class="text-gray-400 hover:text-gold-400 transition-colors">로그인</a>
            </nav>
          </div>
        </header>

        <main class="max-w-md mx-auto p-4 relative z-10">
          {children}
        </main>

        <footer class="text-center text-sm text-gray-500 p-4 mt-8 relative z-10">
          &copy; 2026 Fortunova
        </footer>

        {/* Stars */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var c=document.getElementById('stars');if(!c)return;for(var i=0;i<35;i++){var s=document.createElement('div');s.className='star'+(Math.random()>0.85?' star--large':'');s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';s.style.setProperty('--duration',(2+Math.random()*4)+'s');s.style.setProperty('--delay',(Math.random()*5)+'s');c.appendChild(s)}})();`,
        }} />

        {/* Form collapse + loading tips + cookie save/restore + localStorage cache */}
        <script dangerouslySetInnerHTML={{
          __html: `
(function() {
  // --- Loading tips ---
  var TIPS = [
    '사주(四柱)는 태어난 연·월·일·시의 네 기둥을 의미합니다',
    '천간(天干)은 갑·을·병·정·무·기·경·신·임·계 10가지입니다',
    '지지(地支)는 자·축·인·묘·진·사·오·미·신·유·술·해 12가지입니다',
    '오행(五行)은 목·화·토·금·수, 만물의 근본 에너지입니다',
    '일간(日干)은 사주에서 "나"를 대표하는 핵심 요소입니다',
    '용신(用神)은 사주의 균형을 맞추는 가장 필요한 오행입니다',
    '대운(大運)은 10년 단위로 바뀌는 인생의 큰 흐름입니다',
    '십신(十神)은 일간과 다른 글자의 관계를 나타냅니다',
    '상생(相生): 목→화→토→금→수→목 순으로 도움을 줍니다',
    '상극(相克): 목→토→수→화→금→목 순으로 억제합니다'
  ];
  var tipIdx = Math.floor(Math.random() * TIPS.length), tipTimer = null;
  function startTips() {
    var el = document.getElementById('loading-tip');
    if (!el) return;
    el.textContent = TIPS[tipIdx];
    tipTimer = setInterval(function() {
      el.style.opacity = '0';
      setTimeout(function() {
        tipIdx = (tipIdx + 1) % TIPS.length;
        el.textContent = TIPS[tipIdx];
        el.style.opacity = '1';
      }, 750);
    }, 5250);
  }
  function stopTips() { if (tipTimer) { clearInterval(tipTimer); tipTimer = null; } }

  // --- Form collapse/expand ---
  var CAT_NAMES = { daily:'오늘의 운세', love:'연애운', career:'직장운', health:'건강운', wealth:'재물운' };
  function collapseForm(form) {
    var sec = document.getElementById('form-section');
    var summary = document.getElementById('form-summary');
    if (sec) sec.classList.add('collapsed');
    if (summary && form) {
      var fd = new FormData(form);
      var y=fd.get('year')||'?', m=fd.get('month')||'?', d=fd.get('day')||'?';
      var g = fd.get('gender')==='F'?'여':'남';
      var cat = CAT_NAMES[fd.get('category')] || '운세';
      var txt = document.getElementById('summary-text');
      if (txt) txt.textContent = y+'.'+m+'.'+d+' ('+g+') · '+cat;
      summary.style.display = 'block';
    }
  }
  function expandForm() {
    var sec = document.getElementById('form-section');
    var summary = document.getElementById('form-summary');
    if (sec) sec.classList.remove('collapsed');
    if (summary) summary.style.display = 'none';
  }
  window.collapseForm = collapseForm;
  window.expandForm = expandForm;

  document.addEventListener('htmx:beforeRequest', function(evt) {
    var form = evt.detail.elt;
    if (!form || form.tagName !== 'FORM') return;
    collapseForm(form);
    var ld = document.getElementById('loading');
    if (ld) ld.style.display = 'block';
    startTips();
  });
  document.addEventListener('htmx:afterRequest', function() {
    var ld = document.getElementById('loading');
    if (ld) ld.style.display = 'none';
    stopTips();
  });
  document.addEventListener('htmx:responseError', function() {
    var ld = document.getElementById('loading');
    if (ld) ld.style.display = 'none';
    expandForm();
    stopTips();
  });
  document.addEventListener('click', function(evt) {
    if (evt.target && evt.target.id === 'reopen-form') expandForm();
  });

  // --- Cookie form save/restore ---
  var CK = 'fortunova_input';
  function saveCookie(data) {
    document.cookie = CK+'='+encodeURIComponent(JSON.stringify(data))+';max-age=315360000;path=/';
  }
  function readCookie() {
    var m = document.cookie.match(new RegExp('(?:^|; )'+CK+'=([^;]*)'));
    if (!m) return null;
    try { return JSON.parse(decodeURIComponent(m[1])); } catch(e) { return null; }
  }
  document.addEventListener('htmx:configRequest', function(evt) {
    var form = evt.detail.elt;
    if (!form || form.tagName !== 'FORM') return;
    var fd = {};
    form.querySelectorAll('select,input').forEach(function(el) {
      if (!el.name) return;
      if (el.type==='radio') { if (el.checked) fd[el.name]=el.value; }
      else if (el.type==='checkbox') { fd[el.name]=el.checked?el.value:''; }
      else { fd[el.name]=el.value; }
    });
    saveCookie(fd);
  });
  document.addEventListener('DOMContentLoaded', function() {
    var saved = readCookie();
    if (!saved) return;
    Object.keys(saved).forEach(function(name) {
      document.querySelectorAll('[name="'+name+'"]').forEach(function(el) {
        if (el.type==='radio') el.checked=(el.value===saved[name]);
        else if (el.type==='checkbox') el.checked=(saved[name]===el.value);
        else el.value=saved[name];
      });
    });
    if (saved['calendarType']==='lunar') {
      var lf=document.getElementById('leapMonthField');
      if (lf) lf.style.display='block';
    }
  });

  // --- localStorage result cache ---
  var today = new Date().toISOString().slice(0,10);
  try {
    for (var i=localStorage.length-1;i>=0;i--) {
      var k=localStorage.key(i);
      if (k&&k.startsWith('fortunova_result_')&&!k.includes(today)) localStorage.removeItem(k);
    }
  } catch(e) {}
  function buildCacheKey(formEl) {
    var fd=new FormData(formEl);
    var birth=(fd.get('year')||'')+'-'+(fd.get('month')||'')+'-'+(fd.get('day')||'')+'-'+(fd.get('gender')||'');
    var cat=fd.get('category')||'daily';
    return 'fortunova_result_'+today+'_'+cat+'_'+birth;
  }
  document.addEventListener('htmx:confirm', function(evt) {
    var el=evt.detail.elt;
    if (!el||el.tagName!=='FORM') return;
    var action=el.getAttribute('hx-post')||'';
    if (!action.includes('fortune')) return;
    var key=buildCacheKey(el);
    var cached=null;
    try { cached=localStorage.getItem(key); } catch(e) {}
    if (cached) {
      evt.preventDefault();
      var target=document.querySelector(el.getAttribute('hx-target')||'#result');
      if (target) { target.innerHTML=cached; collapseForm(el); }
    }
  });
  document.addEventListener('htmx:afterSwap', function(evt) {
    var el=evt.detail.elt;
    if (!el||el.tagName!=='FORM') return;
    var action=el.getAttribute('hx-post')||'';
    if (!action.includes('fortune')) return;
    var key=buildCacheKey(el);
    var target=document.querySelector(el.getAttribute('hx-target')||'#result');
    if (target) {
      var html=target.innerHTML;
      if (html.indexOf('파싱에 실패')!==-1||html.indexOf('LLM_UNAVAILABLE')!==-1||html.indexOf('VALIDATION_ERROR')!==-1) return;
      try { localStorage.setItem(key, html); } catch(e) {}
    }
  });
})();
`,
        }} />
        <script dangerouslySetInnerHTML={{
          __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/service-worker.js').catch(function(){}); }`,
        }} />
      </body>
    </html>
  );
}
