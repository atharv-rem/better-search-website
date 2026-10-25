import type { SearchResult } from "./types";
import { extensionOf, groupOf } from "./file-groups";
import { MOCK_FILES, MOCK_FOLDERS, MOCK_PAGES, MOCK_TEXT } from "./mock-data";

// Stands in for the app's Go backend and Rust shell: the same questions
// (search, preview) answered from the mock drive in mock-data.ts.

// --- Search ----------------------------------------------------------------

const isWordStart = (name: string, at: number) => at === 0 || !/[a-z0-9]/.test(name[at - 1]);

/** Files whose name (or, less strongly, path) holds every word of `query`,
 *  best first: names starting with a word, then word starts, then anywhere,
 *  with the files opened most as the tie-break, as the app ranks them. */
export function mockSearch(query: string, limit = 50): SearchResult[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  const scored: { result: SearchResult; score: number }[] = [];
  for (const result of MOCK_FILES) {
    const name = result.name.toLowerCase();
    const path = result.path.toLowerCase();
    let score = 0;
    let matched = true;
    for (const term of terms) {
      const at = name.indexOf(term);
      if (at === 0) score += 100;
      else if (at > 0 && isWordStart(name, at)) score += 60;
      else if (at > 0) score += 30;
      else if (path.includes(term)) score += 10;
      else {
        matched = false;
        break;
      }
    }
    if (!matched) continue;
    score += Math.log2(result.open_count + 1) * 5 + (result.type === "directory" ? 3 : 0);
    scored.push({ result, score });
  }
  scored.sort((a, b) => b.score - a.score || a.result.name.length - b.result.name.length);
  return scored.slice(0, limit).map((s) => s.result);
}

// --- Previews --------------------------------------------------------------

export interface FolderEntry {
  name: string;
  dir: boolean;
}

/** What the preview above the search bar shows for a result. */
export type Preview =
  | { kind: "image"; url: string }
  | { kind: "text"; text: string }
  | { kind: "folder"; entries: FolderEntry[]; total: number; more: boolean }
  | { kind: "page"; paragraphs: { text: string; heading: boolean }[] }
  | { kind: "none" };

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A made-up photo: a sky gradient, a sun and two hills, tinted by the name.
 *  Stands in for the Windows thumbnail the app shows. */
function thumbnail(name: string, video: boolean) {
  const h = hash(name);
  const hue = h % 360;
  const sunX = 30 + (h % 50);
  const sunY = 22 + ((h >> 8) % 20);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 224 224">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="hsl(${hue} 70% 62%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360} 75% 78%)"/>
</linearGradient></defs>
<rect width="224" height="224" fill="url(#g)"/>
<circle cx="${sunX * 2}" cy="${sunY * 2}" r="22" fill="hsl(${(hue + 50) % 360} 90% 90%)" opacity=".9"/>
<path d="M0 170 Q60 120 120 160 T224 140 V224 H0Z" fill="hsl(${(hue + 200) % 360} 35% 32%)"/>
<path d="M0 195 Q70 160 140 190 T224 180 V224 H0Z" fill="hsl(${(hue + 210) % 360} 40% 22%)"/>
${video ? '<circle cx="112" cy="112" r="26" fill="#000" opacity=".55"/><path d="M104 98 L128 112 L104 126Z" fill="#fff"/>' : ""}
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function previewOf(result: SearchResult): Preview {
  if (result.type === "directory") {
    const entries = MOCK_FOLDERS[result.name];
    return entries ? { kind: "folder", entries, total: entries.length, more: false } : { kind: "none" };
  }

  const group = groupOf(result);
  const ext = extensionOf(result.name);
  if (group === "images" && ext !== "svg") return { kind: "image", url: thumbnail(result.name, false) };
  if (group === "videos") return { kind: "image", url: thumbnail(result.name, true) };

  const text = MOCK_TEXT[result.name];
  if (text !== undefined) return { kind: "text", text };

  const page = MOCK_PAGES[result.name];
  if (page) return { kind: "page", paragraphs: page };

  return { kind: "none" };
}

// Recent previews, so moving back up the list is instant (the app keeps 16).
const CACHE_SIZE = 16;
const cache = new Map<string, Promise<Preview>>();

export function cachedPreview(result: SearchResult, thumbSize: number) {
  return cache.get(`${thumbSize}|${result.path}`);
}

export function loadPreview(result: SearchResult, thumbSize: number) {
  const key = `${thumbSize}|${result.path}`;
  let preview = cache.get(key);
  if (preview) cache.delete(key); // re-insert as the newest
  else preview = Promise.resolve(previewOf(result));
  cache.set(key, preview);
  if (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value!);
  return preview;
}

// --- Browsers for web searches ---------------------------------------------

/** A browser a web search can go to; the app lists the installed ones. */
export type BrowserOption = { id: string; name: string };
export const DEFAULT_BROWSER: BrowserOption = { id: "default", name: "Default browser" };
export const MOCK_BROWSERS: BrowserOption[] = [
  DEFAULT_BROWSER,
  { id: "chrome", name: "Google Chrome" },
  { id: "edge", name: "Microsoft Edge" },
  { id: "firefox", name: "Firefox" },
  { id: "brave", name: "Brave" },
];
