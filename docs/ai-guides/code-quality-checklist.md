# Code Quality Checklist

Bu rehber kod yazildiktan veya degistirildikten sonra kontrol icin kullanilir.

## TypeScript

- [ ] `any` kullanildiysa gerekcesi var.
- [ ] Fonksiyon parametreleri ve donus degerleri anlasilir.
- [ ] Component props tipleri tanimli.
- [ ] Null/undefined ihtimalleri dusunuldu.
- [ ] String literal durumlar union type ile modellenebilir mi kontrol edildi.

## JavaScript

- [ ] `const` varsayilan, sadece degisecekse `let`.
- [ ] Global scope gereksiz kirletilmedi.
- [ ] Fonksiyonlar tek is yapiyor.
- [ ] Array islemlerinde `map`, `filter`, `find`, `reduce` dogru kullanildi.
- [ ] Async kodlarda hata yakalama var.

## React

- [ ] State minimum ve anlamli.
- [ ] Derived data state olarak tutulmuyor.
- [ ] Liste render ederken stable `key` kullaniliyor.
- [ ] Event handlerlar okunabilir.
- [ ] Component cok buyukse alt componente ayrildi.

## UI/UX

- [ ] Loading, empty, error, success durumlari dusunuldu.
- [ ] Form validation var.
- [ ] Buton ve aksiyon isimleri net.
- [ ] Responsive davranis kontrol edildi.
- [ ] Kritik bilgiler gorunur, ikincil bilgiler kalabalik yapmiyor.

## Security

- [ ] Secret/token/API key yok.
- [ ] Hassas veri loglanmiyor.
- [ ] Kullanici girdisi kontrol ediliyor.
- [ ] Yetki gerektiren davranis sadece frontend'e birakilmadi.
- [ ] PDF veya hassas dokumanlara izinsiz islem yapilmadi.

## Dogrulama

Mumkun olan en yakin komutu calistir:

```bash
npm run build
npm run test
npm run lint
npm run typecheck
```

Eger proje henuz komut icermiyorsa, calistirilabilir dosya icin uygun komutu belirt:

```bash
node dosya.js
npx tsx dosya.ts
```
