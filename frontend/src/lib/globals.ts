export type Day = {
  nameTr: string;
  nameEn: string;
};

export type Hour = {
  time: string;
  timeStart: number;
  timeEnd: number;
};

export const daySlots: { [key: string]: Day } = {
  "1": { nameTr: "Pazartesi", nameEn: "Monday" },
  "2": { nameTr: "Salı", nameEn: "Tuesday" },
  "3": { nameTr: "Çarşamba", nameEn: "Wednesday" },
  "4": { nameTr: "Perşembe", nameEn: "Thursday" },
  "5": { nameTr: "Cuma", nameEn: "Friday" },
};

export const hourSlots: Hour[] = [
  { time: "8:30-8:59", timeStart: 830, timeEnd: 859 },
  { time: "9:00-9:29", timeStart: 900, timeEnd: 929 },
  { time: "9:30-9:59", timeStart: 930, timeEnd: 959 },
  { time: "10:00-10:29", timeStart: 1000, timeEnd: 1029 },
  { time: "10:30-10:59", timeStart: 1030, timeEnd: 1059 },
  { time: "11:00-11:29", timeStart: 1100, timeEnd: 1129 },
  { time: "11:30-11:59", timeStart: 1130, timeEnd: 1159 },
  { time: "12:00-12:29", timeStart: 1200, timeEnd: 1229 },
  { time: "12:30-12:59", timeStart: 1230, timeEnd: 1259 },
  { time: "13:00-13:29", timeStart: 1300, timeEnd: 1329 },
  { time: "13:30-13:59", timeStart: 1330, timeEnd: 1359 },
  { time: "14:00-14:29", timeStart: 1400, timeEnd: 1429 },
  { time: "14:30-14:59", timeStart: 1430, timeEnd: 1459 },
  { time: "15:00-15:29", timeStart: 1500, timeEnd: 1529 },
  { time: "15:30-15:59", timeStart: 1530, timeEnd: 1559 },
  { time: "16:00-16:29", timeStart: 1600, timeEnd: 1629 },
  { time: "16:30-16:59", timeStart: 1630, timeEnd: 1659 },
  { time: "17:00-17:29", timeStart: 1700, timeEnd: 1729 },
  { time: "17:30-17:59", timeStart: 1730, timeEnd: 1759 },
  { time: "18:00-18:29", timeStart: 1800, timeEnd: 1829 },
];
