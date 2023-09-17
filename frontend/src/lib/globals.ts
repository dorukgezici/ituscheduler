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
  { time: "8:30-9:29", timeStart: 830, timeEnd: 929 },
  { time: "9:30-10:29", timeStart: 930, timeEnd: 1029 },
  { time: "10:30-11:29", timeStart: 1030, timeEnd: 1129 },
  { time: "11:30-12:29", timeStart: 1130, timeEnd: 1229 },
  { time: "12:30-13:29", timeStart: 1230, timeEnd: 1329 },
  { time: "13:30-14:29", timeStart: 1330, timeEnd: 1429 },
  { time: "14:30-15:29", timeStart: 1430, timeEnd: 1529 },
  { time: "15:30-16:29", timeStart: 1530, timeEnd: 1629 },
  { time: "16:30-17:29", timeStart: 1630, timeEnd: 1729 },
  { time: "17:30-18:29", timeStart: 1730, timeEnd: 1829 },
];
