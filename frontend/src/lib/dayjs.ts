import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export function dateStr(date?: Date | string | null, withTime: boolean = true): string {
  let dateFormatter = dayjs(date);
  return withTime ? dateFormatter.format("LLL") : dateFormatter.format("LL");
}

export function dateAgo(date?: Date | string | null): string {
  return dayjs(date).fromNow();
}
