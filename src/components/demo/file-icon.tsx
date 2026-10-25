import type { SearchResult } from "./types";
import { iconOf } from "./file-icons";

/** The generic file-type glyph. The app swaps in an app's own Windows icon
 *  for executables; the demo has no Windows to ask, so it keeps the glyph. */
export function FileIcon({ result, size }: { result: SearchResult; size: number }) {
  const { Icon, color } = iconOf(result);
  return <Icon size={size} weight="duotone" color={color} className="shrink-0" />;
}
