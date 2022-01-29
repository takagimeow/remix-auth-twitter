import { redirect, createCookieSessionStorage, Session } from "remix";

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export function getSession(request: Request): Promise<Session> {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export let { commitSession, destroySession } = sessionStorage;

export async function createUserSession(oauth_token: string, oauth_verifier: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("oauth_token", oauth_token);
  session.set("oauth_verifier", oauth_verifier);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}