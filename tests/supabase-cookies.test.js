import { test } from "node:test";
import assert from "node:assert/strict";
import { createServerClient } from "@supabase/ssr";

test("production SSR login writes secure lax cookies and logout removes them", async () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  const { cookieOptions } =
    await import("../src/utils/supabase/cookie-options.js?production-test");
  if (previous === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previous;
  const user = {
    id: "11111111-1111-4111-8111-111111111111",
    email: "test@example.com",
  };
  const token = [
    { alg: "HS256", typ: "JWT" },
    { sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 },
    "signature",
  ]
    .map((part, index) =>
      Buffer.from(index < 2 ? JSON.stringify(part) : part).toString(
        "base64url",
      ),
    )
    .join(".");
  const writes = [];
  const store = new Map();
  const client = createServerClient(
    "https://mock.supabase.co",
    "sb_publishable_test",
    {
      cookieOptions,
      cookies: {
        getAll: () => [...store].map(([name, value]) => ({ name, value })),
        setAll: (values) =>
          values.forEach((cookie) => {
            writes.push(cookie);
            store.set(cookie.name, cookie.value);
          }),
      },
      global: {
        fetch: async (url) =>
          url.includes("/logout")
            ? new Response(null, { status: 204 })
            : new Response(
                JSON.stringify({
                  access_token: token,
                  refresh_token: "mock-refresh",
                  expires_in: 3600,
                  token_type: "bearer",
                  user,
                }),
                { headers: { "Content-Type": "application/json" } },
              ),
      },
    },
  );
  const { error } = await client.auth.signInWithPassword({
    email: user.email,
    password: "mock-password",
  });
  assert.equal(error, null);
  assert(writes.length > 0);
  for (const cookie of writes) {
    assert.equal(cookie.options.secure, true);
    assert.equal(cookie.options.sameSite, "lax");
    assert.equal(cookie.options.path, "/");
  }
  const result = await client.auth.signOut({ scope: "local" });
  assert.equal(result.error, null);
  assert(
    writes.some((cookie) => cookie.value === "" && cookie.options.maxAge === 0),
  );
});
