import type { LoaderFunction } from "remix";
import { useCatch, redirect } from "remix";
import { createUserSession } from "~/services/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const oauth_token = url.searchParams.get("oauth_token");
  const oauth_verifier = url.searchParams.get("oauth_verifier");
  if (oauth_token && oauth_verifier) {
    return createUserSession(oauth_token, oauth_verifier, "/");
  }
  throw redirect(`/login`);
};

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <div>
      <h1>ステップ2</h1>
      <h2>Twitter認証に失敗しました</h2>
      <p>{caught.statusText}</p>
    </div>
  )
}
