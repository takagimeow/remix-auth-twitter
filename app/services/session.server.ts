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

export async function logout(request: Request) {
	const session = await getSession(request);
	return redirect("/", {
		headers: {
			"Set-Cookie": await destroySession(session)
		}
	});
}

export async function createUserSession(
	oauth_token: string,
	oauth_token_secret: string,
	oauth_verifier: string,
	redirectTo: string
) {
	const session = await sessionStorage.getSession();
	session.set("oauth_token", oauth_token);
	session.set("oauth_token_secret", oauth_token_secret);
	session.set("oauth_verifier", oauth_verifier);
	return redirect(redirectTo, {
		headers: {
			"Set-Cookie": await sessionStorage.commitSession(session)
		}
	});
}

export async function getOAuthTokens(request: Request) {
	const session = await getSession(request);
	const oauth_token = await session.get("oauth_token");
	const oauth_token_secret = await session.get("oauth_token_secret");

	if (!oauth_token) {
		throw new Error("oauth_token is empty");
	}
	if (!oauth_token_secret) {
		throw new Error("oauth_token_secret is empty");
	}
	return {
		oauth_token,
		oauth_token_secret
	};
}
