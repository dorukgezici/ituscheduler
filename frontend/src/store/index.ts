import { clientComponentClient } from "@/lib/supabaseClient";
import { action, atom, onMount, onSet } from "nanostores";

export const $selectedMajor = atom<string>("BLG");
onMount($selectedMajor, () => {
  const loadSelectedMajor = async () => {
    const supabase = clientComponentClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data: major } = await supabase.from("user_major").select("major").eq("user_id", session?.user.id).single();
    $selectedMajor.set(major?.major ?? "BLG");
  };

  loadSelectedMajor();
});
onSet($selectedMajor, async ({ newValue }) => {
  const oldValue = $selectedMajor.get();
  if (newValue && newValue !== oldValue) {
    const supabase = clientComponentClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    await supabase
      .from("user_major")
      .upsert({ user_id: session?.user.id, major: newValue })
      .eq("user_id", session?.user.id);
  }
});

export const $selectedCourseCode = atom<string | undefined>();
export const $selectedDay = atom<string | undefined>();

export const $selectedSchedule = atom<string | undefined>();
onSet($selectedSchedule, async ({ newValue }) => {
  const oldValue = $selectedSchedule.get();
  if (newValue !== oldValue) {
    const supabase = clientComponentClient();
    if (oldValue) await supabase.from("schedules").update({ is_selected: false }).eq("id", oldValue);
    if (newValue) await supabase.from("schedules").update({ is_selected: true }).eq("id", newValue);
  }
});
export const deleteSchedule = action($selectedSchedule, "delete", async (store, id: number) => {
  const supabase = clientComponentClient();
  const { error } = await supabase.from("schedules").delete().eq("id", id);
  if (!error) store.set(undefined);
});
