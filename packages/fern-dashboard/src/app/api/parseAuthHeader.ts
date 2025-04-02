import { NextRequest } from "next/server";

export function parseAuthHeader(req: NextRequest): {
  token: string;
} {
  const authHeader = req.headers.get("authorization");

  if (authHeader == null) {
    throw new Error("authorization header is not defined");
  }
  const token = authHeader.split(" ")[1];
  if (token == null) {
    throw new Error("token is not defined");
  }
  return { token };
}
