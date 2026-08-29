const KEY = "aidigi.signup-cache";

export type SignupCache = {
  email: string;
  password: string;
  companyName: string;
  companyId?: string;
};

export function saveSignupCache(value: SignupCache) {
  sessionStorage.setItem(KEY, JSON.stringify(value));
}

export function readSignupCache(): SignupCache | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SignupCache;
  } catch {
    return null;
  }
}

export function clearSignupCache() {
  sessionStorage.removeItem(KEY);
}
