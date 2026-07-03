# TODO

## Simdiki Odak: Lokal Tek Kullanici Cihaz Kurulumu

- [x] Admin panel/musteri-yetki ekranlarini simdilik ikinci plana al; ilk acilista herhangi bir kullanicinin cihaz baglayip isimlendirebildigi lokal kurulum akisini one al.
- [x] Ilk ekranda cihaz kesfi, cihaz secimi, kullanici tarafindan adlandirma ve kayitli cihaz listesi ana is olsun.
- [x] Lokal ilk urun deneyiminde tum operasyon modulleri kullanicinin paketinde var kabul edilsin; ekranlar cihaz baglantisina gore dolsun, paket bariyeri ilk ekranda kullaniciyi engellemesin.
- [x] Musteri/proje/paket/yetki modeli kodda kirilmadan kalsin, fakat UI'da kullanicinin onune ilk bariyer olarak cikmasin; kurumsal/admin satis modeline gecince tekrar ayrintilandirilsin.
- [x] Gercek radar/kamera/RF cihaz baglantisi icin once backend kontrollu kesif/probe akisini kullan; secret, stream URL veya genis ag taramasi ekleme.
- [x] Kamera snapshot, kisa olay klibi, alarm kaniti ve cihaz baglanti ayarlarini varsayilan olarak lokal backend makinesinde tut; bulut/storage entegrasyonunu opsiyonel ve sonradan yap.
- [x] Olay verilerinde database'e ham goruntu yerine metadata ve lokal dosya referansi yazma stratejisini tasarla.
- [x] Kamera feed icin backend snapshot capture endpointi ekle; real modda `snapshotUrl` backend'den okunup lokal evidence klasorune yazilsin, mock modda placeholder kanit uretilsin.
- [x] Lokal kanit klasorunu env ile ayarlanabilir yap ve git disinda tut: `LOCAL_EVIDENCE_DIR`.
- [x] Kamera/radar/RF verisi backend'e geldiginde kanit/metadata otomatik kaydedilsin; frontend manuel snapshot butonu gostermesin.
- [x] Lokal sensor event store ekle; mock/gercek ingest sonucu uretilen kamera/radar/RF olaylarini typed event olarak backend'de tut.
- [x] `/api/sensor-events` endpointi ekle; frontend olay panelinde event tipi, cihaz, severity ve lokal kanit referansini goster.
- [x] Cihaz kaydinda kullanici sadece display name yazsin; `deviceType`, `productProfile` ve `capabilities` backend/discovery tarafindan belirlensin.
- [x] Frontend cihaz kesfi kartinda algilanan cihaz tipi, urun profili ve analiz yeteneklerini goster; kullanicinin bunlari serbest metinle degistirmesine izin verme.
- [x] Backend analiz pipeline taslagi olustur: kamera/termal icin snapshot-motion/object event, radar icin track/range/zone event, RF icin signal/frequency event.
- [x] Mock data disinda gelecek gercek veriler icin `rawSource`, `ingestMode`, `capabilities` ve lokal evidence path alanlarini domain modeline hazirla.
- [x] Gercek cihaz baglanmadan once lokal backend ingest akisini denemek icin frontend'de kamera/radar/RF test olayi ureten kontrol ekle; kamera olayinda snapshot kaniti backend tarafinda otomatik olussun, radar/RF olayinda metadata kaydi olussun.
- [x] Radar/RF gibi goruntu uretmeyen sensor event'lerinde normalize metadata'yi lokal JSON evidence dosyasi olarak kaydet; event modelinde `dataPath` referansi goster.
- [x] `DEVICE_DISCOVERY_SOURCE=config` ve `DEVICE_DISCOVERY_JSON` ile backend kontrollu cihaz kesfi kaynagi ekle; frontend'e sadece guvenli metadata donsun.
- [x] Kayitli cihazlar icin iki ayri kaldirma akisi ekle: `Baglantiyi kaldir` cihazi pasif/offline yapip yeni event/kanit uretimini durdurmali; `Cihazi sil` kayitli cihaz listesinden tamamen cikarmali ki yerine baska cihaz eklenebilsin.
- [x] `Cihazi sil` islemi eski lokal evidence ve olay gecmisini otomatik silmemeli; kanit temizleme daha sonra ayri ve acik onayli bir aksiyon olarak tasarlanmali.
- [x] Baglantisi kaldirilmis veya kopmus cihaz icin sorunsuz tekrar baglama akisi ekle; ayni fiziksel cihaz tekrar secilip yeni/var olan display name ile calisabilsin.
- [x] Frontend modulleri paket yetkisine gore gizlemek yerine lokal kurulumda bagli cihazlara gore bos/dolu durum goster; cihaz yoksa ilgili panel bos durum gostersin.
- [x] Frontend operasyon ekranini sabit katmanli C2 duzene tasarla: 64px topbar, 90px metrik seridi, uc panelli ana alan, 250px alt analiz paneli ve yalnizca ilgili kartlarda bagimsiz ic scroll.
- [ ] Yeni frontend parcasi eklendiginde backend/domain modeli eslestirmesini zorunlu kontrol yap; panel/kart/harita katmani/command butonu hangi model, servis fonksiyonu ve gelecekteki endpoint ile beslenecekse TODO veya karar notunda gorunsun.

## Bisavunma Anti-Drone Anketinden Cikan Eksikler

- [x] Sitedeki anti-drone gereksinim anketini urun bosluklari icin incele; formu projeye yukleme veya kopyalama yerine karar/TODO notlarina cevir.
- [ ] `Project` modelinden ayri `RequirementSurvey` veya `SiteAssessment` domain modelini tasarla.
- [ ] Musteri/kontakt bilgisi ile son kullanici/operasyon birimi bilgisini ayri modelle.
- [ ] Tesis turu, proje onceligi, tedarik zaman cizelgesi, teslimat tercihi ve saha erisim durumunu typed secim alanlari olarak planla.
- [ ] Tehdit profili modelini tasarla: drone turleri, iletisim kanallari, aktivite sikligi, suru/otonom tehdit, daha once gozlenen sistemler.
- [ ] Teknik gereksinim matrisini tasarla: hedef frekans bantlari, RF/radar/EO-IR menzil beklentileri, sinyal bozucu etki yaricapi ve istenen kabiliyetler.
- [ ] Dis sistem ihtiyaclarini ayir: jammer, radar, EO/IR/termal, C2 yazilimi, mobil komuta merkezi ve mevcut guvenlik sistemleri entegrasyonu.
- [ ] Operasyonel gereksinimleri modelle: 7/24/talep/olay bazli calisma, mobil/arac ustu/sabit/konteyner kurulum, cevresel kosullar ve egitim seviyesi.
- [ ] Haritalama gereksinimlerini tasarla: komuta merkezi, tesis siniri, savunma cevresi, tespit cevresi, arazi tipi; gercek koordinatlari demo veriye ekleme.
- [ ] Survey attachment modelini planla: harita ekran goruntusu, KML/KMZ, saha fotografi, yetkilendirme belgesi, mevcut sistem duzeni; dosyayi DB'ye gommeden lokal path/hash metadata tut.
- [ ] Veri guvenligi alanlarini ekle: sifreleme/kripto ihtiyaci, VPN/offline/local network/cloud/air-gapped erisim, veri saklama suresi.
- [ ] Ileri gereksinimler icin typed alanlar tasarla: AI siniflandirma, cok noktali merkezi izleme, NATO/STANAG, siber sertlestirme, pasif tespit, arac entegrasyonu, batarya/gunes enerjisi, yerel destek/egitim.
- [ ] Anket endpointi tasarlanmadan once auth, access control, audit log, rate limit, dosya boyut/tur siniri ve retention politikasini yaz.
- [ ] Ilk UI denemesi gerekirse gercek musteri bilgisi olmadan mock survey data ile calissin; form cevaplarini localStorage'a yazma.

## Arastirma Sonrasi Urun Yonu: Sensor Fusion ve Incident Dosyasi

- [x] Gercek urun orneklerinden cikan ortak modeli dokumante et: radar + RF + EO/IR kamera + C2/dashboard + lokal/on-prem evidence.
- [x] `Incident` veya `CorrelatedEvent` domain modelini tasarla; birden fazla `SensorEvent` kaydini tek olay dosyasi altinda birlestirsin.
- [x] Kamera snapshot/clip, radar JSON evidence ve RF JSON evidence referanslarini ayni incident uzerinden gosterecek veri modelini planla.
- [x] Backend'de ilk basit korelasyon kuralini tasarla: yakin zaman araliginda ayni proje/saha icindeki radar, RF ve kamera event'lerini aday incident olarak grupla.
- [x] Frontend'de tekil sensor event listesinin yanina incident/olay dosyasi gorunumu ekle; operator notu, inceleme durumu ve evidence referanslarini gostersin.
- [x] Incident icin lokal review overlay ekle; operator `open/reviewing/confirmed/dismissed` status ve kisa notu backend validation ile kaydedebilsin.
- [x] False alarm azaltma hedefi icin sensor fusion karar notu yaz: tek sensor alarmi, coklu sensor dogrulamasi ve operator onayi farkli severity/guven seviyeleri uretsin.
- [ ] Operator icin acil uyari raporu uretme ve gonderme akisi ekle; radar/kamera olaylari birlesince sistem iki cumlelik, net ve askeri tonda rapor taslagi hazirlasin.
- [ ] Baslangic senaryosu: "ACIL UYARI: Saat 14:20'de X bolgesinde radar, 80 km/s hizla yaklasan IHA temasi tespit etmistir. Kamera hedef bolgeye yonlenmis ancak gorus zayiftir; operator olayi yuksek oncelikli incident olarak takip etmeli, ek sensor dogrulamasi ve komuta bilgilendirmesi baslatilmalidir."
- [ ] Gercek urun arastirmasinda gecen cloud/on-prem seceneklerini deployment kararlarina bagla; varsayilan lokal/on-prem, bulut opsiyonel kalsin.

## Sonraki Asama: Canli Event, Threat Score ve Operator Odak Modu

- [ ] Backend canli event yayini icin WebSocket/SSE karar notu yaz; ilk tercih SSE olabilir, cunku backend'den frontend'e tek yonlu sensor event/incident bildirimi MVP icin yeterlidir.
- [ ] Canli event yayini tasariminda HTTP ingest sozlesmesini koru; WebSocket/SSE sadece UI'in yeni event, incident ve review degisikliklerini anlik almasi icin kullanilsin.
- [ ] Katmanli tehdit matrisi tasarla; radar, RF/SIGINT, EO/IR, C2 ve opsiyonel countermeasure cihazlarini ayri sensor/aksiyon katmanlari olarak modelle.
- [ ] Cihaz adapter mimarisi kararini yaz; her cihaz tipi ortak `connect`, `disconnect`, `health/status`, `capabilities` sozlesmesini kullansin, vendor/protokol detaylari backend adapter icinde kalsin.
- [ ] Cihaz adapter sozlesmesinde countermeasure/jammer cihazlarini sensor gibi veri ureten modullerden ayir; aksiyon uretebilen cihazlarda `arm`, `requestActivation`, `cancelActivation`, `health` ve audit alanlari backend komut katmaninda tanimli olsun.
- [ ] Dinamik sensor entegrasyonu kuralini netlestir: musteri/proje/local kurulumda kayitli cihaz tipine gore harita katmanlari, PPI, kamera, RF waterfall ve aksiyon panelleri bos/dolu durumla sekillensin.
- [ ] Tehdit matrisi UI'inda radar, RF/SIGINT, EO/IR kamera, C2 ve countermeasure katmanlarini ayri gorunum/filtre olarak temsil et; kullaniciya yalnizca kayitli cihaz tiplerine uygun panel ve bos durumlari goster.
- [ ] Incident correlation kurallarini gelistir: ayni proje/saha, yakin zaman penceresi, cihaz tipi uyumu, radar track id, RF frekansi ve kamera dogrulama kaniti birlikte degerlendirilsin.
- [ ] Duplicate incident azaltma ekle; ayni track veya ayni RF/radar eslesmesi tekrar geldiginde yeni olay dosyasi acmak yerine mevcut incident guncellensin.
- [ ] Akilli hedef siniflandirma taslagi ekle; radar hiz/boyut/track metadata'si ile RF sinyal imzasi ve kamera dogrulamasini tek `ThreatCandidate`/incident ozeti altinda birlestirsin.
- [ ] Fusion motorunda RF sinyal imzasi, radar track metadata'si ve kamera/termal evidence'i tek `ThreatCandidate` altinda eslestiren guvenli karar kurallarini yaz; vendor ham payload, IQ data veya gizli protokol detaylari bu modele girmesin.
- [ ] RF AoA/TDoA tahmini konum bilgisini `ThreatCandidate` modeline opsiyonel `estimatedArea`/`errorEllipse` olarak eklemeyi tasarla; kesin hedef koordinati gibi sunulmasin, arama bolgesi olarak etiketlensin.
- [ ] Sürü/cluster threat modeli tasarla; birden fazla radar/RF hedefi yakin konum, benzer heading/speed veya ortak incident baglamiyla tek `ThreatCluster` altinda gruplanabilsin.
- [ ] Cluster analizinde DBSCAN/K-Means gibi algoritmalari degerlendir; ilk uygulama sentetik hedeflerle calissin ve gercek koordinat/hassas saha verisi kullanmasin.
- [ ] Cluster UI'inda cok sayida hedefi tek tek kalabalik gostermek yerine `Suru A`, hedef sayisi, merkez/alan, ortalama heading/speed ve confidence bilgisiyle ozetle.
- [ ] Threat score motoru tasarla: severity, confidence, sensor cesitliligi, yaklasma yonu, menzil, zone ihlali, operator onayi ve evidence sayisindan 0-100 arasi skor uret.
- [ ] Threat score motoruna korunan bolgeye mesafe, hedefin bolgeye yaklasma vektoru, hedef sinifi, cluster buyuklugu ve gorsel/RF dogrulama katsayilarini eklemeyi tasarla.
- [ ] Threat score sonucunu alarm feed, incident karti, harita sonar ve PPI panelinde tutarli goster.
- [ ] Operator odak panelinde hedef/incident listesini threat score'a gore sirala; en yuksek skorlu hedef icin otomatik komut yerine operator onayli kamera yonlendirme onerisi goster.
- [ ] Gorsel dogrulama mumkun kararini tasarla; radar hedefi kamera DORI/FOV identification kapsamina girdiginde operator panelinde guvenli bir "gorsel dogrulama mumkun" uyarisi gosterilsin.
- [ ] Target-centric focus mode ekle: operator bir hedef/incident sectiginde harita, PPI, alarm feed, kamera/evidence ve incident paneli ayni hedef baglamina odaklansin.
- [ ] Focus mode ilk surumde resizable panel gerektirmesin; secili target id/incident id state'i ile mevcut sabit paneller filtrelensin veya vurgulansin.
- [ ] Slew-to-cue karar akisini backend kontrollu ve operator onayli tasarla; otomatik kamera yonlendirme veya aydinlatma komutlari frontend'den direkt cikmasin, audit/rate limit ve yetki kontrolleri zorunlu olsun.
- [ ] ROE/rule-engine karar notu yaz; ilk surum sadece alarm uretme, incident onceligi atama ve operatora onerilen aksiyon listesi cikarma gibi guvenli karar destek davranislari uretsin.
- [ ] ROE kurallarinda gercek PTZ, aydinlatma veya countermeasure komutu otomatik tetiklenmesin; command endpointleri operator/supervisor onayi, audit log, rate limit ve dry-run modu olmadan calismasin.
- [ ] ROE kural editoru tasarlanacaksa kullanici girdisi allowlist'li kosul/aksiyon bloklariyla sinirlansin; serbest kod, script veya backend expression calistirma desteklenmesin.

## Gercek Cihaz Komut, Yetki ve Audit Katmani

- [ ] Mock data ve lokal test akisi bitmeden once gercek cihazlar icin command katmani karar notu yaz; drone, kamera, termal kamera, radar, RF node ve jammer/countermeasure cihazlari ileride gercek donanim olarak baglanacak kabul edilsin.
- [ ] Command endpoint sozlesmesini tasarla: `POST /api/commands/ptz-slew`, `POST /api/commands/countermeasure/request`, `POST /api/commands/cancel`, `GET /api/commands/:id` gibi endpointler yalnizca backend tarafinda cihaz adapter'larina komut iletsin.
- [x] Ilk dry-run command API dilimini ekle: `POST /api/commands/request` guvenli command metadata'si uretsin, `GET /api/commands/:id` sadece yetkili mock kullaniciya status metadata'si dondursun.
- [ ] Gercek komutlar frontend'den dogrudan RTSP, ONVIF, vendor API, UDP/TCP veya jammer protokolune gitmesin; frontend sadece backend'e niyet/istek gondersin ve sonuc metadata'sini gorsun.
- [ ] PTZ yonlendirme, kamera preset, termal kamera mod degisimi, aydinlatma ve countermeasure/jammer aksiyonlarini tek `CommandRequest` / `CommandResult` modeliyle normalize et.
- [ ] Operator/supervisor onay modelini tasarla; dusuk riskli komutlar operator onayi, yuksek riskli countermeasure/jammer aksiyonlari iki asamali operator + supervisor onayi gerektirsin.
- [ ] Komutlarda rol, customer, project/site, access group, product package ve cihaz sahipligi backend tarafinda kontrol edilsin; UI'da buton gizlemek yetki sayilmasin.
- [ ] Komut endpointleri icin audit log tasarla: actor, role, project/site, device id, command type, request payload allowlist'i, approval chain, result, timestamp ve failure reason saklansin.
- [ ] Komut endpointleri icin rate limit ve cooldown kurallari ekle; ayni cihaza pes pese PTZ/countermeasure istegi gonderilmesin, tum reddedilen denemeler audit'e yazilsin.
- [ ] Dry-run/simule komut modu ekle; gercek cihaz baglanmadan once ayni endpointler test adapter ile calissin ve UI gercek komut gibi durum akisini gorebilsin.
- [ ] Komut response'lari credential, RTSP URL, vendor endpoint, jammer frekans detayi veya ham protokol payload'i dondurmesin; yalnizca guvenli status, command id ve operatora gerekli kisa hata mesajlari donsun.

## Radar UI ve Gercek Cihaz Entegrasyon Taktikleri

- [x] Web tabanli PPI radar ekraninin mock Canvas versiyonunu ekle; requestAnimationFrame sweep animasyonu ve fading etkisiyle DOM yerine Canvas cizimi kullan.
- [x] TypeScript mock radar/RF event streamer ekle; gercek donanim olmadan backend ingest ve frontend panelleri kontrollu senaryolarla test edilebilsin.
- [ ] PPI panelini gercek radar track event sozlesmesine bagla; target id, range, azimuth, severity ve confidence alanlariyla mock cizimden canli cizime gec.
- [ ] Click-to-track altyapisini tasarla: harita veya PPI hedefine tiklaninca secili target/incident state'i olussun ve kamera/evidence paneli ayni hedefe odaklansin.
- [ ] PTZ kamera yonlendirme komutu frontend'den direkt gonderilmesin; backend tarafinda allowlist cihaz, yetki, rate limit ve audit log ile kontrollu command endpointi tasarlansin.
- [ ] Kamera pan/tilt hesaplamasi icin hedef konumu ile kamera konumu arasinda bearing/mesafe donusum katmani ekle; ilk versiyonda mock koordinat ve test PTZ adapter kullan.
- [ ] Gercek PTZ/ONVIF entegrasyonu icin credential, RTSP URL ve vendor protokol detaylari sadece backend config/env tarafinda kalsin; frontend'e command sonucu ve guvenli metadata donsun.
- [ ] Kamera FOV/DORI katmanlarini haritada goster; detection/recognition/identification menzilleri cihaz config'inden gelen guvenli metadata ile seffaf sektorler olarak cizilsin.
- [ ] Kamera FOV/DORI gosteriminde sector/konik alan matematigini helper fonksiyona ayir; detection, recognition ve identification katmanlari mock/default koordinatlarla test edilsin.
- [ ] Kamera DORI/FOV hesaplamasinda gercek musteri koordinati veya hassas saha verisi kullanmadan once mock/default koordinatla matematik ve UI davranisini test et.
- [ ] RF/SIGINT waterfall paneli tasarla; frekans gucu/dBm benzeri normalize mock spektrum verisini Canvas uzerinde goster, ham IQ veya hassas RF payload'ini frontend state'ine alma.
- [ ] RF/SIGINT waterfall icin backend response sozlesmesini sade `SpectrumFrame` modeli olarak tasarla; frequency bin, normalized power/dBm, timestamp ve device id disinda ham IQ veya hassas payload dondurme.
- [ ] RF waterfall canli akisinda Web Worker kullan; backend'den gelen sade spektrum frame modeli worker'da islenip Canvas'a aktarilsin.
- [ ] Countermeasure/jammer UI karari yaz; gercek bastirma/tetikleme komutu eklenmeden once yalnizca mock/simule durum, yasal risk notu ve yetki modeliyle planlansin.
- [ ] Countermeasure aksiyonu icin "slide to arm/activate", geri sayim, iki asamali operator + supervisor onayi, rate limit ve audit log gereksinimlerini dokumante et.
- [ ] Countermeasure panelinde siradan tek tikli aksiyon kullanma; ilk prototip yalnizca simule `armed`, `pending-approval`, `countdown`, `cancelled` ve `expired` durumlarini gostersin.
- [ ] Slew-to-cue ve aydinlatma benzeri hareketli cihaz komutlarini otomatik tetikleme olarak uygulama; ilk asamada backend oneri uretsin, operator onayi ve audit olmadan komut gonderilmesin.
- [ ] Canli event yukunde tarayiciyi rahatlatmak icin Web Worker karari yaz; WebSocket/SSE dinleme, koordinat donusumu ve filtreleme worker icinde yapilip UI'a sade cizim modeli gonderilsin.
- [ ] Worker kullanildiginda ana thread'e sadece goruntulenecek hedef listesi, incident ozeti ve render komutlari aktarilsin; ham radar/RF/kamera payload'i UI state'ine alinmasin.
- [ ] Protokol uyumlu mock server/simulator yol haritasi ekle; TypeScript streamer korunurken ileride Python veya Node ile UDP/WebSocket/JSON formatlarini taklit eden ayri simulator eklenebilsin.
- [ ] TypeScript tabanli UDP/JSON radar simulatoru ekle; sentetik hedef id, koordinat, hiz ve timestamp uretip backend'in izinli lokal listener'ina gondersin.
- [ ] Backend tarafinda UDP radar listener/adapter tasarla; gelen simulator paketlerini validate edip ham payload'i UI'a acmadan normalize `SensorEvent` sozlesmesine cevirsin.
- [ ] Gercek radar ICD dokumani geldikten sonra ham protokol parser katmani tasarla; ASTERIX Cat 010/040 veya vendor ham byte formatlari backend sinirinda normalize SensorEvent JSON'una cevrilsin.
- [ ] Ham radar byte parser icin sentetik Buffer fixture ve unit testleri ekle; eksik paket, uzunluk, hedef sayisi, mesafe ve status bit maskesi gibi durumlar dogrulansin.
- [ ] Ham protokol parser sonucunda kodun geri kalani ham byte/hex gormesin; sadece typed `SensorEvent` ve `Incident` sozlesmeleriyle calissin.
- [ ] Kamera canli goruntu denemesi icin backend kontrollu RTSP -> WebRTC kopru karari yaz; MediaMTX gibi adapterlar sadece lokal/on-prem opsiyon olarak degerlendirilsin, RTSP URL ve credential frontend'e cikmasin.
- [ ] WebRTC kamera denemesinde frontend'e sadece guvenli stream id/durum metadata'si donsun; gercek medya kaynagi, credential ve vendor endpointleri backend config/env tarafinda kalsin.
- [ ] Video OSD/reticle overlay tasarimini yaz; WebRTC video uzerine seffaf Canvas katmani ile yalnizca normalize hedef id, range, altitude ve confidence bilgisi cizilsin.
- [ ] Radar hedef koordinati + kamera PTZ/FOV metadata'sini video piksel koordinatina ceviren projeksiyon helper'ini tasarla; ilk testler mock koordinat ve kaydedilmis demo frame ile yapilsin.
- [ ] Video OSD katmaninda ham video frame, RTSP URL, ONVIF credential veya vendor endpoint frontend state'ine alinmasin; frontend sadece backend'in verdigi stream id ve overlay modelini kullansin.
- [ ] System health paneli tasarla; radar, kamera, RF node ve countermeasure cihazlari icin normalize `DeviceHealth` modeliyle sicaklik, voltaj, guc durumu, defrost/fan/GPU gibi guvenli telemetry alanlarini goster.
- [ ] Cihaz saglik telemetry adapter'lari icin SNMP/HTTP gibi protokolleri backend sinirinda tut; frontend'e credential, internal endpoint veya ham vendor payload dondurme.
- [ ] Donanim durum matrisinde uyarilari garanti/performance iddiasi gibi sunmadan `normal`, `warning`, `critical`, `unknown` durumlariyla goster; esik degerleri model katalogu/config tarafindan gelsin.
- [ ] Ilk hafta entegrasyon yol haritasini uygula: ICD isteme, simulatoru calistirma, canli event hattini kurma, mock hedefleri haritada/PPI'da oynatma, kontrollu kamera snapshot/WebRTC denemesi.

## Ileri Harita ve Radar Track Gelistirmeleri

- [ ] Radar event metadata sozlesmesini genislet: `rangeMeters`, `azimuthDegrees`, `speedMps`, `altitudeMeters`, `headingDegrees` alanlari opsiyonel olarak desteklensin.
- [ ] Radar/RF hedefleri icin 2D haritada hiz vektoru ve kisa vadeli tahmini konum gostergesi tasarla; tahminin belirsizlik icerdigi UI'da acik olsun.
- [ ] Haritada radar hedefinin gidis yonunu kucuk ok veya vektor ile goster; hedef sadece nokta olarak kalmasin.
- [ ] Radar metadata icinde `altitudeMeters` varsa marker veya HUD tooltip yaninda `ALT: 120m` gibi kisa etiket goster.
- [ ] Radar metadata'sinda onceki/yeni altitude degerleri varsa marker yaninda yukseliyor/alcaliyor durumunu kucuk ok veya kisa etiketle goster.
- [ ] Hedef yaklasma yonundeyse renk, severity veya uyari seviyesi belirginlessin; bu kural radar metadata genisledikten sonra eklenmeli.
- [ ] 3D radar gosterimi icin CesiumJS karar notu yaz; MVP'de Leaflet 2D kalacaksa altitude/drop-line yerine etiket, vektor ve panel ozeti kullanilsin.
- [ ] CesiumJS denenirse drone hedefi, altitude ve drop-line gosterimi yalnizca mock/demo koordinatlarla test edilsin; gercek musteri/saha koordinati kullanilmasin.
- [ ] LOS/kor nokta analizi icin CesiumJS terrain veya lokal terrain veri karari yaz; ilk prototipte mock arazi ve demo cihaz koordinatlari kullanilsin.
- [ ] Radar/kamera line-of-sight analizini planla; gorus disi alanlar haritada seffaf risk katmani olarak gosterilsin ve sonuclar kesin kapsama garantisi gibi sunulmasin.
- [ ] LOS hesaplamasi agirlasirsa backend/worker tarafinda calisan sade `CoverageSector`/`BlindSpotArea` modeli uret; frontend sadece cizim katmanlarini alsin.
- [ ] RF AoA/TDoA harita katmani tasarla; birden fazla RF node'dan gelen normalize bearing/time-difference verisiyle seffaf arama poligonu veya hata elipsi cizilsin.
- [ ] RF AoA/TDoA hesaplamalarini helper fonksiyona ayir ve sentetik node koordinatlariyla test et; frontend'e ham IQ, hassas zamanlama payload'i veya vendor protokol detayi aktarilmasin.
- [ ] Sensor menzil katmanlarini cihaz tipine gore ayir; radar instrumented range, kamera FOV/DORI, RF kapsama ve C2 durum katmanlari Leaflet layer control ile acilip kapanabilsin.
- [ ] Radar model profilinden gelen guvenli maksimum/instrumented range metadata'si ile haritada otomatik radar menzil dairesi ciz; bu degerler garanti/performance iddiasi gibi sunulmasin.
- [ ] Bu 2D harita iyilestirmeleri CesiumJS'e gecmeden once Leaflet uzerinde uygulanabilir kalmali.

## Mission Replay ve Debriefing

- [ ] BlackBox/mission replay karar notu yaz; radar, RF, kamera evidence, alarm, incident review ve countermeasure durum degisiklikleri zaman damgali replay event modeliyle saklansin.
- [ ] Replay store icin PostgreSQL/TimescaleDB veya mevcut lokal event store genisletme seceneklerini karsilastir; ham medya veya hassas payload yerine event metadata, evidence referansi, hash ve actor/audit bilgisi tutulsun.
- [ ] Frontend'e playback timeline tasarla; kullanici tarih/saat araligi secip 1x, 2x ve 4x hizda harita/PPI/incident akisini yeniden oynatabilsin.
- [ ] Replay yayininda canli WebSocket/SSE hattindan ayri bir mod kullan; gecmis veriler frontend'e normalize replay frame olarak gitsin, ham radar/RF/kamera payload'i acilmasin.
- [ ] Countermeasure veya operator aksiyonlari replay'de yalnizca audit kaydi ve simule durum olarak gorunsun; replay modu gercek cihaz komutu tetikleyemesin.

## Offline-First Harita ve Lokal Calisma

- [ ] Offline-first harita karar notu yaz; lokal/on-prem kurulumda internet yokken harita, cihaz katmanlari ve operasyon panelleri temel islevlerini korusun.
- [ ] Lokal tile/mbtiles sunumu icin backend static tile endpointi veya tile server seceneklerini degerlendir; lisans, veri boyutu ve guncelleme sorumlulugu not edilsin.
- [ ] Frontend PWA/service worker stratejisini tasarla; harita tile'lari, temel UI assetleri ve mock/demo operasyon verisi Cache Storage/IndexedDB ile kontrollu onbelleklensin.
- [ ] Offline modda kullaniciya harita verisinin tarihi, kapsama alani ve senkronizasyon durumu acik gosterilsin; eksik tile veya eski veri sessizce dogruymus gibi sunulmasin.
- [ ] Offline cache'e secret, credential, ham radar/RF payload'i, RTSP URL veya hassas musteri dokumani yazilmamasini guvenlik kuralina bagla.

## Ileri Cihaz Kurulum ve Model Katalogu

- [ ] Cihaz ekleme sihirbazini ileride model katalogu destekleyecek sekilde tasarla; cihaz tipi, model, guvenli metadata, IP/port ve konum adimlari backend validation ile ilerlesin.
- [ ] Cihaz ekleme sihirbazinda radar, kamera, RF/SIGINT node ve countermeasure tiplerini model katalogundan sectir; model secimi UI davranisini ve bos/dolu panelleri belirlesin.
- [ ] Model katalogunda vendor credential, RTSP URL, gizli protokol detayi veya musteriye ozel hassas performans dokumani tutulmasin; sadece UI icin gerekli guvenli yetenek/maksimum menzil metadata'si yer alsin.
- [ ] Model katalogunda kamera icin guvenli DORI/FOV metadata'si, radar icin guvenli menzil metadata'si, RF icin normalize frekans kapsami metadata'si ve countermeasure icin yalnizca simule/izin gerektiren capability flag'leri tutulsun.
- [ ] IP/port girisi aktif tarama baslatmasin; sadece izinli lokal/on-prem backend adapter config taslagi olarak validate edilsin.
- [ ] Harita uzerinden konumlandirma sadece mock/default koordinat veya kullanicinin acikca girdigi lokal proje koordinati ile calissin; gercek musteri koordinati hassas kabul edilsin.

## En Oncelikli: Musteri/Paket/Yetki Modeli

- [ ] Login sonrasi kullanicinin `customer`, `project/site`, `role`, `access group` ve paket yetkisini backend tarafinda hesaplayan modeli tasarla.
- [x] `camera-thermal`, `rf-monitoring`, `radar-ops`, `full-ops` gibi product package tanimlarini domain modeline ekle.
- [x] Paketlerin izin verdigi `allowedDeviceTypes` ve `allowedModules` alanlarini netlestir.
- [x] Her musterinin sadece kendi proje/saha cihazlarini, camera feedlerini, alarmlarini ve verisini gorecegi veri izolasyonu kuralini uygula.
- [x] Cok sayida viewer icin tek tek cihaz atamak yerine `access group` tabanli yetkilendirme tasarla.
- [x] API response'larini kullanicinin effective access sonucuna gore filtrele; yetkisiz radar/RF/C2/kamera verisini client'a hic dondurme.
- [x] Frontend dashboardu lokal kurulum modunda paket/modul saklama yerine bagli cihazlara gore sekillendir; satin alma/paket kisitlari ileride kurumsal/admin modda uygulanacak.
- [ ] Database schema taslagina `customers`, `projects/sites`, `product_packages`, `modules`, `access_groups`, `group_memberships` ve ilgili iliskileri ekle.

## Kisa Vade

- [x] UI-first MVP yaklasimini takip et: once mock operasyon verisi, sonra backend/database.
- [x] Vite + React + TypeScript projesi kur.
- [x] Fluent UI veya benzer component library ekle.
- [x] Ilk calisan dashboard ekranini ayaga kaldir.

## UI-First MVP

- [x] Ana layout olustur: ust bar, sol panel, ana icerik, sag alarm paneli.
- [x] Ustte ozet kartlari koy: aktif cihaz, aktif alarm, online cihaz, kritik durum.
- [x] Cihaz listesi UI'i yap.
- [x] Cihaz listesi arama ve durum filtresi ekle.
- [x] Alarm listesi UI'i yap.
- [x] Musteri/proje formu UI'i yap.
- [x] Musteri/proje formu validation ve success feedback ekle.
- [x] Basit harita/operasyon alani placeholder'i yap.
- [x] Mock koordinatlarla marker ve menzil cemberi goster.
- [x] Loading, empty, error ve success durumlarini goster.
- [x] Otomatik kanit kaydi ve sensor event uretimi icin loading/error/success durumlarini backend event panelinde goster.
- [x] Mobil/dar ekran icin responsive duzen ekle.

## RadarDesk MVP

- [x] 8 adimli proje planini takip et.
- [x] Veri gecis stratejisini koru: mock data -> mock API -> gercek API -> Neon Postgres.
- [x] Proje dashboard ana ekranini tasarla.
- [x] `src/mocks/devices.ts` dosyasini olustur.
- [x] `src/mocks/alerts.ts` dosyasini olustur.
- [x] `src/mocks/projects.ts` dosyasini olustur.
- [x] Mock cihaz listesi olustur.
- [x] Cihaz durumlarini goster: online, offline, warning, alarm.
- [x] Alarm listesi ekle.
- [x] Alarm listesi severity filtresi ekle.
- [x] Musteri/proje formu ekle.
- [x] Harita ekrani icin teknoloji sec: Leaflet, Mapbox veya Google Maps.
- [x] Backend calismasa bile mock veriden operasyon gorunumu uret.

## JavaScript ve TypeScript Ogrenme

- [ ] JavaScript temel konularini tekrar et.
- [x] TypeScript temel tiplerini calis.
- [x] `hello-world.ts` dosyasini temiz ders orneklerine cevir.
- [x] Basit degisken, fonksiyon, array ve object alistirmalari ekle.
- [x] Her yeni konu icin kucuk test veya calistirma kontrolu ekle.

## Backend

- [x] Backend'i UI MVP'den sonra ele al.
- [x] Node.js + TypeScript backend yapisini planla.
- [x] Express veya Fastify sec.
- [x] `/health` endpointi ekle.
- [x] Cihaz listesi icin mock API endpointi ekle.
- [x] Alarm listesi icin mock API endpointi ekle.
- [x] Proje listesi icin mock API endpointi ekle.
- [x] Kamera dogrulama metadata'si icin mock API endpointi ekle.
- [x] Satis oncesi lokal test icin backend tarafinda gercek kamera metadata provider hazirla; stream URL ve credential'lari client'a dondurme.
- [x] `/api/camera-feeds/:id/snapshot` endpointi ekle; response sadece lokal kanit metadata'si dondursun, kamera URL/credential dondurmesin.
- [x] Cihazlari onceden Kuzey/Guney gibi sabit adlarla tutmak yerine once kesfedilen cihaz listesinden sectir, sonra kullanicinin verdigi saha adiyla kaydet.
- [ ] Gercek cihaz kesfi icin izinli IP araligi/port/protokol stratejisini dokumante et; rastgele veya genis ag taramasi yapma.
- [x] Cihaz tipine gore analiz servisi secen backend mapping ekle: `thermal-camera`, `visible-camera`, `radar`, `rf-receiver`, `c2`.
- [x] Analiz pipeline taslagindan mock sensor event ureten servis ekle; gercek ingest gelince ayni event sozlesmesini kullansin.
- [x] Form kaydi icin API endpointi ekle.
- [x] Input validation ekle.
- [x] Hata cevap formatini standartlastir.
- [x] Backend klasor yapisini olustur: `server/src/app.ts`, `server/src/routes`, `server/src/middleware`, `server/src/types`.
- [x] Backend icin TypeScript build ve dev scriptlerini ekle.
- [x] Backend endpointlerinde sadece mock veri kullan; gercek musteri/saha/veri baglantisi yapma.
- [x] API response modellerini frontend `Device`, `Alert`, `Project` tipleriyle uyumlu tut.
- [x] Form kaydinda yazilabilir alanlari allowlist ile sinirla: `name`, `customer`, `site`, `status`.
- [x] Backend icin en az `/health` ve validation testlerini ekle.

## Arastirma Sonrasi Gelistirme Firsatlari

- [x] `src/app/App.tsx` icindeki liste, form, metrik ve layout parcaciklarini feature componentlerine ayir.
- [ ] Dashboard'daki turetilmis verileri buyuk veri setine gecmeden once `useMemo` adaylari olarak not et; sadece olcum veya belirgin maliyet varsa uygula.
- [x] Form ve filtre kontrolleri icin erisilebilir ad, hata mesaji ve klavye ile kullanim kontrolu yap.
- [x] Leaflet haritasinda cihaz markerlari, menzil cemberleri ve alarm/bolge katmanlari icin layer group/layer control taslagi hazirla.
- [x] Mock data'dan mock API'ye gecis icin `src/services/` altinda typed data access fonksiyonlari planla.
- [x] Vitest coverage komutu eklemeyi degerlendir: `vitest run --coverage`.
- [x] Backend baslarken request validation, response allowlist ve merkezi error handler tasarimini birlikte ekle.

## Kod Incelemesinde Gorulen Eksikler

- [x] `src/mocks/users.ts` ekle; sadece mock admin/operator/viewer kullanicilari icersin.
- [x] `User` ve `UserRole` domain tiplerini `src/types/domain.ts` icine ekle.
- [x] Sidebar'daki `Devices`, `Projects`, `Reports` butonlari icin ya basit view state ekle ya da henuz pasif olduklarini UI'da tutarli goster.
- [x] `src/services/mockApi.ts` fonksiyonlarini ileride gercek API'ye gecisi kolaylastiracak async servis sozlesmesine yaklastir.
- [x] Frontend veri yukleme akisini servis katmanindan gelecek loading/error durumlarini kullanacak sekilde hazirla.
- [x] Frontend servis katmanini `VITE_API_BASE_URL` varsa backend API'ye, yoksa mock veriye gidecek sekilde ayarla.
- [x] `ProjectIntakeCard` submit davranisini backend gelene kadar mock servis fonksiyonuna bagla.
- [x] Harita panelinde alert/bolge overlay taslagini mock veriyle ekle; gercek koordinat veya saha bilgisi kullanma.
- [x] Liste satirlarinda tarih/saat formatlama icin kucuk bir `utils/formatters.ts` dosyasi ekle.
- [ ] `App.tsx` icindeki ana layout parcaciklarini ileride `components/layout` altina ayirma adaylarini not et.
- [x] Coverage raporunda acik kalan `dashboardViewState.ts` ve `projectForm.ts` branch'leri icin eksik test senaryolarini tamamla.
- [x] `npm.cmd run build`, `npm.cmd test`, `npm.cmd run test:coverage` sonuclarini README veya dokumantasyon notlarina kisa olarak ekle.

## Database

- [ ] Neon Free Postgres hesabi/projesi planla.
- [ ] Temel tablolar icin schema tasarla.
- [ ] `projects`, `devices`, `alerts`, `users` tablolarini dusun.
- [ ] Migration araci sec.
- [x] `.env.example` dosyasini ekle.
- [ ] Ilk schema taslaginda hassas savunma verisi, gercek koordinat ve musteri dokumani saklama.
- [ ] Kamera/radar olay kayitlarinda ham medya dosyasini database'e gommek yerine lokal dosya yolu, hash, zaman ve cihaz referansi tut.
- [ ] Seed verisini sadece mock egitim kayitlarindan olustur.
- [ ] Database baglantisini sadece backend tarafinda kullanacak sekilde planla.
- [ ] Migration komutlarini package scriptlerine eklemeden deploy akisini tamamlanmis sayma.

## Security

- [ ] Secret ve tokenlarin koda yazilmadigini kontrol et.
- [ ] PDF ve hassas is dokumanlarinin git'e eklenmedigini kontrol et.
- [ ] CORS stratejisini belirle.
- [ ] Kullanici rolleri taslagini hazirla: admin, operator, viewer.
- [ ] Auth yaklasimini sec: Firebase Auth veya backend JWT.
- [ ] API endpointlerinde kullanicinin erisebilecegi obje ve alanlar backend tarafinda kontrol edilecek sekilde planla.
- [x] Form kaydi icin client'tan gelen her alan kabul edilmeyecek; yazilabilir alanlar allowlist ile sinirlanacak.
- [ ] `.gitignore` hassas yerel dosyalari disarida tutuyor mu her release oncesi kontrol et.
- [ ] Frontend'de kullanici girdisini HTML olarak basan kod olmadigini kontrol et.
- [ ] Backend hata cevaplarinda stack trace veya teknik detay donmemesini sagla.
- [ ] Auth baslamadan once rol matrisi yaz: admin hangi islemleri yapar, operator ne yapar, viewer ne gorur.

## Deployment

- [ ] Frontend icin Firebase Hosting veya Vercel sec.
- [ ] Backend icin Render ayarlarini planla.
- [ ] Database icin Neon connection string ortam degiskeni olarak tutulacak.
- [ ] Production CORS domainini ayarla.
- [x] Build ve deploy komutlarini README'ye ekle.
- [x] `.env.example` ekle; gercek secret koyma.
- [x] `VITE_` ile baslayan frontend env degerlerinin bundle icinde gorunebilecegini README/deploy notlarinda belirt.
- [x] Frontend icin public `VITE_API_BASE_URL` ornegini `.env.example` dosyasinda acikla.
- [x] Backend icin `DATABASE_URL`, `CORS_ORIGIN`, auth secilirse `JWT_SECRET` orneklerini `.env.example` dosyasinda placeholder olarak belirt.
- [x] Render health check yolunu `/health` olarak dokumante et.
- [ ] Deploy oncesi resmi Firebase/Vercel/Render/Neon free-tier limitlerini tekrar kontrol et.
- [ ] Production deploy icin hassas PDF, is notu ve local dokumanlarin build/deploy paketine girmedigini kontrol et.

## Dokumantasyon

- [ ] `README.md` dosyasini proje ilerledikce guncelle.
- [ ] `docs/project-brief.md` dosyasini MVP kararlarina gore guncelle.
- [ ] `docs/ai-guides/*` rehberlerini yeni ihtiyaclara gore guncelle.
- [x] Yeni ozellik veya davranis degisikliginde once TODO ve ilgili `.md` dosyalarina karar notu yaz, sonra kodlamaya basla kuralini netlestir.
- [ ] Yeni ozelliklerden sonra test ve dogrulama notlarini ekle.
- [x] Frontend MVP tamamlanan ozellikleri ve kalan backend/database islerini README'de ayri bolumlerde listele.
- [ ] Yeni backend baslangici icin kisa karar kaydi yaz: neden Express/Fastify secildi, hangi endpointler once gelecek.
- [x] Mock veri kullanimi politikasini README'de netlestir: gercek musteri, saha, koordinat ve PDF verisi kullanilmaz.

## Yarin: BISAVUNMA C2 Urun Polish

- [ ] C2 dashboard gorsel dilini BİSAVUNMA kurumsal urun hissine yaklastir; demo/neon yogunlugunu azalt, daha sade ve guvenilir operasyon UI tonu kullan.
- [ ] UI dilini netlestir: tamamen TR, tamamen EN veya i18n destekli iki dil secenegi; `Evidence`, `Gecmis`, `Kamera Oner`, `Incidents` gibi karisik etiketleri tutarli hale getir.
- [ ] Her cihaz icin `DeviceDetailCard` tasarla; model no, protokol, baglanti tarihi, uptime, health, firmware, son paketler ve varsa evidence/snapshot referanslarini tek kartta goster.
- [ ] Cihaz listesi, harita marker'i ve PPI/RF/kamera panellerinden secili cihaza odaklanan ortak `selectedDeviceId` state akisini tasarla.
- [ ] BİSAVUNMA urun zincirine uygun mitigation/countermeasure panelini planla; jammer/hard-kill aksiyonlari ilk etapta sadece dry-run, yetki, audit ve supervisor onay modeliyle gorunsun.
- [ ] Slew-to-cue akisini backend command/audit modeliyle hizala; frontend sadece onerilen kamera yonlendirme niyetini gondersin, RTSP/ONVIF/vendor komutu direkt cikmasin.
- [ ] Son 24 saat/gecmis veriler davranisini kamera, radar, RF, alarm ve incident panellerinde ortak component veya helper ile tutarli hale getir.
- [ ] Evidence/snapshot gecmisi icin backend kontratini netlestir: `evidence_id`, `incident_id`, safe `preview_url`, hash, captured_at ve yetki/audit alanlari.
- [ ] Harita ve cihaz konumlari icin demo/default koordinat politikasini yaz; gercek musteri veya hassas saha koordinati mock veriye girmesin.
- [ ] Build/test kontrolunden sonra C2 ekraninda mobil/desktop tasma, metin sikisma, kart ic scroll ve tooltip davranislarini Playwright/screenshot ile gozden gecir.
