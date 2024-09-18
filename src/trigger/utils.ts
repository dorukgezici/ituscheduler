export function splitTimeStr(timeStr: string): [number, number] {
  let timeStart = 0;
  let timeEnd = 0;

  const timeStrs = timeStr.split("/");

  if (timeStrs.length > 0) {
    const timeInt = parseInt(timeStrs[0], 10);
    if (!isNaN(timeInt)) {
      timeStart = timeInt;
    }
  }

  if (timeStrs.length > 1) {
    const timeInt = parseInt(timeStrs[1], 10);
    if (!isNaN(timeInt)) {
      timeEnd = timeInt;
    }
  }

  return [timeStart, timeEnd];
}
