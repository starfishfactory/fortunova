export function Layout({ children, title }: { children: any; title?: string }) {
  return (
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ? `${title} - ` : ''}Fortunova - AI 사주/명리 운세</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script src="https://unpkg.com/htmx.org@2.0.4"></script>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <header class="bg-indigo-600 text-white p-4 shadow-lg">
          <div class="max-w-md mx-auto flex items-center justify-between">
            <a href="/" class="block">
              <h1 class="text-xl font-bold">Fortunova</h1>
              <p class="text-sm text-indigo-200">AI 사주/명리 운세</p>
            </a>
            <nav class="flex items-center gap-3 text-sm">
              <a href="/mypage" class="text-indigo-200 hover:text-white transition-colors">마이페이지</a>
              <a href="/login" class="text-indigo-200 hover:text-white transition-colors">로그인</a>
            </nav>
          </div>
        </header>
        <main class="max-w-md mx-auto p-4">
          {children}
        </main>
        <footer class="text-center text-sm text-gray-400 p-4 mt-8">
          &copy; 2026 Fortunova
        </footer>
        <script dangerouslySetInnerHTML={{
          __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/service-worker.js').catch(() => {}); }`,
        }} />
      </body>
    </html>
  );
}
