const irregularVerbs: Record<string, string> = {
  be: "was",
  begin: "began",
  build: "built",
  buy: "bought",
  come: "came",
  do: "did",
  drink: "drank",
  eat: "ate",
  get: "got",
  go: "went",
  have: "had",
  hit: "hit",
  make: "made",
  meet: "met",
  read: "read",
  run: "ran",
  see: "saw",
  take: "took",
  write: "wrote",
};

const likelyActionVerbs = new Set([
  "achieve", "attend", "build", "buy", "complete", "create", "design", "do", "drink",
  "eat", "finish", "get", "go", "have", "hike", "hit", "launch", "learn", "make", "meet",
  "organize", "plan", "practice", "publish", "read", "run", "save", "ship", "start", "take",
  "visit", "walk", "write",
]);

function preserveCase(source: string, replacement: string) {
  if (source === source.toUpperCase()) return replacement.toUpperCase();
  if (source[0] === source[0]?.toUpperCase()) return replacement[0]?.toUpperCase() + replacement.slice(1);
  return replacement;
}

function regularPastTense(verb: string) {
  if (verb.endsWith("e")) return `${verb}d`;
  if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ied`;
  if (/(ch|sh|x|s|z)$/.test(verb)) return `${verb}ed`;
  return `${verb}ed`;
}

export function toAchievementTitle(title: string) {
  const trimmed = title.trim();
  if (!trimmed) return trimmed;

  const match = trimmed.match(/^([A-Za-z]+)(\b.*)$/);
  if (!match) return `Completed — ${trimmed}`;

  const [, originalVerb, remainder] = match;
  const verb = originalVerb.toLowerCase();
  if (!likelyActionVerbs.has(verb)) return `Completed — ${trimmed}`;

  const pastTense = irregularVerbs[verb] ?? regularPastTense(verb);
  return `${preserveCase(originalVerb, pastTense)}${remainder}`;
}
