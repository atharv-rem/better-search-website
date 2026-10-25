/** A file or folder in the mock index; same shape the app's backend returns. */
export interface SearchResult {
  id: number;
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  modified_at: number;
  open_count: number;
}
