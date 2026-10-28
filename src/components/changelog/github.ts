import type { Commit, CommitRef } from "@/components/branch-graph";
import { authors, type Release } from "./versions";

interface ApiCommit {
	sha: string;
	parents: { sha: string }[];
	author: { login: string } | null;
	commit: { message: string; author: { name: string; date: string } };
}

const API = "https://api.github.com/repos";
const PER_PAGE = 100;
const MAX_PAGES = 3;
const CACHE_KEY = "changelog-releases";
const MAX_AGE = 60 * 60 * 1000;

async function get<T>(url: string): Promise<T> {
	const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
	if (!res.ok) throw new Error(`GitHub API ${res.status}`);
	return res.json();
}

function authorOf(c: ApiCommit): Commit["author"] {
	const login = c.author?.login ?? "";
	if (login === "dependabot[bot]") return authors.db;
	if (login === "github-actions[bot]") return authors.gh;
	const name = c.commit.author.name;
	const initials = name
		.split(/\s+/)
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
	return { ...authors.me, name, initials };
}

/** Builds the releases list from a repo's commits, tags and branches: a release is a tag plus every commit since the previous tag. */
export async function fetchReleases(repo: string): Promise<Release[]> {
	const pages = await Promise.all(
		Array.from({ length: MAX_PAGES }, (_, i) => get<ApiCommit[]>(`${API}/${repo}/commits?per_page=${PER_PAGE}&page=${i + 1}`).catch(() => [] as ApiCommit[])),
	);
	const [tags, branches] = await Promise.all([
		get<{ name: string; commit: { sha: string } }[]>(`${API}/${repo}/tags?per_page=${PER_PAGE}`),
		get<{ name: string; commit: { sha: string } }[]>(`${API}/${repo}/branches?per_page=${PER_PAGE}`),
	]);
	const raw = pages.flat();
	if (!raw.length) throw new Error("no commits");

	const known = new Set(raw.map((c) => c.sha));
	const refs = new Map<string, CommitRef[]>();
	const addRef = (sha: string, ref: CommitRef) => {
		if (!known.has(sha)) return;
		const list = refs.get(sha) ?? [];
		if (!list.some((r) => r.name === ref.name && r.type === ref.type)) refs.set(sha, [...list, ref]);
	};
	for (const b of branches) addRef(b.commit.sha, { name: b.name, type: "branch" });
	for (const t of tags) addRef(t.commit.sha, { name: t.name, type: "tag" });

	const commits: Commit[] = raw.map((c) => {
		const [title] = c.commit.message.split("\n");
		const merge = /^Merge pull request #(\d+) from [^/]+\/(.+)$/.exec(title);
		if (merge && c.parents[1]) addRef(c.parents[1].sha, { name: merge[2], type: "branch" });
		return {
			sha: c.sha,
			message: merge ? `Merge #${merge[1]} · ${merge[2]}` : title,
			author: authorOf(c),
			date: c.commit.author.date,
			parents: c.parents.map((p) => p.sha).filter((p) => known.has(p)),
		};
	});
	for (const c of commits) {
		const r = refs.get(c.sha);
		if (r) c.refs = r;
	}

	const releases: Release[] = [];
	let current: Release | null = null;
	for (const c of commits) {
		const tag = c.refs?.find((r) => r.type === "tag");
		if (tag) releases.push((current = { label: tag.name, commits: [] }));
		else if (!current) releases.push((current = { label: "Unreleased", commits: [] }));
		current!.commits.push(c);
	}
	return releases;
}

/** Fetches releases at most once an hour per browser, falling back to the last cached copy. */
export async function loadReleases(repo: string): Promise<Release[]> {
	let cached: { releases: Release[]; time: number } | null = null;
	try {
		const raw = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null");
		if (raw?.repo === repo && Array.isArray(raw.releases) && typeof raw.time === "number") cached = raw;
	} catch {}
	if (cached && Date.now() - cached.time < MAX_AGE) return cached.releases;
	try {
		const releases = await fetchReleases(repo);
		try {
			localStorage.setItem(CACHE_KEY, JSON.stringify({ repo, releases, time: Date.now() }));
		} catch {}
		return releases;
	} catch (err) {
		if (cached) return cached.releases;
		throw err;
	}
}
