import { json, LoaderFunction, redirect } from "remix";
import { db, User } from "~/services/db.server"
import { getOAuthTokens } from "~/services/session.server";
import { getCurrentUser } from "~/utils/twitter/getCurrentUser.server";

export type LoaderData = {
	authenticated: boolean;
	user: User;
};

export const loader: LoaderFunction = async ({ request }) => {
	const url = new URL(request.url);
	console.log("[r/rooms/r] path: ", url.pathname);
	try {
		const { oauth_token, oauth_token_secret } = await getOAuthTokens(request);
		const currentUser = await getCurrentUser(oauth_token, oauth_token_secret);
		console.log("currentUser: ", currentUser);
		if (!currentUser) {
			throw redirect("/");
		}
		const user = await db.user.findUnique({
			where: {
				id: currentUser.id_str
			}
		});
		return json({
			authenticated: true,
			user
		});
	} catch (error) {
		console.error(error);
		return redirect("/");
	}
};

export default function Home() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>ログイン済み</h1>
    </div>
  );
}
