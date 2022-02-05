import type { LoaderFunction } from "remix";
import { json } from "remix";
import { useCatch, redirect } from "remix";
import TwitterApi from "twitter-api-v2";
import { prisma } from "~/services/db.server";

import { createUserSession, getSession } from "~/services/session.server";

export const loader: LoaderFunction = async ({ request, context, params }) => {
	const session = await getSession(request);
	const url = new URL(request.url);
	const oauth_token = url.searchParams.get("oauth_token");
	const oauth_token_secret = session.get("oauth_token_secret");
	const oauth_verifier = url.searchParams.get("oauth_verifier");

	if (!oauth_token) {
		throw json("Not Authenticated", { status: 403 });
	}
	if (!oauth_verifier) {
		throw json("Not Authenticated", { status: 403 });
	}
	const twitterApiKey = process.env.TWITTER_API_KEY ?? "";
	const twitterApiKeySecret = process.env.TWITTER_API_KEY_SECRET ?? "";

	try {
		const client = new TwitterApi({
			appKey: twitterApiKey,
			appSecret: twitterApiKeySecret,
			accessToken: oauth_token, // oauth token from previous step (link generation)
			accessSecret: oauth_token_secret // oauth token secret from previous step (link generation)
		});
		const currentUser = await client.login(oauth_verifier);
		const { screenName, userId, accessToken, accessSecret } = currentUser;
		const client2 = new TwitterApi({
			appKey: twitterApiKey,
			appSecret: twitterApiKeySecret,
			accessToken: accessToken,
			accessSecret
		});
		const uid = `${userId}`;
		console.log("uid: ", uid);
		const userV1 = await client2.v1.user({
			user_id: userId
		});
		const user = await prisma.user.findUnique({
			where: {
				id: userV1.id_str
			}
		});
		if (!user) {
			await prisma.user.create({
				data: {
					id: uid,
					name: userV1.name,
					picture: userV1.profile_image_url_https,
					screenName: screenName,
					bio: userV1.description ?? ""
				}
			});
		}
		return createUserSession(accessToken, accessSecret, oauth_verifier, "/home");
	} catch (error) {
		if (error instanceof Error) {
			console.error("\nエラーが発生しました\n");
			console.error(error.message);
		}
		throw redirect(`/`);
	}
};

export function CatchBoundary() {
	const caught = useCatch();
	return (
		<div>
			<h1>ステップ2</h1>
			<h2>Twitter認証に失敗しました</h2>
			<p>{caught.statusText}</p>
		</div>
	);
}
