# Frontend (Next.js 14 + TypeScript)

Bu klasör, YatayApp için Next.js 14 (App Router) tabanlı frontend uygulamasının başlangıç iskeletini içerir.

## Kurulum

```bash
cd frontend
npm install
# .env.local oluşturun ve Supabase bilgilerini girin
cp .env.example .env.local
```

## Geliştirme

```bash
npm run dev
```

## Notlar

### Tailwind & UI

Tailwind CSS ve temel shadcn-ui yaklaşımı entegre edildi:

1. `tailwind.config.mjs` ve `postcss.config.mjs` oluşturuldu.
2. `globals.css` dosyasına renk değişkenleri ve Tailwind direktifleri eklendi.
3. Örnek bileşen: `src/components/ui/button.tsx`.
4. Ana sayfa: `src/app/page.tsx` test için basit buton örnekleri.

### Sonraki Adımlar
- Modüler dizinler: `src/modules/pos`, `src/modules/personnel` vb.
- Temel auth akışı ve Supabase query örnekleri.
- Zustand store yapısı.
- Test (Vitest + Playwright) entegrasyonu.
