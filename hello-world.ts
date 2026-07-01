type DeviceStatus = "online" | "offline" | "warning" | "alarm";

type LessonDevice = {
  id: string;
  name: string;
  status: DeviceStatus;
  batteryLevel: number;
  location?: string;
};

const lessonTitle = "RadarDesk TypeScript temelleri";
let completedExampleCount = 0;

const increaseCompletedExamples = (): void => {
  completedExampleCount += 1;
};

const assertEqual = <T>(label: string, actual: T, expected: T): void => {
  if (actual !== expected) {
    throw new Error(`${label}: beklenen ${expected}, gelen ${actual}`);
  }

  console.log(`OK - ${label}`);
};

const formatDeviceSummary = (device: LessonDevice): string => {
  const locationText = device.location ?? "konum yok";

  return `${device.name} | ${device.status} | batarya %${device.batteryLevel} | ${locationText}`;
};

const getOnlineDeviceNames = (devices: LessonDevice[]): string[] => {
  return devices
    .filter((device) => device.status === "online")
    .map((device) => device.name);
};

const calculateAverageBattery = (devices: LessonDevice[]): number => {
  if (devices.length === 0) {
    return 0;
  }

  const totalBattery = devices.reduce((total, device) => total + device.batteryLevel, 0);

  return Math.round(totalBattery / devices.length);
};

const devices: LessonDevice[] = [
  {
    id: "dev-001",
    name: "North Field Radar",
    status: "online",
    batteryLevel: 96,
    location: "Saha A",
  },
  {
    id: "dev-002",
    name: "Harbor Sensor",
    status: "warning",
    batteryLevel: 58,
    location: "Saha B",
  },
  {
    id: "dev-003",
    name: "Training Unit",
    status: "offline",
    batteryLevel: 15,
  },
];

console.log(lessonTitle);
console.log("1. const sabit degerler icin, let degisecek degerler icin kullanilir.");
increaseCompletedExamples();
assertEqual("ornek sayaci artar", completedExampleCount, 1);

console.log("2. Fonksiyonlar parametre ve donus tipiyle daha okunur olur.");
const firstDeviceSummary = formatDeviceSummary(devices[0]);
increaseCompletedExamples();
assertEqual(
  "cihaz ozeti uretilir",
  firstDeviceSummary,
  "North Field Radar | online | batarya %96 | Saha A",
);

console.log("3. Array metotlari liste uzerinden temiz hesaplama yapar.");
const onlineDeviceNames = getOnlineDeviceNames(devices);
increaseCompletedExamples();
assertEqual("online cihaz sayisi bulunur", onlineDeviceNames.length, 1);
assertEqual("ilk online cihaz adi bulunur", onlineDeviceNames[0], "North Field Radar");

console.log("4. Object tipleri alanlari ve izinli durumlari netlestirir.");
const averageBattery = calculateAverageBattery(devices);
increaseCompletedExamples();
assertEqual("ortalama batarya hesaplanir", averageBattery, 56);

console.log(`${completedExampleCount} ders ornegi tamamlandi.`);
