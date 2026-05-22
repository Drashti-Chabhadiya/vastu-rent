export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2.5rem; background: #ffffff; border: 1px solid #f1f5f9; border-radius: 1.5rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
      h1 { font-size: 1.5rem; font-weight: 800; margin: 0 0 0.75rem; color: #0f172a; }
      p { color: #64748b; margin: 0 0 1.75rem; font-size: 0.95rem; }
      .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.75rem 1.5rem; border-radius: 9999px; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; font-size: 0.875rem; outline: none; }
      .primary { background: #15803d; color: #fff; font-weight: 700; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(21,128,61,0.15); }
      .primary:hover { background: #166534; box-shadow: 0 4px 16px rgba(21,128,61,0.25); }
      .primary:active { transform: scale(0.98); }
      .secondary { background: #fff; color: #15803d; border-color: #cbd5e1; font-weight: 700; transition: all 0.2s ease; }
      .secondary:hover { background: #f8fafc; border-color: #94a3b8; }
      .secondary:active { transform: scale(0.98); }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`
}
