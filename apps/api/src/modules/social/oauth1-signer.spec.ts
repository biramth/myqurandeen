import * as crypto from "node:crypto";
import { buildOAuth1Header, type OAuth1Credentials, type OAuth1SignOptions } from "./oauth1-signer";

const creds: OAuth1Credentials = {
  consumerKey: "9djdj82h48djs9d2",
  consumerSecret: "j49sk3j29djd",
  accessToken: "kkk9d7dh3k39sjv7",
  accessSecret: "dh893hdasih9",
};

const opts: OAuth1SignOptions = { nonce: "7d8f3e4a", timestamp: "137131201" };

/** Reproduit percentEncode (RFC 3986) : encodeURIComponent + `!*'()` explicites. */
function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!*'()]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

/** HMAC-SHA1 en base64 d'une signature base string (RFC 5849 3.4.2). */
function hmacBase64(base: string, signingKey: string): string {
  return crypto.createHmac("sha1", signingKey).update(base).digest("base64");
}

describe("buildOAuth1Header", () => {
  it("retourne un en-tete OAuth avec les 7 champs oauth_* sans exposer la query", () => {
    const header = buildOAuth1Header("POST", "http://example.com/request?search=quran", creds, opts);
    expect(header.startsWith("OAuth ")).toBe(true);
    const fields = header.replace(/^OAuth /, "").split(", ");
    expect(fields).toHaveLength(7);
    const keys = fields.map((f) => f.split("=")[0]);
    for (const k of [
      "oauth_consumer_key",
      "oauth_nonce",
      "oauth_signature_method",
      "oauth_timestamp",
      "oauth_token",
      "oauth_version",
      "oauth_signature",
    ]) {
      expect(keys).toContain(k);
    }
    // La query n'a pas a apparaitre dans l'en-tete final (elle est seulement signee).
    expect(keys).not.toContain("search");
  });

  it("est deterministe : memes nonce/timestamp -> meme signature", () => {
    const a = buildOAuth1Header("POST", "http://example.com/request", creds, opts);
    const b = buildOAuth1Header("POST", "http://example.com/request", creds, opts);
    expect(a).toBe(b);
  });

  it("signe la base canonique de la RFC 5849 avec la bonne cle HMAC-SHA1", () => {
    // Toutes les valeurs "a" -> base string et cle de signature figees et faciles a verifier.
    const simple: OAuth1Credentials = { consumerKey: "a", consumerSecret: "a", accessToken: "a", accessSecret: "a" };
    const header = buildOAuth1Header("POST", "http://example.com/request", simple, { nonce: "n", timestamp: "1" });
    const base =
      "POST&http%3A%2F%2Fexample.com%2Frequest&" +
      "oauth_consumer_key%3Da%26oauth_nonce%3Dn%26oauth_signature_method%3DHMAC-SHA1%26" +
      "oauth_timestamp%3D1%26oauth_token%3Da%26oauth_version%3D1.0";
    const expected = percentEncode(hmacBase64(base, "a&a"));
    expect(header).toContain(`oauth_signature="${expected}"`);
  });

  it("percent-encode les caracteres reserves des valeurs (RFC 3986 : espace ! * ' ( ))", () => {
    const special: OAuth1Credentials = { consumerKey: "a b!c'd(e)f", consumerSecret: "k", accessToken: "t", accessSecret: "s" };
    const header = buildOAuth1Header("POST", "http://x.test/", special, { nonce: "n", timestamp: "1" });
    expect(header).toContain('oauth_consumer_key="a%20b%21c%27d%28e%29f"');
  });

  it("tri alphabetiquement toutes les cles signees", () => {
    const header = buildOAuth1Header("POST", "http://example.com/request?zeta=1&alpha=2", creds, opts);
    const keys = header
      .replace(/^OAuth /, "")
      .split(", ")
      .map((f) => f.split("=")[0]);
    expect(keys).toEqual([...keys].sort());
  });

  it("integre les parametres de query dans la signature (la fait changer)", () => {
    const withQuery = buildOAuth1Header("POST", "http://example.com/request?search=quran", creds, opts);
    const withoutQuery = buildOAuth1Header("POST", "http://example.com/request", creds, opts);
    expect(withQuery).not.toBe(withoutQuery);
  });
});
