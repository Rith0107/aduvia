export type MonthContext = {
  monthName: string;
  daysLeft: number;
  countdownLabel: string;
  monthEndLabel: string;
};

export function getMonthContext(date = new Date()): MonthContext {
  const year = date.getFullYear();
  const month = date.getMonth();
  const finalDay = new Date(year, month + 1, 0).getDate();
  const daysLeft = Math.max(0, finalDay - date.getDate());
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);

  return {
    monthName,
    daysLeft,
    countdownLabel: daysLeft === 0 ? "Last day" : `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`,
    monthEndLabel: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(year, month, finalDay)),
  };
}
