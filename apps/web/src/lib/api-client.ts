import { tokenStore } from "@/lib/token-store";

// On retire un eventuel `/` final : les appels ci-dessous concatenent
// toujours un chemin qui commence deja par `/` (ex. "/quran/surahs"), donc
// un VITE_API_URL avec slash final produirait "//quran/surahs" -> 404 cote
// API (arrive en prod si la variable est saisie avec un slash sur Vercel).
const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
}

// Verrou de rafraichissement en vol : evite que plusieurs appels en echec 401
// declenchent chacun un appel a /auth/refresh et se retrouvent avec des tokens
// invalides les uns les autres. Toutes les requetes concurrentes attendent le
// meme token frais.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new ApiError("Refresh token invalide", response.status);
        }

        const data = (await response.json()) as { accessToken: string };
        tokenStore.set(data.accessToken);
        return data.accessToken;
      } catch {
        tokenStore.set(null);
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth, headers, ...rest } = options;

  const doRequest = async (token: string | null): Promise<Response> => {
    return fetch(`${API_URL}${path}`, {
      ...rest,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  const parse = async <P>(response: Response): Promise<P> => {
    if (response.status === 204) {
      return undefined as P;
    }
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : undefined;
    if (!response.ok) {
      const message = (data as { message?: string | string[] })?.message;
      throw new ApiError(Array.isArray(message) ? message.join(", ") : (message ?? "Erreur inconnue"), response.status);
    }
    return data as P;
  };

  if (skipAuth) {
    return parse<T>(await doRequest(null));
  }

  let response = await doRequest(tokenStore.get());

  if (response.status === 401) {
    const freshToken = await refreshAccessToken();
    if (freshToken) {
      response = await doRequest(freshToken);
    }
  }

  return parse<T>(response);
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};
