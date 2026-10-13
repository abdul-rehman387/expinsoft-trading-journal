import http from "node:http";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
const requests = [];
let tradesUnavailable = false;
const user = {
  id: "11111111-1111-4111-8111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "smoke@example.com",
  user_metadata: { name: "Smoke Test" },
  app_metadata: { provider: "email" },
  created_at: new Date().toISOString(),
};
const expiry = Math.floor(Date.now() / 1000) + 3600;
// A mock Auth server accepts this test token. It is never sent to a live service.
const token = [
  { alg: "HS256", typ: "JWT" },
  { sub: user.id, aud: "authenticated", exp: expiry },
  "fake-signature",
]
  .map((value, index) =>
    Buffer.from(index < 2 ? JSON.stringify(value) : value).toString(
      "base64url",
    ),
  )
  .join(".");
const session = {
  access_token: token,
  refresh_token: "mock-refresh",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: expiry,
  user,
};
const backend = http.createServer((req, res) => {
  requests.push(req.url);
  res.setHeader("Content-Type", "application/json");
  if (
    req.url.startsWith("/auth/v1/token") ||
    req.url.startsWith("/auth/v1/signup")
  )
    res.end(JSON.stringify(session));
  else if (req.url.startsWith("/auth/v1/user")) res.end(JSON.stringify(user));
  else if (req.url.startsWith("/rest/v1/trades")) {
    if (tradesUnavailable) {
      res.statusCode = 404;
      res.end(JSON.stringify({ code: "PGRST205", message: "Missing trades table" }));
    } else res.end("[]");
  }
  else {
    res.statusCode = 404;
    res.end("{}");
  }
});
await new Promise((resolve) => backend.listen(54329, "127.0.0.1", resolve));
const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--port", "3101"],
  {
    windowsHide: true,
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54329",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_mock",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
child.stdout.on("data", (value) => {
  logs += value;
});
child.stderr.on("data", (value) => {
  logs += value;
});
try {
  for (let i = 0; i < 50; i++) {
    try {
      await fetch("http://localhost:3101/login");
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  for (const path of ["/login", "/signup"]) {
    const response = await fetch("http://localhost:3101" + path);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /name="email"/);
    console.log(path + " auth form: PASS");
  }
  for (const path of ["/login", "/signup"]) {
    const page = await fetch("http://localhost:3101" + path);
    const html = await page.text();
    const form = new FormData();
    for (const tag of html.matchAll(/<input[^>]*type="hidden"[^>]*>/g)) {
      const name = tag[0].match(/name="([^"]+)"/)?.[1];
      const value = tag[0].match(/value="([^"]*)"/)?.[1] || "";
      if (name)
        form.set(
          name,
          value
            .replaceAll("&quot;", '"')
            .replaceAll("&#x27;", "'")
            .replaceAll("&amp;", "&"),
        );
    }
    assert([...form.keys()].some((key) => key.startsWith("$ACTION_")));
    form.set("email", user.email);
    form.set("password", "mock-password");
    form.set("name", "Smoke Test");
    const response = await fetch("http://localhost:3101" + path, {
      method: "POST",
      body: form,
      headers: { Origin: "http://localhost:3101" },
      redirect: "manual",
    });
    assert.equal(response.status, 303);
    assert.equal(
      new URL(response.headers.get("location"), "http://localhost:3101")
        .pathname,
      "/dashboard",
    );
    assert(
      response.headers
        .getSetCookie()
        .some((value) => value.startsWith("sb-127-auth-token=")),
    );
    console.log(
      path + " server action sets session cookie and redirects: PASS",
    );
  }
  const cookie =
    "sb-127-auth-token=base64-" +
    Buffer.from(JSON.stringify(session)).toString("base64url");
  for (const path of ["/dashboard", "/trades", "/settings/data"]) {
    const denied = await fetch("http://localhost:3101" + path, {
      redirect: "manual",
    });
    assert.equal(denied.status, 307);
    assert.equal(
      new URL(denied.headers.get("location"), "http://localhost:3101").pathname,
      "/login",
    );
    const response = await fetch("http://localhost:3101" + path, {
      headers: { cookie },
      redirect: "manual",
    });
    const html = await response.text();
    assert.equal(response.status, 200, path + ": " + html.slice(0, 100));
    assert.match(html, /Smoke Test/);
    assert.doesNotMatch(html, /"digest":"[0-9]+"/);
    console.log(path + " protection and authenticated SSR: PASS");
  }
  assert(
    requests.some((url) =>
      url.includes("/rest/v1/trades?select=*&order=created_at.desc"),
    ),
    JSON.stringify(requests),
  );
  console.log("Server trade query ordered newest first: PASS");
  tradesUnavailable = true;
  const fallback = await fetch("http://localhost:3101/dashboard", {
    headers: { cookie },
  });
  const fallbackHtml = await fallback.text();
  assert.equal(fallback.status, 200);
  assert.match(fallbackHtml, /Smoke Test/);
  assert.match(fallbackHtml, /Your trades database is not set up yet/);
  assert.doesNotMatch(fallbackHtml, /"digest":"[0-9]+"/);
  console.log("Dashboard stays visible when trades database fails: PASS");
} catch (error) {
  console.error(logs, requests);
  throw error;
} finally {
  child.kill();
  backend.closeAllConnections();
  backend.close();
}
