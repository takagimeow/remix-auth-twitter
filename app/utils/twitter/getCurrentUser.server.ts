import TwitterApi from "twitter-api-v2";

export async function getCurrentUser(accessToken: string, accessSecret: string) {
	const twitterApiKey = process.env.TWITTER_API_KEY ?? "";
	const twitterApiKeySecret = process.env.TWITTER_API_KEY_SECRET ?? "";
	try {
		const client = new TwitterApi({
			appKey: twitterApiKey,
			appSecret: twitterApiKeySecret,
			accessToken, // oauth token from previous step (link generation)
			accessSecret // oauth token secret from previous step (link generation)
		});

		const currentUser = await client.currentUser();
		return currentUser;
	} catch (error) {
		return null;
	}
}
