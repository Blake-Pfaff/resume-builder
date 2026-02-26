import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const getRouteUser = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { user, unauthorized: null };
};
