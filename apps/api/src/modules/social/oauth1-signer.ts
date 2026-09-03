import * as crypto from "node:crypto";

export interface OAuth1Credentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessSecret: string;
}

/** RFC 3986 percent-encoding (RFC 5849 l'exige explicitement) - `encodeURIComponent` seul laisse `!*'()` non encodes. */
function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!*'()]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

/**
 * Construit l'en-tete `Authorization: OAuth ...` (HMAC-SHA1, RFC 5849) pour
 * un appel a l'API X/Twitter. Fait main plutot qu'une dependance
 * (`twitter-api-v2` et consorts) : l'algorithme est fige par la RFC et ne
 * sert ici qu'a deux appels isoles (upload media + creation de tweet), une
 * librairie complete tirerait bien plus de code que necessaire pour ce seul
 * besoin.
 *
 * Volontairement partiel par rapport a la RFC complete : ne signe que les
 * parametres `oauth_*` (+ une eventuelle query string de `url`), jamais les
 * parametres de corps - correct ici car les deux endpoints utilises envoient
 * un corps JSON ou multipart/form-data, jamais application/x-www-form-urlencoded
 * (RFC 5849 section 3.4.1.3 : seul ce dernier type de corps entre dans la
 * base de signature).
 */
export function buildOAuth1Header(method: string, url: string, credentials: OAuth1Credentials): string {
  const [baseUrl, query] = url.split("?");

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: credentials.consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: credentials.accessToken,
    oauth_version: "1.0",
  };

  const signedParams: Record<string, string> = { ...oauthParams };
  if (query) {
    for (const [key, value] of new URLSearchParams(query)) signedParams[key] = value;
  }

  const paramString = Object.keys(signedParams)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(signedParams[key])}`)
    .join("&");
  const signatureBase = [method.toUpperCase(), percentEncode(baseUrl), percentEncode(paramString)].join("&");
  const signingKey = `${percentEncode(credentials.consumerSecret)}&${percentEncode(credentials.accessSecret)}`;
  const signature = crypto.createHmac("sha1", signingKey).update(signatureBase).digest("base64");

  const headerParams: Record<string, string> = { ...oauthParams, oauth_signature: signature };
  return (
    "OAuth " +
    Object.keys(headerParams)
      .sort()
      .map((key) => `${percentEncode(key)}="${percentEncode(headerParams[key])}"`)
      .join(", ")
  );
}
