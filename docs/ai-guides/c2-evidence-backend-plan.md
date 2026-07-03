# C2 Evidence Backend Plan

Bu not, NEXUS C2 arayuzundeki kamera snapshot, alarm kaniti ve olay dosyasi akisinin backend tarafinda nasil modellenmesi gerektigini tanimlar.

## Amac

CameraFeedCard icindeki Evidence paneli ham RTSP/ONVIF akisini veya yerel dosya sistemini dogrudan okumaz. Frontend sadece backend tarafindan uretilmis guvenli metadata kayitlarini gosterir. Snapshot, kisa video klip, AI detection sonucu ve alarm baglantisi backend evidence store tarafinda tutulur.

## Veri Siniri

- Frontend state kaynagi: `CameraEvidenceEvent[]`, `AlarmLog[]`, `IncidentFolder[]`
- Frontendin gorecegi alanlar: evidence id, device id, model no, timestamp, imaging mode, classification, confidence score, plate, safe preview reference
- Frontendin gormemesi gerekenler: RTSP URL, kamera sifresi, vendor token, mutlak local path, ham dosya sistemi path'i
- Production icin `evidence_snapshot_mock_url` yerine opaque `evidence_id`, signed preview URL veya backend proxy path kullanilmalidir.

## Onerilen API Kontrati

Backend ilk etapta su endpointleri saglamalidir:

```http
GET /api/c2/evidence?deviceId=BIS-CAM-02&limit=20
GET /api/c2/incidents/:incidentId/evidence
POST /api/c2/camera/slew-to-cue
GET /api/c2/realtime/events
```

`GET /api/c2/evidence` kamera snapshot ve AI detection kayitlarini kronolojik doner.

```ts
interface EvidenceRecordDto {
  evidence_id: string
  device_id: string
  model_no: string
  incident_id?: string
  protocol: 'RTSP_H264'
  imaging_mode: 'DAYLIGHT' | 'THERMAL_IR'
  threat_classification: 'DRONE' | 'HUMAN_INTRUSION' | 'MILITARY_VEHICLE' | 'SUSPICIOUS_CIVILIAN'
  confidence_score: number
  detected_plate?: string
  preview_url: string
  captured_at: string
  hash_sha256?: string
}
```

`POST /api/c2/camera/slew-to-cue` radar veya RF tarafindan uretilen hedef koordinatini EO/IR kameraya yonlendirmek icin komut metadatasi alir. Frontend bu komutu dogrudan cihaza gondermez; backend yetkilendirme, audit ve cihaz adaptoru katmanindan sorumludur.

```ts
interface SlewToCueCommandDto {
  target_id: string
  device_id: string
  latitude: number
  longitude: number
  altitude_meters?: number
  trigger_source: 'operator' | 'auto-correlation'
  dry_run: boolean
}
```

## Saklama Modeli

- Evidence dosyalari backend kontrolundeki local evidence store veya object storage altinda tutulur.
- Metadata veritabani kaydi dosya referansini, hash bilgisini, capture zamanini ve ilgili alarm/incident iliskisini saklar.
- Frontend dosyanin mutlak yolunu bilmez; sadece backend tarafindan servis edilen preview/download referansini kullanir.
- Dosya silme, retention ve arama islemleri backend policy ile yonetilir.

## Guvenlik ve Audit

- Evidence goruntuleme ve indirme islemleri kullanici yetkisine baglanmalidir.
- Her preview, download, export ve camera command islemi audit log'a yazilmalidir.
- Kamera credential, RTSP URL ve vendor token sadece backend secret/config katmaninda tutulmalidir.
- Frontend tarafinda mock veri kalabilir; production adapter aktif oldugunda ayni typed state kontratina veri basmalidir.

## Gecis Plani

1. Mock `CameraEvidenceEvent[]` akisi korunur.
2. Backend `GET /api/c2/evidence` endpointi ayni alanlara yakin DTO dondurur.
3. Frontend adapter DTO'yu `CameraEvidenceEvent` veya yeni `EvidenceRecord` tipine normalize eder.
4. Evidence panel mock listeden backend listesine gecirilir.
5. Mock generator sadece demo/dev modunda kalir.
