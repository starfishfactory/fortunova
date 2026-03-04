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
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* HTMX */}
        <script src="https://unpkg.com/htmx.org@2.0.4"></script>
        {/* Tailwind CDN + Custom Config */}
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
        {/* Custom Styles (after Tailwind) */}
        <link rel="stylesheet" href="/public/styles.css" />
      </head>
      <body class="min-h-screen font-sans text-gray-200">
        {/* Aurora animated background */}
        <div class="aurora-bg"></div>
        {/* Starfield */}
        <div class="stars-container" id="stars"></div>

        <header class="glass-card sticky top-0 z-50" style="border-radius: 0; border-left: none; border-right: none; border-top: none;">
          <div class="max-w-md mx-auto flex items-center justify-between p-4">
            <a href="/" class="block group">
              <h1 class="text-xl font-serif font-bold text-gold-400 group-hover:text-gold-300 transition-colors">
                Fortunova
              </h1>
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

        {/* Star generation script */}
        <script dangerouslySetInnerHTML={{
          __html: `(function() {
            var c = document.getElementById('stars');
            if (!c) return;
            var count = 35;
            for (var i = 0; i < count; i++) {
              var s = document.createElement('div');
              s.className = 'star' + (Math.random() > 0.85 ? ' star--large' : '');
              s.style.left = Math.random() * 100 + '%';
              s.style.top = Math.random() * 100 + '%';
              s.style.setProperty('--duration', (2 + Math.random() * 4) + 's');
              s.style.setProperty('--delay', (Math.random() * 5) + 's');
              c.appendChild(s);
            }
          })();`,
        }} />
        {/* Service Worker */}
        <script dangerouslySetInnerHTML={{
          __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/service-worker.js').catch(() => {}); }`,
        }} />
      </body>
    </html>
  );
}
