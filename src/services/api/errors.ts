import axios from "axios";

export function isLiveAuth(): boolean {
  return import.meta.env.VITE_LIVE_AUTH === "true";
}

export class AuthFlowError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AuthFlowError";
    this.code = code;
  }
}

function detailMessages(details: unknown): string[] {
  if (!Array.isArray(details)) return [];
  return details
    .map((item) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return "";
      const loc = Array.isArray((item as { loc?: unknown }).loc)
        ? (item as { loc: unknown[] }).loc.filter((part) => part !== "body").join(".")
        : "";
      const msg = "msg" in item ? String((item as { msg: string }).msg) : "";
      if (loc && msg) return `${loc}: ${msg}`;
      return msg;
    })
    .filter(Boolean);
}

export function getApiErrorCode(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data as
    | { error?: { code?: string }; code?: string }
    | undefined;
  if (typeof data?.error?.code === "string") return data.error.code;
  if (typeof data?.code === "string") return data.code;
  return null;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          detail?: unknown;
          message?: string;
          error?: { code?: string; message?: string; details?: unknown };
        }
      | undefined;

    if (typeof data?.error?.message === "string") {
      const extras = detailMessages(data.error.details);
      return extras.length ? `${data.error.message} ${extras.join(" ")}` : data.error.message;
    }

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    const fromDetail = detailMessages(data?.detail);
    if (fromDetail.length) return fromDetail.join(" ");

    if (data?.message) return data.message;

    if (error.response?.status === 422) {
      return "The API rejected this request. Check email, password, and company name.";
    }

    if (!error.response) {
      return "Cannot reach the API. Restart the Vite app so the proxy is on, and keep ngrok running.";
    }
  }

  if (error instanceof Error) return error.message;
  return "Request failed.";
}

export function toAuthError(error: unknown): never {
  const message = getApiErrorMessage(error);
  const code = getApiErrorCode(error);
  if (code) throw new AuthFlowError(code, message);
  throw new Error(message);
}
