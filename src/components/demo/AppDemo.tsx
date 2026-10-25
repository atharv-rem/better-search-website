import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { CaretDownIcon, CheckIcon, ClockCounterClockwiseIcon, GearSixIcon } from "./phosphor";
import { GlobalSearchIcon } from "./global-search-icon";
import { RamIcon, TimeIcon } from "./stat-icons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import { SearchBox } from "./search-box";
import { PreviewPanel } from "./preview-panel";
import { SearchResults } from "./search-results";
import { TypeFilter } from "./type-filter";
import { countGroups, groupOf, type FileGroup } from "./file-groups";
import { cn } from "./cn";
import { DEFAULT_BROWSER, MOCK_BROWSERS, mockSearch } from "./mock-backend";
import { MOCK_RECENT_SEARCHES } from "./mock-data";
import type { SearchResult } from "./types";

// The app's search window (App.tsx in atharv-rem/better-search), running on a
// mock drive. What a window manager or the Tauri shell did there (hiding the
// window, opening a file, sizing the window to its content) is a toast or a
// layout rule here; everything inside the window is the app's own.

/** What a search starts with to search the web. */
const TRIGGER = "/";

const SEARCH_DEBOUNCE_MS = 100;

/** Recent searches listed: file searches under the empty search box, web
 *  searches ("/ cats") under the web-search row while only "/" is typed. */
const RECENT_SHOWN = 5;

/** Recent web searches are kept as "/cats". */
const RECENT_WEB_PREFIX = "/";

/** Every icon in the web-search row and its browser menu, in pixels. */
const ROW_ICON_SIZE = 16;

/** Search results listed before the list scrolls, and the size of one row. */
const RESULT_ROWS = 6;
const RESULT_ROW = 36;
const RESULTS_PADDING = 12;
const RESULTS_MAX_HEIGHT = RESULT_ROWS * RESULT_ROW + RESULTS_PADDING;

/** The search-time and memory pills just above the bar: same padding, same
 *  height. */
const statPill = "flex h-5 items-center gap-1 rounded-md bg-black px-2";
const statPillShadow = "0 0 0 1px rgb(255 255 255 / 0.1)";

/** The square preview above the bar, in CSS pixels. */
const PREVIEW_SIZE = 112;

/** Where the bar sits: the whole stack (pills and preview, bar, filters and a
 *  full list of results) centred in the demo, as the app centres it on screen. */
const ABOVE_BAR = PREVIEW_SIZE + 8;
const BAR_HEIGHT = 72;
const BAR_TO_RESULTS = 32 + 8;
const STACK_HEIGHT = ABOVE_BAR + BAR_HEIGHT + BAR_TO_RESULTS + RESULTS_MAX_HEIGHT;
/** The demo is scaled up (--demo-scale, in global.css) around the bar's top
 *  edge, so the bar's place scales with it to keep the stack centred. */
const BAR_TOP = `calc(50% - ${STACK_HEIGHT / 2 - ABOVE_BAR}px * var(--demo-scale))`;

/** The bar's and the results panel's shadow: a hairline ring and a soft drop.
 *  Lighter than the app's, which sits over a dark desktop; this page is white. */
const panelShadow = "0 0 0 1px rgb(255 255 255 / 0.1), 0 4px 12px rgb(0 0 0 / 0.1), 0 14px 34px rgb(0 0 0 / 0.12)";

/** "/ cats" searches the web for "cats"; null for an ordinary file search. */
function webQueryOf(query: string) {
  return query.startsWith(TRIGGER) ? query.slice(TRIGGER.length).trim() : null;
}

function searchWeb(text: string) {
  window.open(`https://www.google.com/search?q=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}

const focusSearch = (root: HTMLElement | null) => root?.querySelector("textarea")?.focus({ preventScroll: true });

/** The app's memory reading: unknown for the first moments after opening, then
 *  a number. In the demo the number is made up (it sits where the app's own
 *  sits, around 14 MB, and drifts a little). */
function useMemoryUsage() {
  const [mb, setMb] = useState<number | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    const first = setTimeout(() => {
      setMb(14);
      timer = setInterval(() => setMb(13 + Math.floor(Math.random() * 3)), 3000);
    }, 1200);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);
  return mb;
}

export default function AppDemo() {
  const memoryMb = useMemoryUsage();
  const [searchMs, setSearchMs] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [typeFilter, setTypeFilter] = useState<FileGroup | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  // Newest first.
  const [recent, setRecent] = useState<string[]>(MOCK_RECENT_SEARCHES);
  const queryRef = useRef(query);
  queryRef.current = query;
  const searchRef = useRef<HTMLDivElement>(null);
  const searchSeq = useRef(0);

  const [savedBrowser, setSavedBrowser] = useState(DEFAULT_BROWSER.id);
  const browsers = MOCK_BROWSERS;
  const browser = browsers.find((b) => b.id === savedBrowser) ?? DEFAULT_BROWSER;

  const webQuery = webQueryOf(query);
  const recentFiles = useMemo(() => recent.filter((q) => !q.startsWith(RECENT_WEB_PREFIX)).slice(0, RECENT_SHOWN), [recent]);
  const recentWeb = useMemo(() => recent.filter((q) => q.startsWith(RECENT_WEB_PREFIX)).slice(0, RECENT_SHOWN), [recent]);
  // Listed while only the trigger is typed; ArrowDown moves into the list.
  const showRecentWeb = webQuery === "" && recentWeb.length > 0;
  const [recentWebActive, setRecentWebActive] = useState<number | null>(null);
  useEffect(() => {
    if (!showRecentWeb) setRecentWebActive(null);
  }, [showRecentWeb]);
  // File searches are listed the same way, in a panel under the empty box.
  const showRecentFiles = query === "" && recentFiles.length > 0;
  const [recentFilesActive, setRecentFilesActive] = useState<number | null>(null);
  useEffect(() => {
    if (!showRecentFiles) setRecentFilesActive(null);
  }, [showRecentFiles]);

  const groups = useMemo(() => countGroups(results), [results]);
  // A new search may have no results of the chosen type: show everything then.
  const activeFilter = typeFilter && groups.some((g) => g.id === typeFilter) ? typeFilter : null;
  const visible = useMemo(
    () => (activeFilter ? results.filter((r) => groupOf(r) === activeFilter) : results),
    [results, activeFilter]
  );

  /** Keeps `text` as a recent search: called once something came of it. */
  const remember = useCallback((text: string) => {
    let t = text.trim();
    const web = webQueryOf(t);
    // "/cats" and "/ cats" are the same web search.
    if (web !== null) t = RECENT_WEB_PREFIX + web;
    // Would read back as a web search.
    else if (t.startsWith(RECENT_WEB_PREFIX)) return;
    if (!t || t === RECENT_WEB_PREFIX) return;
    setRecent((r) => [t, ...r.filter((q) => q !== t)]);
  }, []);

  // The shell would hide the window after opening something; the demo says so.
  const say = useCallback((text: string) => setToast({ id: Date.now(), text }), []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  // Search as you type, once typing pauses for SEARCH_DEBOUNCE_MS. Only the
  // newest request's answer is shown.
  useEffect(() => {
    const seq = ++searchSeq.current;
    if (!query.trim() || webQueryOf(query) !== null) {
      setSearchMs(null);
      setResults([]);
      setActiveIndex(null);
      return;
    }
    const timer = setTimeout(() => {
      const started = performance.now();
      const r = mockSearch(query);
      if (seq !== searchSeq.current) return;
      setSearchMs(Math.max(1, Math.round(performance.now() - started)));
      setResults(r);
      setActiveIndex(r.length ? 0 : null);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const openResult = useCallback(
    (r: SearchResult, reveal: boolean) => {
      remember(queryRef.current);
      say(reveal ? `Showing ${r.name} in Explorer` : `Opening ${r.name}`);
    },
    [remember, say]
  );

  /** Runs a recent web search again, as Enter on it would. */
  const runRecentWeb = (text: string) => {
    const q = text.slice(RECENT_WEB_PREFIX.length);
    if (!q) return;
    const typed = TRIGGER + q;
    setQuery(typed);
    remember(typed);
    searchWeb(q);
  };

  /** Fills a recent file search into the box, which searches it. */
  const runRecentFile = (text: string) => {
    setQuery(text);
    focusSearch(searchRef.current);
  };

  const chooseBrowser = (id: string) => setSavedBrowser(id);

  // Results keyboard: runs in the capture phase so the textarea never sees
  // these keys (Enter would add a line).
  const handleKeyDownCapture = (e: ReactKeyboardEvent) => {
    // The browser menu renders in a portal, but its keys bubble through here.
    if ((e.target as HTMLElement).closest('[data-slot="dropdown-menu-content"]')) return;
    if (query === "" && e.key !== "Tab") {
      // The recent searches listed under the empty box: ArrowDown enters the
      // list, ArrowUp walks back up and out, Enter runs the highlighted one
      // and Escape drops the highlight.
      if (!showRecentFiles || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setRecentFilesActive((i) => (i === null ? 0 : Math.min(i + 1, recentFiles.length - 1)));
      } else if (recentFilesActive !== null && (e.key === "ArrowUp" || e.key === "Enter" || e.key === "Escape")) {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === "ArrowUp") setRecentFilesActive(recentFilesActive === 0 ? null : recentFilesActive - 1);
        else if (e.key === "Enter") runRecentFile(recentFiles[recentFilesActive]);
        else setRecentFilesActive(null);
      }
      return;
    }
    if (webQuery !== null) {
      if (e.key === "Tab") {
        // Cycle the browser to search in; Shift+Tab goes back.
        e.preventDefault();
        e.stopPropagation();
        const at = browsers.findIndex((b) => b.id === browser.id);
        const step = e.shiftKey ? -1 : 1;
        chooseBrowser(browsers[(at + step + browsers.length) % browsers.length].id);
      } else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && showRecentWeb) {
        // Like the empty box's list: ArrowDown enters and walks down,
        // ArrowUp walks back up and out.
        e.preventDefault();
        e.stopPropagation();
        setRecentWebActive((i) =>
          e.key === "ArrowDown"
            ? i === null
              ? 0
              : Math.min(i + 1, recentWeb.length - 1)
            : i === null || i === 0
              ? null
              : i - 1
        );
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        submit(e.ctrlKey);
      }
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!visible.length) return;
      e.preventDefault();
      e.stopPropagation();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((i) => (i === null ? 0 : (i + step + visible.length) % visible.length));
    } else if (e.key === "Tab") {
      // Cycle the type pills (All, then each group); Shift+Tab goes back.
      e.preventDefault();
      e.stopPropagation();
      if (groups.length < 2) return;
      const order: (FileGroup | null)[] = [null, ...groups.map((g) => g.id)];
      const step = e.shiftKey ? -1 : 1;
      const at = order.indexOf(activeFilter);
      setTypeFilter(order[(at + step + order.length) % order.length]);
      setActiveIndex(0);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      submit(e.ctrlKey);
    }
  };

  /** Enter: opens the highlighted result, or runs the web search. `ctrl` is
   *  Ctrl+Enter (or Ctrl+click), which shows the result in Explorer. */
  const submit = (ctrl: boolean) => {
    if (webQuery !== null) {
      if (!webQuery) {
        if (showRecentWeb && recentWebActive !== null) runRecentWeb(recentWeb[recentWebActive]);
        return;
      }
      remember(query);
      searchWeb(webQuery);
      return;
    }
    const r = visible[activeIndex ?? 0];
    if (r) openResult(r, ctrl);
  };

  const showResults = results.length > 0;
  const showPanel = webQuery !== null || showResults || showRecentFiles;

  return (
    // The Escape the app answers by hiding its window clears the box here.
    <div
      className="bs-demo dark absolute inset-0 overflow-hidden"
      onKeyDown={(e) => {
        if (e.key === "Escape" && !e.defaultPrevented) setQuery("");
      }}
    >
      <div
        className="absolute left-1/2 w-[min(27.5rem,calc(100%-2rem))] -translate-x-1/2"
        style={{ top: BAR_TOP, scale: "var(--demo-scale)", transformOrigin: "50% 0" }}
        onKeyDownCapture={handleKeyDownCapture}
      >
        <div className="relative">
          {/* The row above the bar: the preview on the left, the stat pills on
              the right. Both sit on the row's bottom, so the pills stay just
              above the bar whether the preview is there or not. */}
          <div className="absolute inset-x-0 bottom-full mb-2 flex items-end justify-between gap-2">
            {showResults && visible.length > 0 && (
              // Its space is kept for as long as there are results (the square
              // fades out for ones with nothing to preview).
              <PreviewPanel
                result={visible[Math.min(activeIndex ?? 0, visible.length - 1)]}
                size={PREVIEW_SIZE}
                thumbSize={PREVIEW_SIZE * 2}
                // The pills' hairline, not the panel shadow: its drop would
                // shade the gap below and make it look narrower than theirs.
                style={{ boxShadow: statPillShadow }}
              />
            )}
            {/* ml-auto: stays right when there's no preview to its left. */}
            <div className="ml-auto flex items-center gap-1.5 text-[10px] leading-3 font-medium text-zinc-200 tabular-nums">
              {searchMs !== null && (
                <span className={cn(statPill, "motion-safe:animate-fade-in")} style={{ boxShadow: statPillShadow }}>
                  <TimeIcon size={11} />
                  {searchMs} ms
                </span>
              )}
              <span className={statPill} style={{ boxShadow: statPillShadow }}>
                <RamIcon size={11} />
                {memoryMb === null ? (
                  <span className="h-2 w-8 animate-pulse rounded-sm bg-white/15" role="status" aria-label="Reading memory usage" />
                ) : (
                  <>{memoryMb} MB</>
                )}
              </span>
            </div>
          </div>
          <SearchBox
            ref={searchRef}
            maxRows={4}
            value={query}
            onValueChange={setQuery}
            placeholder="what should i look for you?"
            className="gap-0! bg-black! p-[5px]! text-white"
            style={{ boxShadow: panelShadow }}
            textareaClassName="placeholder:text-zinc-400!"
            leftSlot={
              <span className="ml-1 flex h-4 items-center gap-0.5 rounded-[5px] bg-[#2a0b0b] px-1 text-[9px] leading-3 text-red-200/80 ring-1 ring-red-500/20">
                <span className="font-semibold text-red-300">{TRIGGER}</span>
                to search the web
              </span>
            }
            rightSlot={
              <button
                type="button"
                aria-label="Settings"
                title="Settings aren't part of the demo"
                className="group relative isolate inline-flex size-6 cursor-pointer items-center justify-center rounded-lg p-0 outline-none transition-colors duration-80 select-none [&_svg]:size-3.5"
              >
                <span
                  aria-hidden
                  className="absolute inset-px rounded-[inherit] bg-transparent shadow-[0_0_0_1px_transparent] transition-[box-shadow,background-color] [transition-duration:180ms,80ms] [transition-timing-function:cubic-bezier(0.23,1,0.32,1),ease] group-hover:bg-hover group-hover:shadow-[0_0_0_1px_var(--hover)] group-active:bg-active group-active:shadow-[0_0_0_0px_var(--active)] group-active:[transition-duration:80ms,80ms]"
                />
                <span className="relative inline-flex items-center justify-center">
                  <GearSixIcon size={16} />
                </span>
              </button>
            }
          />
        </div>

        {showResults && groups.length > 1 && (
          <TypeFilter
            groups={groups}
            total={results.length}
            selected={activeFilter}
            onSelect={(g) => {
              setTypeFilter(g);
              setActiveIndex(0);
            }}
          />
        )}

        {showPanel && (
          // Below the bar. Rises in when it first appears (results, the
          // web-search row or the recent searches); transform only.
          <div
            className="mt-2 origin-top overflow-hidden rounded-xl bg-black text-white motion-safe:animate-rise-in"
            style={{ boxShadow: panelShadow }}
          >
            {webQuery !== null ? (
              <>
                <div className="flex items-center gap-2 pr-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!webQuery) return;
                      remember(query);
                      searchWeb(webQuery);
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 p-3 pr-0 text-left text-[12px] leading-4"
                  >
                    <GlobalSearchIcon size={ROW_ICON_SIZE} className="shrink-0" />
                    <span className="truncate">
                      {!webQuery ? "Type something to search the web" : `Search the web for “${webQuery}”`}
                    </span>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="flex shrink-0 items-center gap-2 rounded-md px-2 py-1 text-[12px] leading-4 text-white outline-hidden transition-colors hover:bg-white/10 focus-visible:bg-white/10 data-[state=open]:bg-white/10"
                      aria-label="Browser to search in"
                    >
                      <GlobalSearchIcon size={ROW_ICON_SIZE} className="shrink-0" />
                      <span className="max-w-28 truncate">{browser.name}</span>
                      <CaretDownIcon size={ROW_ICON_SIZE} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="bottom"
                      align="end"
                      avoidCollisions={false}
                      className="bs-demo dark border-white/10 bg-zinc-950 text-white"
                      // Portalled out of the scaled demo, so scaled to match,
                      // from the corner that sits under the trigger.
                      style={{ scale: "var(--demo-scale)", transformOrigin: "top right" }}
                      // Hand focus back to the search box, not the trigger.
                      onCloseAutoFocus={(e) => {
                        e.preventDefault();
                        focusSearch(searchRef.current);
                      }}
                    >
                      {browsers.map((b) => (
                        <DropdownMenuItem
                          key={b.id}
                          className="gap-2 py-1 text-[12px] leading-4 text-white focus:text-white"
                          onSelect={() => chooseBrowser(b.id)}
                        >
                          <GlobalSearchIcon size={ROW_ICON_SIZE} className="shrink-0" />
                          <span className="truncate">{b.name}</span>
                          {b.id === browser.id && <CheckIcon size={ROW_ICON_SIZE} className="ml-auto shrink-0" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {showRecentWeb && (
                  <RecentSearches
                    label="Recent web searches"
                    searches={recentWeb}
                    display={(s) => s.slice(1)}
                    bordered
                    active={recentWebActive}
                    onActiveChange={setRecentWebActive}
                    onPick={runRecentWeb}
                  />
                )}
              </>
            ) : showResults ? (
              <SearchResults
                results={visible}
                activeIndex={activeIndex}
                onActiveIndexChange={setActiveIndex}
                // A click is like Enter, Ctrl+click like Ctrl+Enter.
                onOpen={(r, ctrl) => openResult(r, ctrl)}
                maxHeight={RESULTS_MAX_HEIGHT}
              />
            ) : (
              <RecentSearches
                label="Recent searches"
                searches={recentFiles}
                active={recentFilesActive}
                onActiveChange={setRecentFilesActive}
                onPick={runRecentFile}
              />
            )}
          </div>
        )}
      </div>

      {toast && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
          <p
            key={toast.id}
            role="status"
            className="truncate rounded-lg bg-black px-3 py-1.5 text-[12px] leading-4 text-white motion-safe:animate-rise-in"
            style={{ boxShadow: panelShadow }}
          >
            {toast.text} <span className="text-zinc-500">· the app would close the window now</span>
          </p>
        </div>
      )}
    </div>
  );
}

/** Recent searches in a panel of their own: file searches under the empty
 *  box, web searches under the web-search row while only "/" is typed.
 *  Picking one runs it again. */
function RecentSearches({
  label,
  searches,
  display = (s) => s,
  bordered = false,
  active,
  onActiveChange,
  onPick,
}: {
  label: string;
  /** Newest first. */
  searches: string[];
  /** What a search reads as in the list (web searches drop their "/"). */
  display?: (search: string) => string;
  /** A hairline above, when it sits under another row. */
  bordered?: boolean;
  active: number | null;
  onActiveChange: (index: number | null) => void;
  onPick: (search: string) => void;
}) {
  return (
    <div
      role="listbox"
      aria-label={label}
      onMouseLeave={() => onActiveChange(null)}
      className={cn("flex flex-col p-1.5", bordered && "border-t border-white/[0.06]")}
    >
      {searches.map((s, i) => (
        <div
          key={s}
          role="option"
          aria-selected={i === active}
          onMouseMove={() => i !== active && onActiveChange(i)}
          onClick={() => onPick(s)}
          className={cn(
            "flex h-7 cursor-pointer items-center gap-2 rounded-md px-2 text-[12px] leading-4 transition-colors duration-80",
            i === active ? "bg-white/10 text-white" : "text-zinc-400"
          )}
        >
          <ClockCounterClockwiseIcon size={ROW_ICON_SIZE} className="shrink-0" />
          <span className="truncate">{display(s)}</span>
        </div>
      ))}
    </div>
  );
}
