export function parseAuthHeader(authHeader: string | null): {
  token: string;
} {
  if (authHeader == null) {
    throw new Error("authHeader is not defined");
  }
  const token = authHeader.split(" ")[1];
  if (token == null) {
    throw new Error("token is not defined");
  }
  return { token };
}
