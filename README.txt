# Ballas Orçamento 2025 — Categorias + Senha por sessão
- Login por sessão (`sessionStorage`): ao dar refresh, pede senha novamente.
- `products.json` com categorias (ex.: "Pistola").
- `public.js` renderiza produtos **agrupados por categoria**.
- `_headers` e `fetch(...?v=Date.now())` para evitar cache no CDN.

## Publicar no Netlify
1) Acesse app.netlify.com → Add new site → Deploy manually → arraste esta pasta.
2) Acesse `/login.html`.
   - Público: Eastsideballas
   - Admin: ESBallas2025
3) Para atualizar o catálogo: entre em admin → Baixar `products.json` → altere → novo deploy.

