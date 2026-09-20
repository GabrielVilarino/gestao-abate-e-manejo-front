import "server-only";

import { jwtVerify } from "jose";

type Session = {
  userId: number;
  role: 1 | 2;
};

export async function verifySession(token: string | undefined): Promise<Session | null> {
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
      issuer: "gestao_abate",
      requiredClaims: ["exp", "iat"],
    });

    if (
      typeof payload.user_id !== "number" ||
      !Number.isInteger(payload.user_id) ||
      payload.user_id <= 0 ||
      (payload.role !== 1 && payload.role !== 2) ||
      payload.ativo !== true
    ) {
      return null;
    }

    return { userId: payload.user_id, role: payload.role };
  } catch {
    return null;
  }
}
