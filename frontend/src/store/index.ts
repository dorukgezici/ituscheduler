import { clientComponentClient } from "@/lib/supabaseClient";
import { atom, onSet } from "nanostores";

export const $selectedMajor = atom<string>("BLG");
export const $selectedCourseCode = atom<string | undefined>();
export const $selectedDay = atom<string | undefined>();

export const $selectedSchedule = atom<string | undefined>();
onSet($selectedSchedule, async ({ newValue }) => {
  const supabase = clientComponentClient();
  const oldValue = $selectedSchedule.get();
  if (newValue !== oldValue) {
    if (oldValue) await supabase.from("schedules").update({ is_selected: false }).eq("id", oldValue);
    if (newValue) await supabase.from("schedules").update({ is_selected: true }).eq("id", newValue);
  }
});
