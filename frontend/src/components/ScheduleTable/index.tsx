import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useScheduleCourses from "@/hooks/useScheduleCourses";
import { hourSlots } from "@/lib/globals";
import { $selectedSchedule } from "@/store";
import type { Tables } from "@/types/supabase";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";

type Props = {
  schedules: Tables<"schedules">[] | null;
};

export default function ScheduleTable({ schedules }: Props) {
  const selectedSchedule = useStore($selectedSchedule);
  const { data } = useScheduleCourses(selectedSchedule ?? "");

  useEffect(() => {
    const schedule = schedules?.find((s) => s.is_selected);
    if (!selectedSchedule && schedule) $selectedSchedule.set(`${schedule.id}`);
  }, []);

  useEffect(() => {
    if (!data) return;

    // clear slots
    clearSlots();

    // fill slots
    for (let schedule of data!) {
      for (let lecture of schedule.courses!.lectures) {
        let ids = [];
        let blocks = ((lecture.time_end! - lecture.time_start!) % 99) + 1;

        if (blocks === 1) {
          let id = lecture.time_start + "-" + lecture.time_end;
          ids.push(id);
        } else {
          ids = idGenerator(lecture.time_start!, lecture.time_end!, []);
        }

        fillSlots(ids, lecture!.day, schedule.courses?.title);
      }
    }
  }, [data]);

  return (
    <Table className="border border-collapse">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Hours</TableHead>
          <TableHead className="text-right">Monday</TableHead>
          <TableHead className="text-right">Tuesday</TableHead>
          <TableHead className="text-right">Wednesday</TableHead>
          <TableHead className="text-right">Thursday</TableHead>
          <TableHead className="text-right">Friday</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {hourSlots.map((slot) => (
          <TableRow key={slot.time}>
            <TableCell className="font-medium">{slot.time}</TableCell>
            <TableCell id={`${slot.timeStart}-${slot.timeEnd}-${1}`}></TableCell>
            <TableCell id={`${slot.timeStart}-${slot.timeEnd}-${2}`}></TableCell>
            <TableCell id={`${slot.timeStart}-${slot.timeEnd}-${3}`}></TableCell>
            <TableCell id={`${slot.timeStart}-${slot.timeEnd}-${4}`}></TableCell>
            <TableCell id={`${slot.timeStart}-${slot.timeEnd}-${5}`}></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function idGenerator(start: number, finish: number, Ids: string[]) {
  let ids = Ids;
  if (start > finish) {
    return ids;
  } else {
    const id = start + "-" + (start + 99);
    ids.push(id);
    return idGenerator(start + 100, finish, ids);
  }
}

function fillSlots(ids: string[], day: string | null, text?: string | null) {
  for (let Id in ids) {
    let id = ids[Id];

    if (day === "Pazartesi") {
      id += "-" + "1";
    } else if (day === "Salı") {
      id += "-" + "2";
    } else if (day === "Çarşamba") {
      id += "-" + "3";
    } else if (day === "Perşembe") {
      id += "-" + "4";
    } else if (day === "Cuma") {
      id += "-" + "5";
    }

    const el = document.getElementById(id);
    if (el) el.innerHTML = text ?? "";
  }
}

function clearSlots() {
  for (let slot of hourSlots) {
    for (let i = 1; i < 6; i++) {
      const id = `${slot.timeStart}-${slot.timeEnd}-${i + 1}`;
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
    }
  }
}
