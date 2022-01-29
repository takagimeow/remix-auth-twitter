import TwitterApi from "twitter-api-v2";

/**
 * Part 1 of 3-legged OAuth 1.0a flow.
 * @returns Object
 */
export async function generateAuthLink() {
  const apiKey = process.env.TWITTER_API_KEY ?? "";
  const apiKeySecret = process.env.TWITTER_API_KEY_SECRET ?? "";
  const callbackURL = process.env.TWITTER_CALLBACK_URL ?? "";
  const twitterClient = new TwitterApi({
    appKey: apiKey,
    appSecret: apiKeySecret,
  });
  const authLink = await twitterClient.generateAuthLink(callbackURL);
  return authLink;
}