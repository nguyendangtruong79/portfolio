"use client";

export const INTERVIEW_HASH =
  "930701ab5ad539d32d785a4c9773b97ee41994ac614b9abe2339d59eb4578cd3";

const AUTH_STORAGE_KEY = "interview_session_hash";
const AUTH_COOKIE_NAME = "interview_session_hash";

/**
 * Normalizes input so Vietnamese keyboard (Telex/VNI: "trườngđẹptrai")
 * and standard ASCII ("truongdeptrai") both match accurately.
 */
export function normalizePassword(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/\s+/g, "");
}

export async function sha256Hex(text: string): Promise<string> {
  const normalized = normalizePassword(text);
  const msgUint8 = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function setInterviewAuthSession() {
  if (typeof window === "undefined") return;
  try {
    // Store the encrypted hash in session
    sessionStorage.setItem(AUTH_STORAGE_KEY, INTERVIEW_HASH);
    document.cookie = `${AUTH_COOKIE_NAME}=${INTERVIEW_HASH}; path=/; SameSite=Strict`;
  } catch {
    // Fallback if cookies/storage blocked
  }
}

export function isInterviewAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const sessionVal = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (sessionVal === INTERVIEW_HASH) return true;

    // Check cookie fallback
    const cookies = document.cookie.split("; ");
    const hasValidCookie = cookies.some(
      (c) => c === `${AUTH_COOKIE_NAME}=${INTERVIEW_HASH}`
    );
    if (hasValidCookie) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, INTERVIEW_HASH);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export function clearInterviewAuthSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  } catch {
    // Ignore
  }
}
