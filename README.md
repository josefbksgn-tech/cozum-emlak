# Çözüm Emlak: Kurulum (Cloudflare Pages + D1 + R2)

Kullanılan kaynaklar: D1 `cozum-emlak-db` · R2 `cozum-emlak-images` · Pages projesi `cozum-emlak`
Koddaki binding adları: `DB` (D1) ve `R2` (görseller). Kod başka isme bağlı değildir.

## 1) Tek seferlik: D1 ID'sini yazın
Bu adım tamamlandı: ID wrangler.toml içine yazıldı.

## 2) Komutlar (proje klasöründe)
```
npx wrangler login
npm run db:init          # tabloları ve Siirt ilçelerini oluşturur (tekrar çalıştırılabilir)
npm run project:create   # Pages projesi
npm run secrets          # sırayla sorar: ADMIN_USER, ADMIN_PASS, SECRET
npm run deploy           # siteyi yayına alır
```
- ADMIN_USER / ADMIN_PASS: admin giriş bilgileriniz. SECRET: uzun rastgele bir metin (en az 32 karakter).
- Secret'lar girilmezse admin girişi bilerek hata verir.
- `secrets` komutundan sonra bir kez daha `npm run deploy` çalıştırın.

## 3) Rotalar
`/` site · `/admin.html` yönetim · `/tv.html` cam vitrini · `/poster.html?id=` afiş · `/ilan/ID` paylaşım linki · `/sitemap.xml`

## Notlar
- Dosya yapısı: `public/` (sayfalar), `functions/api/[[path]].js` (API), `functions/ilan/[id].js` (WhatsApp önizlemesi), `functions/sitemap.xml.js`, `schema.sql`.
- Video yükleme sınırı yaklaşık 100 MB; daha büyük videolar için YouTube linki kullanın.
- Alan adınızı bağlayınca `public/robots.txt` içindeki Sitemap satırını açın.
- İlk kurulumdan sonra: Pages > Settings > Functions bölümünde D1/R2 bağlantılarını wrangler.toml'dan geldiğini kontrol edin.
