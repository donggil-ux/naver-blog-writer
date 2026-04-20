// 공유 링크 인코딩/디코딩 — lz-string 기반
// 생성 내역·임시저장을 URL-safe 문자열로 압축해서 기기 간 전달
import LZString from "lz-string";

/**
 * payload 형태:
 *   { kind: "draft", draft: {...} }
 *   { kind: "history", entry: {...} }
 */
export function encodeShare(payload) {
  try {
    const json = JSON.stringify({ v: 1, ...payload });
    return LZString.compressToEncodedURIComponent(json);
  } catch {
    return null;
  }
}

export function decodeShare(str) {
  if (!str || typeof str !== "string") return null;
  try {
    const json = LZString.decompressFromEncodedURIComponent(str);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.v !== 1) return null;
    if (parsed.kind !== "draft" && parsed.kind !== "history") return null;
    return parsed;
  } catch {
    return null;
  }
}

// 현재 origin + path 에 ?import=... 를 붙인 전체 URL 반환
export function buildShareUrl(payload) {
  const encoded = encodeShare(payload);
  if (!encoded) return null;
  const { origin, pathname } = window.location;
  return `${origin}${pathname}?import=${encoded}`;
}

// URL 에서 import 파라미터 제거 (import 처리 후 histroy.replaceState 용)
export function stripImportParam() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("import");
    const clean = url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : "") + url.hash;
    window.history.replaceState({}, "", clean);
  } catch {}
}

// 링크를 클립보드에 복사 (fallback 포함)
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
