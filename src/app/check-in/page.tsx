import { EveningCheckIn } from "@/features/check-in/evening-check-in";
import { sampleHabits } from "@/features/today/sample-data";

export default function CheckInPage() {
  return <EveningCheckIn initialHabits={sampleHabits} />;
}
