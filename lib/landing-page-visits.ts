export const LANDING_PAGE_VISIT_SECRET_HEADER = "x-landing-page-visit-secret";

export function getLandingPageVisitSecret() {
  return (
    process.env.AUTH_SECRET ??
    process.env.SESSION_SECRET ??
    process.env.DATABASE_URL ??
    "local-dev-secret"
  );
}
