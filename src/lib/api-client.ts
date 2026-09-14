const API_PREFIX = "/api/backend";

type ApiErrorBody = {
  error?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiFetchOptions = RequestInit & {
  redirectOnUnauthorized?: boolean;
};

export async function apiFetch<T>(
  path: string,
  { redirectOnUnauthorized = true, ...init }: ApiFetchOptions = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // A resposta pode não possuir corpo JSON.
    }

    if (
      response.status === 401 &&
      redirectOnUnauthorized &&
      typeof window !== "undefined"
    ) {
      window.location.assign(new URL("/", window.location.origin));
    }

    const fallback =
      response.status === 403
        ? "Acesso negado. Verifique se o seu usuário está ativo."
        : "Não foi possível concluir a solicitação.";
    throw new ApiError(body.error || fallback, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Ocorreu um erro inesperado. Tente novamente.";
}
