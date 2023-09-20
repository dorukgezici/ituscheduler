import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { $selectedSchedule } from "@/store";
import type { Tables } from "@/types/supabase";
import { useStore } from "@nanostores/react";

type Props = {
  schedules: Tables<"schedules">[] | null;
};

export default function MySchedule({ schedules }: Props) {
  const schedule = useStore($selectedSchedule);

  return (
    <Select value={schedule} onValueChange={(value) => $selectedSchedule.set(value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {schedules?.map((schedule) => (
          <SelectItem key={schedule.id} value={`${schedule.id}`}>
            #{schedule.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
