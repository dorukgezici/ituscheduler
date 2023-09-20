import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { $selectedSchedule, deleteSchedule } from "@/store";
import type { Tables } from "@/types/supabase";
import { useStore } from "@nanostores/react";

type Props = {
  schedules: Tables<"schedules">[] | null;
};

export default function MySchedule({ schedules }: Props) {
  const schedule = useStore($selectedSchedule);

  return (
    <div className="flex items-center justify-start gap-2 mb-4">
      <Label className="font-semibold">My Schedules:</Label>
      <Select value={schedule} onValueChange={(value) => $selectedSchedule.set(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {schedules?.map((schedule) => (
              <SelectItem key={schedule.id} value={`${schedule.id}`}>
                #{schedule.id}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        className="ml-4"
        onClick={() => {
          deleteSchedule(parseInt(schedule ?? "0"));
          // TODO: mutate
          location.reload();
        }}
      >
        Delete Schedule
      </Button>
    </div>
  );
}
