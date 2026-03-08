const BUILD_TS = Date.now().toString();

export function Layout({ children, title }: { children: any; title?: string }) {
  return (
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ? `${title} - ` : ''}Fortunova - AI 사주/명리 운세</title>
        <meta name="description" content="AI 기반 사주/명리 운세 서비스. 생년월일을 입력하면 사주팔자 분석과 오늘의 운세를 확인할 수 있습니다." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Fortunova - AI 사주/명리 운세" />
        <meta property="og:description" content="AI 기반 사주팔자 분석과 오늘의 운세를 확인하세요." />
        <meta property="og:image" content="https://fortunova.molidae.site/public/og-image.png" />
        <meta property="og:url" content="https://fortunova.molidae.site" />
        <link rel="icon" href="/public/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/public/apple-touch-icon.png" />
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
        <meta name="x-build" content={BUILD_TS} />
      </head>
      <body class="min-h-screen font-sans text-gray-200">
        <a href="#main-content" class="skip-link">본문으로 건너뛰기</a>
        <div class="aurora-bg"></div>
        <div class="stars-container" id="stars"></div>

        <header class="glass-card sticky top-0 z-50" style="border-radius: 0; border-left: none; border-right: none; border-top: none;">
          <div class="max-w-md mx-auto flex items-center justify-between p-4">
            <a href="/" class="block group">
              <h1 class="text-xl font-serif font-bold text-gold-400 group-hover:text-gold-300 transition-colors">Fortunova</h1>
              <p class="text-xs text-gray-400 tracking-wider">AI 사주/명리 운세</p>
            </a>
            <nav aria-label="메인 내비게이션" class="flex items-center gap-3 text-sm">
              <a href="/login" class="text-gray-400 hover:text-gold-400 transition-colors">로그인</a>
            </nav>
          </div>
        </header>

        <main id="main-content" class="max-w-md mx-auto p-4 relative z-10">
          {children}
        </main>

        <footer class="text-center text-sm text-gray-500 p-4 mt-8 relative z-10">
          &copy; 2026 Fortunova
        </footer>

        {/* Stars */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var c=document.getElementById('stars');if(!c)return;for(var i=0;i<35;i++){var s=document.createElement('div');s.className='star'+(Math.random()>0.85?' star--large':'');s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';s.style.setProperty('--duration',(2+Math.random()*4)+'s');s.style.setProperty('--delay',(Math.random()*5)+'s');c.appendChild(s)}})();`,
        }} />

        {/* Form collapse + SSE fortune + cookie save/restore + localStorage cache */}
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
  function saveFormToCookie(form) {
    var fd = {};
    form.querySelectorAll('select,input').forEach(function(el) {
      if (!el.name) return;
      if (el.type==='radio') { if (el.checked) fd[el.name]=el.value; }
      else if (el.type==='checkbox') { fd[el.name]=el.checked?el.value:''; }
      else { fd[el.name]=el.value; }
    });
    saveCookie(fd);
  }
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

  // --- SSE Progress ---
  function resetSteps() {
    ['core','sub','meta'].forEach(function(id) {
      var step = document.getElementById('step-'+id);
      var status = document.getElementById('step-'+id+'-status');
      if (step) { step.className = 'sse-step'; }
      if (status) { status.textContent = ''; }
    });
  }
  function setStepActive(chunk) {
    var step = document.getElementById('step-'+chunk);
    if (step) step.className = 'sse-step active';
  }
  function setStepDone(chunk, elapsed) {
    var step = document.getElementById('step-'+chunk);
    var status = document.getElementById('step-'+chunk+'-status');
    if (step) step.className = 'sse-step done';
    if (status) status.textContent = (elapsed/1000).toFixed(1) + 's';
  }

  // --- SSE Fortune Submit ---
  function submitFortuneSSE(form) {
    var fd = new FormData(form);
    var params = [];
    fd.forEach(function(v, k) { if (v) params.push(k+'='+encodeURIComponent(v)); });
    var url = '/partials/fortune-stream?' + params.join('&');

    // UI: collapse form, show loading, reset steps
    saveFormToCookie(form);
    collapseForm(form);
    var ld = document.getElementById('loading');
    if (ld) ld.style.display = 'block';
    resetSteps();
    ['core','sub','meta'].forEach(function(c) { setStepActive(c); });
    startTips();

    var result = document.getElementById('result');
    if (result) result.innerHTML = '';

    var es = new EventSource(url);

    es.onmessage = function(e) {
      try {
        var d = JSON.parse(e.data);
        if (d.type === 'progress') {
          if (d.chunk === 'cached') {
            ['core','sub','meta'].forEach(function(c) { setStepDone(c, 0); });
          } else {
            setStepDone(d.chunk, d.elapsed);
          }
        } else if (d.type === 'done' || d.type === 'error') {
          es.close();
          // SSE 완료 → POST로 결과 HTML 가져오기 (서버 캐시 히트)
          var fd2 = new FormData(form);
          var body = new URLSearchParams();
          fd2.forEach(function(v, k) { body.append(k, v); });
          fetch('/partials/fortune-result', { method: 'POST', body: body })
            .then(function(resp) { return resp.text(); })
            .then(function(html) {
              stopTips();
              if (ld) ld.style.display = 'none';
              if (result) {
                result.innerHTML = html;
                var cacheKey = buildCacheKey(form);
                if (html.indexOf('파싱에 실패')===-1 && html.indexOf('LLM_UNAVAILABLE')===-1 && html.indexOf('VALIDATION_ERROR')===-1) {
                  try { localStorage.setItem(cacheKey, html); } catch(err) {}
                }
              }
            })
            .catch(function() {
              stopTips();
              if (ld) ld.style.display = 'none';
            });
        }
      } catch(err) {}
    };

    es.onerror = function() {
      es.close();
      stopTips();
      if (ld) ld.style.display = 'none';
    };
  }

  // --- Form submit handler ---
  document.addEventListener('submit', function(evt) {
    var form = evt.target;
    if (!form || form.id !== 'fortune-form') return;
    evt.preventDefault();

    // Check localStorage cache first
    var cacheKey = buildCacheKey(form);
    var cached = null;
    try { cached = localStorage.getItem(cacheKey); } catch(e) {}
    if (cached) {
      collapseForm(form);
      saveFormToCookie(form);
      var result = document.getElementById('result');
      if (result) result.innerHTML = cached;
      return;
    }

    submitFortuneSSE(form);
  });

  // --- Share button ---
  function buildShareLink() {
    var saved = readCookie();
    if (!saved) return 'https://fortunova.molidae.site';
    var params = [];
    ['year','month','day','hour','gender','calendarType','isLeapMonth','category'].forEach(function(k) {
      if (saved[k]) params.push(k + '=' + encodeURIComponent(saved[k]));
    });
    return 'https://fortunova.molidae.site' + (params.length ? '?' + params.join('&') : '');
  }
  function buildShareText(btn) {
    var score = btn.getAttribute('data-score') || '';
    var summary = btn.getAttribute('data-summary') || '';
    var advice = btn.getAttribute('data-advice') || '';
    var color = btn.getAttribute('data-lucky-color') || '';
    var num = btn.getAttribute('data-lucky-number') || '';
    var proverb = btn.getAttribute('data-proverb') || '';
    var lines = [];
    lines.push('🔮 오늘의 운세 (' + score + '점)');
    lines.push('');
    if (summary) lines.push('✨ ' + summary);
    if (advice) lines.push('');
    if (advice) lines.push('💡 조언: ' + advice);
    if (color || num) {
      lines.push('');
      var lucky = '🍀 행운:';
      if (color) lucky += ' ' + color;
      if (num) lucky += ' / 숫자 ' + num;
      lines.push(lucky);
    }
    if (proverb) {
      lines.push('');
      lines.push('📜 "' + proverb + '"');
    }
    lines.push('');
    lines.push('🔗 나도 운세 보기');
    lines.push(buildShareLink());
    return lines.join('\\n');
  }
  function showFeedback(msg) {
    var el = document.getElementById('share-feedback');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(function() { el.style.display = 'none'; }, 2500);
  }
  document.addEventListener('click', function(evt) {
    var btn = evt.target && evt.target.closest ? evt.target.closest('#share-btn') : null;
    if (!btn) return;
    var text = buildShareText(btn);
    if (navigator.share) {
      navigator.share({ title: '오늘의 운세 - Fortunova', text: text }).catch(function(){});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showFeedback('📋 클립보드에 복사되었습니다!');
      }).catch(function() {
        showFeedback('복사에 실패했습니다.');
      });
    } else {
      showFeedback('이 브라우저에서는 공유를 지원하지 않습니다.');
    }
  });

  // --- Auto-fill & auto-submit from query params ---
  (function() {
    var params = new URLSearchParams(window.location.search);
    if (!params.has('year')) return;
    var fields = ['year','month','day','hour','gender','calendarType','isLeapMonth','category'];
    var hasAny = false;
    fields.forEach(function(name) {
      var val = params.get(name);
      if (!val) return;
      hasAny = true;
      document.querySelectorAll('[name="'+name+'"]').forEach(function(el) {
        if (el.type==='radio') el.checked=(el.value===val);
        else if (el.type==='checkbox') el.checked=(val==='true');
        else el.value=val;
      });
    });
    if (params.get('calendarType')==='lunar') {
      var lf=document.getElementById('leapMonthField');
      if (lf) lf.style.display='block';
    }
    if (hasAny) {
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(function() {
        var form = document.getElementById('fortune-form');
        if (form) submitFortuneSSE(form);
      }, 300);
    }
  })();

  // --- localStorage result cache (배포 시 초기화) ---
  var buildMeta = document.querySelector('meta[name="x-build"]');
  var buildVer = buildMeta ? buildMeta.getAttribute('content') : '';
  var prevBuild = '';
  try { prevBuild = localStorage.getItem('fortunova_build') || ''; } catch(e) {}
  var today = new Date().toISOString().slice(0,10);
  try {
    if (buildVer && buildVer !== prevBuild) {
      // 새 빌드: 결과 캐시 전부 삭제
      for (var i=localStorage.length-1;i>=0;i--) {
        var k=localStorage.key(i);
        if (k&&k.startsWith('fortunova_result_')) localStorage.removeItem(k);
      }
      localStorage.setItem('fortunova_build', buildVer);
    } else {
      // 같은 빌드: 오늘 것만 유지
      for (var i=localStorage.length-1;i>=0;i--) {
        var k=localStorage.key(i);
        if (k&&k.startsWith('fortunova_result_')&&!k.includes(today)) localStorage.removeItem(k);
      }
    }
  } catch(e) {}
  function buildCacheKey(formEl) {
    var fd=new FormData(formEl);
    var birth=(fd.get('year')||'')+'-'+(fd.get('month')||'')+'-'+(fd.get('day')||'')+'-'+(fd.get('gender')||'');
    var cat=fd.get('category')||'daily';
    return 'fortunova_result_'+today+'_'+cat+'_'+birth;
  }
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
