import { test } from "node:test";
import assert from "node:assert/strict";
import { getSupabaseConfig } from "../src/utils/supabase/config.js";

test("Supabase accepts server environment names and never uses a secret key", () => {
  const names = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY", "SUPABASE_SECRET_KEY"];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    for (const name of names) delete process.env[name];
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    assert.deepEqual(getSupabaseConfig(), { url: "https://example.supabase.co", key: "sb_publishable_test" });
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
    process.env.SUPABASE_SECRET_KEY = "test-secret-never-used";
    assert.throws(getSupabaseConfig, { code: "SUPABASE_CONFIG_ERROR" });
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon";
    assert.equal(getSupabaseConfig().key, "test-anon");
  } finally {
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    }
  }
});
