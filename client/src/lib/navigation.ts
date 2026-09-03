export function safeNext(value: string | null, fallback: string): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return fallback;
}

export function dashboardPath(role: string): string {
  if (role === "ADMIN") return "/admin";
  if (role === "SELLER") return "/dashboard/seller";
  return "/dashboard/buyer";
}

export function loginPath(next?: string): string {
  if (!next) return "/login";
  return `/login?next=${encodeURIComponent(next)}`;
}

export function registerPath(next?: string): string {
  if (!next) return "/register";
  return `/register?next=${encodeURIComponent(next)}`;
}
