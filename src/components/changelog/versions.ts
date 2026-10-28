import type { Commit } from "@/components/branch-graph";

export interface Release {
	/** Heading shown for the group, e.g. "v0.3.1". */
	label: string;
	commits: Commit[];
}

export const authors = {
	me: { name: "Atharv Remeshan", initials: "AR", className: "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" },
	gh: { name: "github-actions[bot]", initials: "GH", className: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
	db: { name: "dependabot[bot]", initials: "DB", className: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
};

// Static snapshot, shown until the live history loads from the GitHub API (and if it fails).
// Newest first; a release is the tagged commit plus every commit since the previous tag.
export const releases: Release[] = [
	{
		label: "v0.3.1",
		commits: [
			{ sha: "1391ff334d3c6ab7d777ae5d94932c83ede53f79", message: "Merge #4 \u00b7 release-please", author: authors.me, date: "2026-10-25T17:21:02Z", parents: ["b0f454b77d19756db1e00d0bd4ad88d76e588ef5", "c856a3b9c8a92fc5558b9577ec2a421ecca4004a"], refs: [{"name": "main", "type": "branch"}, {"name": "v0.3.1", "type": "tag"}] },
			{ sha: "c856a3b9c8a92fc5558b9577ec2a421ecca4004a", message: "chore(main): release 0.3.1", author: authors.gh, date: "2026-10-25T17:16:33Z", parents: ["b0f454b77d19756db1e00d0bd4ad88d76e588ef5"], refs: [{"name": "release-please", "type": "branch"}] },
			{ sha: "b0f454b77d19756db1e00d0bd4ad88d76e588ef5", message: "fix: implement handling for non-resident attribute lists and add tests", author: authors.me, date: "2026-10-25T17:16:05Z", parents: ["e300aee95e9f59cf4fd0a85b251eca433813c7bc"] },
		],
	},
	{
		label: "v0.3.0",
		commits: [
			{ sha: "e300aee95e9f59cf4fd0a85b251eca433813c7bc", message: "Merge #2 \u00b7 release-please", author: authors.me, date: "2026-10-25T13:51:24Z", parents: ["67123d08cd3df65a589578952c210a8369c3bd63", "22750114853afbadee7cd64786dbd7ea05215f60"], refs: [{"name": "v0.3.0", "type": "tag"}] },
			{ sha: "67123d08cd3df65a589578952c210a8369c3bd63", message: "Merge #3 \u00b7 dependabot", author: authors.me, date: "2026-10-25T13:51:11Z", parents: ["1e612331645fd007b7f919a7f32d694db66910bd", "aca6b1eb1ed78582ad2be455c74cd12d95fd833f"] },
			{ sha: "aca6b1eb1ed78582ad2be455c74cd12d95fd833f", message: "chore(deps): bump the actions group with 5 updates", author: authors.db, date: "2026-10-25T13:38:08Z", parents: ["1e612331645fd007b7f919a7f32d694db66910bd"], refs: [{"name": "dependabot", "type": "branch"}] },
			{ sha: "22750114853afbadee7cd64786dbd7ea05215f60", message: "chore(main): release 0.3.0", author: authors.gh, date: "2026-10-25T13:36:54Z", parents: ["1e612331645fd007b7f919a7f32d694db66910bd"] },
			{ sha: "1e612331645fd007b7f919a7f32d694db66910bd", message: "feat(diagrams): update architecture diagrams and flowchart", author: authors.me, date: "2026-10-25T13:36:21Z", parents: ["aad88f173f0f5e8bd4742bce7aed24c33cc6ed90"] },
			{ sha: "aad88f173f0f5e8bd4742bce7aed24c33cc6ed90", message: "Remove obsolete binary files for better search helper, indexer, and watcher", author: authors.me, date: "2026-10-25T13:35:38Z", parents: ["d68cea256ef93e3164ef34e408d3f9d14c36b6da"] },
		],
	},
	{
		label: "v0.2.0",
		commits: [
			{ sha: "d68cea256ef93e3164ef34e408d3f9d14c36b6da", message: "Merge #1 \u00b7 release-please", author: authors.me, date: "2026-10-25T04:17:43Z", parents: ["383d118df06d09d4e80c8f3f310a97ee253e21ce", "c950bca79bc40220e4459cb8d654b2297aef30ea"], refs: [{"name": "v0.2.0", "type": "tag"}] },
			{ sha: "c950bca79bc40220e4459cb8d654b2297aef30ea", message: "chore(main): release 0.2.0", author: authors.gh, date: "2026-10-25T03:51:12Z", parents: ["383d118df06d09d4e80c8f3f310a97ee253e21ce"] },
			{ sha: "383d118df06d09d4e80c8f3f310a97ee253e21ce", message: "Add CI and release workflows, configure updater plugins, and set versioning", author: authors.me, date: "2026-10-25T03:50:35Z", parents: ["5ed2b43e5d3cd346f016d1b66b8587a821635bd6"] },
			{ sha: "5ed2b43e5d3cd346f016d1b66b8587a821635bd6", message: "Enhance privacy policy and settings for web search functionality", author: authors.me, date: "2026-10-25T02:17:46Z", parents: ["0ea6bb637202a42571f6ea3bbd3d38288186d7ab"] },
			{ sha: "0ea6bb637202a42571f6ea3bbd3d38288186d7ab", message: "Add diagrams for indexing and search processes", author: authors.me, date: "2026-10-24T19:09:53Z", parents: ["8e412c2d99be72eb6b87434022aeb8580b9f03ee"] },
			{ sha: "8e412c2d99be72eb6b87434022aeb8580b9f03ee", message: "readme change", author: authors.me, date: "2026-10-24T19:01:01Z", parents: ["812738bc8c0d61e7d82af227f25c8649d9f498c0"] },
			{ sha: "812738bc8c0d61e7d82af227f25c8649d9f498c0", message: "chore: update screenshot assets for improved documentation visuals", author: authors.me, date: "2026-10-24T18:44:37Z", parents: ["2710d094597f0ce6e49a75f121d199329c45ec20"] },
			{ sha: "2710d094597f0ce6e49a75f121d199329c45ec20", message: "Refactor code structure for improved readability and maintainability", author: authors.me, date: "2026-10-24T18:42:03Z", parents: ["f9d3d4d67c54c2213a332fa0193787fc7f92ddf2"] },
			{ sha: "f9d3d4d67c54c2213a332fa0193787fc7f92ddf2", message: "chore: remove unused SVG icon and keyboard component files", author: authors.me, date: "2026-10-24T18:41:24Z", parents: ["e967a1928b996a4bcec4b696ed7b7412dfb4ae3b"] },
			{ sha: "e967a1928b996a4bcec4b696ed7b7412dfb4ae3b", message: "feat: add keep-open functionality for settings window and implement server rack visualization", author: authors.me, date: "2026-10-24T15:37:20Z", parents: ["de243c53f9924d96aea60482c7e67c29b40738c2"] },
			{ sha: "de243c53f9924d96aea60482c7e67c29b40738c2", message: "chore: remove obsolete README files and unused assets", author: authors.me, date: "2026-10-24T15:36:16Z", parents: ["9863b66a88eb6aa826a7dfff35f6b7b539822d8b"] },
			{ sha: "9863b66a88eb6aa826a7dfff35f6b7b539822d8b", message: "feat: implement web search functionality with user API keys", author: authors.me, date: "2026-10-24T08:38:24Z", parents: ["5183229b32cd61c568da21b611f92d4b75df48a9"] },
			{ sha: "5183229b32cd61c568da21b611f92d4b75df48a9", message: "feat: add settings management and preview functionality", author: authors.me, date: "2026-10-23T18:04:45Z", parents: ["b9bcbafff0ed288dd527e12a38499a41707073be"] },
			{ sha: "b9bcbafff0ed288dd527e12a38499a41707073be", message: "feat: implement web search functionality with browser selection", author: authors.me, date: "2026-10-23T10:03:55Z", parents: ["5c82098af870ca1284341fb59f2393e8dcdc85f6"] },
			{ sha: "5c82098af870ca1284341fb59f2393e8dcdc85f6", message: "feat: add indexing functionality and search results component", author: authors.me, date: "2026-10-22T04:59:02Z", parents: ["07b7c6bae37741254bf90d0f18d02f82340a9981"] },
			{ sha: "07b7c6bae37741254bf90d0f18d02f82340a9981", message: "chore: remove obsolete Windows executable from binaries", author: authors.me, date: "2026-10-22T04:58:43Z", parents: ["f0dea1de8e36a6ca31ab17c59e414d7f45453d38"] },
		],
	},
	{
		label: "Prototype",
		commits: [
			{ sha: "f0dea1de8e36a6ca31ab17c59e414d7f45453d38", message: "feat: add utility libraries for font weights, icons, shapes, sizes, and surfaces", author: authors.me, date: "2026-10-21T13:17:04Z", parents: ["0c4cc4a665f203545507cacab6db3aa9f631e6d0"] },
			{ sha: "0c4cc4a665f203545507cacab6db3aa9f631e6d0", message: "Add search icon SVG asset to the project", author: authors.me, date: "2026-09-11T17:56:34Z", parents: ["f6c41eb8925c23c4fd5b272de15383f561ab8b8c"] },
			{ sha: "f6c41eb8925c23c4fd5b272de15383f561ab8b8c", message: "Initialize README.md with project details", author: authors.me, date: "2026-09-11T02:29:18Z", parents: ["ef4c252fac86993d5877095a819bfdb45079850f"] },
			{ sha: "ef4c252fac86993d5877095a819bfdb45079850f", message: "feat: add new Tauri plugins and capabilities for enhanced functionality", author: authors.me, date: "2026-09-10T10:18:28Z", parents: ["d2689ebc9d6ea87fd32496d26de2d04cde77b8eb"] },
			{ sha: "d2689ebc9d6ea87fd32496d26de2d04cde77b8eb", message: "feat: add backend implementation and configuration for Better Search", author: authors.me, date: "2026-09-07T04:05:42Z", parents: ["45fa699d57414b80bbb2180c5bf097266c30b1d8"] },
			{ sha: "45fa699d57414b80bbb2180c5bf097266c30b1d8", message: "feat: initialize better-search application with Tauri and React", author: authors.me, date: "2026-09-06T08:23:58Z", parents: ["bc5e05880666cfdf886d64b117f5b24f8dfb82b3"] },
			{ sha: "bc5e05880666cfdf886d64b117f5b24f8dfb82b3", message: "added electron", author: authors.me, date: "2026-06-14T15:06:16Z", parents: [] },
		],
	},
];
