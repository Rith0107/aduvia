"use client";

import { useEffect, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function firstNameFromDisplayName(displayName?: string | null, email?: string | null) {
  const source = displayName?.trim() || email?.split("@")[0]?.trim() || "";
  return source.split(/\s+/)[0] || null;
}

export function useViewerFirstName() {
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => createBrowserSupabaseClient().auth.getUser()).then(({ data }) => {
      if (!active || !data.user) return;
      setFirstName(firstNameFromDisplayName(String(data.user.user_metadata?.display_name || ""), data.user.email));
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  return firstName;
}
