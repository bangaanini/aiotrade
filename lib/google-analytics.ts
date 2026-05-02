import "server-only";

import { JWT, OAuth2Client } from "google-auth-library";
import type { AnalyticsRange } from "@/lib/admin-analytics";

type GoogleAnalyticsSummary = {
  sessions: number;
  users: number;
  views: number;
};

export type GoogleAnalyticsDailyMetric = {
  date: string;
  users: number;
  views: number;
};

export type GoogleAnalyticsCountryMetric = {
  country: string;
  users: number;
  views: number;
};

export type GoogleAnalyticsPageMetric = {
  path: string;
  users: number;
  views: number;
};

export type GoogleAnalyticsSnapshot = {
  countries: GoogleAnalyticsCountryMetric[];
  daily: GoogleAnalyticsDailyMetric[];
  error: string | null;
  isConfigured: boolean;
  summary: GoogleAnalyticsSummary;
  topPages: GoogleAnalyticsPageMetric[];
};

type GoogleServiceAccount = {
  client_email?: string;
  private_key?: string;
};

type GoogleAnalyticsAuthClient = {
  client: JWT | OAuth2Client;
  method: "oauth" | "service-account";
};

type RunReportResponse = {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
};

const emptyGoogleAnalyticsSnapshot: GoogleAnalyticsSnapshot = {
  countries: [],
  daily: [],
  error: null,
  isConfigured: false,
  summary: {
    sessions: 0,
    users: 0,
    views: 0,
  },
  topPages: [],
};

function getRangeDays(range: AnalyticsRange) {
  if (range === "7d") {
    return 7;
  }

  if (range === "90d") {
    return 90;
  }

  return 30;
}

function formatDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateRange(range: AnalyticsRange) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (getRangeDays(range) - 1));

  return {
    endDate: formatDate(endDate),
    startDate: formatDate(startDate),
  };
}

function toNumber(value: string | undefined) {
  return Number(value ?? 0);
}

function readMetric(row: NonNullable<RunReportResponse["rows"]>[number], index: number) {
  return toNumber(row.metricValues?.[index]?.value);
}

function readDimension(row: NonNullable<RunReportResponse["rows"]>[number], index: number) {
  return row.dimensionValues?.[index]?.value ?? "";
}

function formatGaDate(value: string) {
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }

  return value;
}

function readEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function parseServiceAccount() {
  const encodedValue = readEnv("GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON_BASE64");

  if (!encodedValue) {
    return null;
  }

  try {
    const decodedValue = Buffer.from(encodedValue, "base64").toString("utf8");
    const parsed = JSON.parse(decodedValue) as GoogleServiceAccount;

    if (!parsed.client_email || !parsed.private_key) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function getServiceAccountClient(): GoogleAnalyticsAuthClient | null {
  const serviceAccount = parseServiceAccount();

  if (!serviceAccount) {
    return null;
  }

  return {
    client: new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    }),
    method: "service-account",
  };
}

function getOAuthClient(): GoogleAnalyticsAuthClient | null {
  const clientId = readEnv("GOOGLE_ANALYTICS_OAUTH_CLIENT_ID");
  const clientSecret = readEnv("GOOGLE_ANALYTICS_OAUTH_CLIENT_SECRET");
  const refreshToken = readEnv("GOOGLE_ANALYTICS_OAUTH_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const client = new OAuth2Client(clientId, clientSecret);
  client.setCredentials({ refresh_token: refreshToken });

  return {
    client,
    method: "oauth",
  };
}

function getGoogleAnalyticsClients() {
  return [getOAuthClient(), getServiceAccountClient()].filter(
    (client): client is GoogleAnalyticsAuthClient => Boolean(client),
  );
}

function getPropertyPath() {
  const propertyId = readEnv("GOOGLE_ANALYTICS_PROPERTY_ID");

  if (!propertyId) {
    return null;
  }

  return propertyId.startsWith("properties/") ? propertyId : `properties/${propertyId}`;
}

async function runReport(
  client: JWT | OAuth2Client,
  propertyPath: string,
  body: Record<string, unknown>,
) {
  const response = await client.request<RunReportResponse>({
    data: body,
    method: "POST",
    url: `https://analyticsdata.googleapis.com/v1beta/${propertyPath}:runReport`,
  });

  return response.data;
}

async function loadGoogleAnalyticsSnapshot(
  client: JWT | OAuth2Client,
  propertyPath: string,
  range: AnalyticsRange,
): Promise<GoogleAnalyticsSnapshot> {
  const dateRange = getDateRange(range);
  const [summaryReport, dailyReport, countriesReport, pagesReport] = await Promise.all([
    runReport(client, propertyPath, {
      dateRanges: [dateRange],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
      ],
    }),
    runReport(client, propertyPath, {
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    runReport(client, propertyPath, {
      dateRanges: [dateRange],
      dimensions: [{ name: "country" }],
      limit: 12,
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
      ],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    }),
    runReport(client, propertyPath, {
      dateRanges: [dateRange],
      dimensions: [{ name: "pagePathPlusQueryString" }],
      limit: 12,
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
      ],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    }),
  ]);

  const summaryRow = summaryReport.rows?.[0];

  return {
    countries:
      countriesReport.rows?.map((row) => ({
        country: readDimension(row, 0) || "Unknown",
        users: readMetric(row, 0),
        views: readMetric(row, 1),
      })) ?? [],
    daily:
      dailyReport.rows?.map((row) => ({
        date: formatGaDate(readDimension(row, 0)),
        users: readMetric(row, 1),
        views: readMetric(row, 0),
      })) ?? [],
    error: null,
    isConfigured: true,
    summary: {
      sessions: summaryRow ? readMetric(summaryRow, 1) : 0,
      users: summaryRow ? readMetric(summaryRow, 0) : 0,
      views: summaryRow ? readMetric(summaryRow, 2) : 0,
    },
    topPages:
      pagesReport.rows?.map((row) => ({
        path: readDimension(row, 0) || "/",
        users: readMetric(row, 1),
        views: readMetric(row, 0),
      })) ?? [],
  };
}

export async function getGoogleAnalyticsSnapshot(range: AnalyticsRange): Promise<GoogleAnalyticsSnapshot> {
  const propertyPath = getPropertyPath();
  const authClients = getGoogleAnalyticsClients();

  if (!propertyPath || !authClients.length) {
    return {
      ...emptyGoogleAnalyticsSnapshot,
      error: "Google Analytics belum dikonfigurasi.",
    };
  }

  let lastError: unknown;

  for (const authClient of authClients) {
    try {
      return await loadGoogleAnalyticsSnapshot(authClient.client, propertyPath, range);
    } catch (error) {
      lastError = error;
      console.error(
        `[google-analytics] Failed to load GA Data API reports with ${authClient.method}`,
        error,
      );
    }
  }

  return {
    ...emptyGoogleAnalyticsSnapshot,
    error: lastError instanceof Error ? lastError.message : "Google Analytics belum bisa dibaca.",
    isConfigured: true,
  };
}
