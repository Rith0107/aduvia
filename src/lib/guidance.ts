type TodayGuidanceInput = {
  completed: number;
  date?: Date;
  firstName?: string | null;
  total: number;
};

type EveningGuidanceInput = Pick<TodayGuidanceInput, "firstName" | "total"> & { answered: number };

function choose<T>(items: T[], date: Date) {
  return items[(date.getDate() + date.getMonth()) % items.length];
}

function greeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function named(text: string, firstName?: string | null) {
  return firstName ? `${text}, ${firstName}.` : `${text}.`;
}

export function todayGuidance({ completed, date = new Date(), firstName, total }: TodayGuidanceInput) {
  if (total === 0) return {
    greeting: named(greeting(date), firstName),
    headline: choose(["Let the open space stay open.", "A lighter day belongs here too."], date),
    supporting: "Nothing is scheduled today. Rest, reflect, or simply let the day unfold.",
    signal: "Rest is part of the rhythm.",
  };
  if (completed === total) return {
    greeting: named(greeting(date), firstName),
    headline: choose(["You kept your word today.", "Today’s rhythm is complete."], date),
    supporting: `All ${total} ${total === 1 ? "ritual is" : "rituals are"} complete. Nothing more is required of you today.`,
    signal: "You can let the day be enough.",
  };
  if (completed === 0) return {
    greeting: named(greeting(date), firstName),
    headline: choose(["Begin with the smallest promise.", "Start gently. The day is still yours."], date),
    supporting: `${total} ${total === 1 ? "ritual is" : "rituals are"} waiting. One honest start is enough to change the shape of the day.`,
    signal: "A beginning does not need to be big.",
  };
  const remaining = total - completed;
  return {
    greeting: named(greeting(date), firstName),
    headline: choose(["Your rhythm is already in motion.", "Keep the next step light."], date),
    supporting: `${completed} of ${total} complete. ${remaining} ${remaining === 1 ? "gentle step remains" : "gentle steps remain"}.`,
    signal: "Progress can stay quiet.",
  };
}

export function eveningGuidance({ answered, firstName, total }: EveningGuidanceInput) {
  const salutation = named("Good evening", firstName);
  if (total === 0) return { salutation, headline: "Nothing to close. Simply rest.", prompt: "Your schedule was clear today. There is nothing to score or explain.", finished: named("Let the day be enough", firstName) };
  if (answered === total) return { salutation, headline: "Every choice has an answer.", prompt: "You have recorded the day honestly. Nothing else is required tonight.", finished: named("Let the day be enough", firstName) };
  if (answered === 0) return { salutation, headline: `${total} ${total === 1 ? "choice" : "choices"}. Then rest.`, prompt: "Choose what happened. No scoring, no explanations, no catching up.", finished: named("Let the day be enough", firstName) };
  return { salutation, headline: "You’re almost ready to let go.", prompt: `${total - answered} ${total - answered === 1 ? "choice remains" : "choices remain"}. Honesty is enough.`, finished: named("Let the day be enough", firstName) };
}
