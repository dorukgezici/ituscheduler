import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { hourSlots } from "@/lib/globals";
import type { Tables } from "@/types/supabase";

type Props = {
  schedule?: Tables<"schedules"> | null;
};

export default function ScheduleTable({ schedule }: Props) {
  return (
    <Table className="border border-collapse">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Hours</TableHead>
          <TableHead>Monday</TableHead>
          <TableHead>Tuesday</TableHead>
          <TableHead>Wednesday</TableHead>
          <TableHead>Thursday</TableHead>
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
            <TableCell id={`${slot.timeStart}-${slot.timeEnd}-${5}`} className="text-right"></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
