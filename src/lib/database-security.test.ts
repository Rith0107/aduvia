import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrations = [
  "supabase/migrations/20260805000000_initial_schema.sql",
  "supabase/migrations/20260809000000_production_foundation.sql",
  "supabase/migrations/20260810000000_account_deletion.sql",
].map((path) => readFileSync(resolve(process.cwd(), path), "utf8")).join("\n");

const ownedTables = ["profiles", "categories", "habits", "habit_check_ins", "side_quests", "quest_milestones", "daily_reflections"];

describe("database security migrations", () => {
  it("keeps row-level security enabled for every user-data table", () => {
    for (const table of ownedTables) {
      expect(migrations).toMatch(new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    }
  });

  it("scopes every user-data policy to the authenticated owner", () => {
    expect(migrations.match(/auth\.uid\(\) = (?:id|user_id)/g)).toHaveLength(14);
  });

  it("cascades owned data when its profile is removed", () => {
    for (const table of ["categories", "habits", "habit_check_ins", "side_quests", "quest_milestones", "daily_reflections"]) {
      const tableDefinition = migrations.match(new RegExp(`create table public\\.${table} \\([\\s\\S]*?\\n\\);`, "i"))?.[0] ?? "";
      expect(tableDefinition).toMatch(/references public\.profiles\(id\) on delete cascade/i);
    }
  });

  it("allows account deletion only for an authenticated caller deleting itself", () => {
    expect(migrations).toMatch(/delete from auth\.users where id = auth\.uid\(\)/i);
    expect(migrations).toMatch(/revoke all on function public\.delete_own_account\(\) from anon/i);
    expect(migrations).toMatch(/grant execute on function public\.delete_own_account\(\) to authenticated/i);
  });
});
