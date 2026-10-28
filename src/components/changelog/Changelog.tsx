import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BranchGraph } from "@/components/branch-graph";
import { Button } from "@/components/ui/button";
import { loadReleases } from "./github";
import { releases as fallback } from "./versions";

const PAGE = 3;
// Newest commits kept per version; the rest of that version's history is trimmed.
const MAX_COMMITS = 6;

export default function Changelog({ repo }: { repo: string }) {
	const [releases, setReleases] = useState(fallback);
	const [start, setStart] = useState(0);

	useEffect(() => {
		loadReleases(repo)
			.then((live) => live.length && setReleases(live))
			.catch(() => {});
	}, [repo]);

	const shown = releases.slice(start, start + PAGE);
	const commits = useMemo(
		() =>
			shown.flatMap((r, k) => {
				const kept = r.commits.slice(0, MAX_COMMITS);
				if (kept.length === r.commits.length) return kept;
				// Point the last kept commit at the next version so its line carries on past the trim.
				const next = releases[start + k + 1]?.commits[0];
				kept[kept.length - 1] = { ...kept[kept.length - 1], parents: next ? [next.sha] : [] };
				return kept;
			}),
		[releases, start],
	);
	const canNewer = start > 0;
	const canOlder = start + PAGE < releases.length;

	return (
		<div className="flex w-full flex-col gap-3">
			{/* Re-keyed so the edges redraw whenever the window moves. */}
			<BranchGraph
				className="max-w-none"
				commits={commits}
				key={start}
				title={shown[0].label}
			/>
			{(canNewer || canOlder) && (
				<div className="flex items-center justify-between">
					<Button disabled={!canNewer} onClick={() => setStart((s) => Math.max(0, s - 1))} size="sm" variant="outline">
						<ChevronUpIcon /> Newer
					</Button>
					<span className="text-center text-muted-foreground text-xs tabular-nums">
						{start + 1}–{start + shown.length} of {releases.length} versions
						<span className="max-sm:hidden"> · latest {MAX_COMMITS} commits each</span>
					</span>
					<Button disabled={!canOlder} onClick={() => setStart((s) => s + 1)} size="sm" variant="outline">
						Older <ChevronDownIcon />
					</Button>
				</div>
			)}
		</div>
	);
}
