import type { LoaderFunction } from "remix";
import { useCatch, redirect } from "remix";
import { generateAuthLink } from "~/utils/twitter/generateAuthLink.server";

export const loader: LoaderFunction = async ({ request }) => {
  const authLink = await generateAuthLink();
  return redirect(authLink.url);
};


export function CatchBoundary() {
  const caught = useCatch();
  return (
    <div>
      <h1>ステップ1</h1>
      <h2>Twitter認証に失敗しました</h2>
      <p>{caught.statusText}</p>
    </div>
  )
}

