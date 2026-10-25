import type { SearchResult } from "./types";

// A made-up drive for the demo. Nothing here is read from the visitor's
// computer: it's a fixed list the search box filters in memory.

const HOME = "C:\\Users\\you";

/** [path under the home folder, times opened]; a trailing "\" marks a folder. */
const ENTRIES: [string, number][] = [
  // Folders
  ["Documents\\", 41],
  ["Documents\\Resumes\\", 12],
  ["Documents\\Invoices\\", 9],
  ["Documents\\Reports\\", 7],
  ["Downloads\\", 38],
  ["Pictures\\", 22],
  ["Pictures\\Screenshots\\", 17],
  ["Pictures\\Photos\\", 6],
  ["Projects\\", 33],
  ["Projects\\better-search\\", 29],
  ["Projects\\portfolio-site\\", 14],
  ["Music\\", 5],
  ["Videos\\", 4],

  // Documents
  ["Documents\\Resumes\\Resume.pdf", 25],
  ["Documents\\Resumes\\Resume_2025_final.docx", 8],
  ["Documents\\Resumes\\Cover_Letter.docx", 5],
  ["Documents\\Invoices\\Invoice_March_2025.pdf", 6],
  ["Documents\\Invoices\\Invoice_April_2025.pdf", 4],
  ["Documents\\Invoices\\Invoice_May_2025.pdf", 3],
  ["Documents\\Reports\\Annual_Report_2024.pdf", 11],
  ["Documents\\Reports\\Q3_Report.pptx", 9],
  ["Documents\\Reports\\Tax_Report_2024.xlsx", 7],
  ["Documents\\Reports\\Sales_Report_Q2.xlsx", 3],
  ["Documents\\Project_Proposal.docx", 10],
  ["Documents\\Lease_Agreement.pdf", 2],
  ["Documents\\Thesis_Draft_v3.docx", 13],
  ["Documents\\meeting-notes.md", 15],
  ["Documents\\notes.txt", 18],
  ["Documents\\budget_2025.csv", 6],
  ["Downloads\\receipt_order_88231.pdf", 2],
  ["Downloads\\Conference_Schedule.pdf", 3],

  // Images
  ["Pictures\\Screenshots\\Screenshot 2025-10-12.png", 8],
  ["Pictures\\Screenshots\\Screenshot 2025-10-18.png", 5],
  ["Pictures\\Screenshots\\Screenshot 2025-10-21.png", 2],
  ["Pictures\\Photos\\vacation_photo_001.jpg", 7],
  ["Pictures\\Photos\\vacation_photo_002.jpg", 3],
  ["Pictures\\Photos\\profile-photo.jpg", 12],
  ["Pictures\\Photos\\sunset_beach.jpg", 4],
  ["Pictures\\wallpaper.png", 6],
  ["Pictures\\logo.svg", 9],
  ["Projects\\portfolio-site\\design-mockup.png", 8],

  // Videos
  ["Videos\\Project_Demo.mp4", 10],
  ["Videos\\screen_recording_oct.mp4", 4],
  ["Videos\\birthday_2024.mov", 3],

  // Audio
  ["Music\\playlist_focus.mp3", 14],
  ["Music\\podcast_episode_12.mp3", 6],
  ["Music\\voice_memo_idea.m4a", 3],

  // Code
  ["Projects\\better-search\\App.tsx", 31],
  ["Projects\\better-search\\main.go", 20],
  ["Projects\\better-search\\search.rs", 18],
  ["Projects\\better-search\\package.json", 16],
  ["Projects\\better-search\\schema.sql", 9],
  ["Projects\\better-search\\build.ps1", 6],
  ["Projects\\better-search\\README.md", 11],
  ["Projects\\portfolio-site\\index.html", 12],
  ["Projects\\portfolio-site\\styles.css", 10],
  ["Projects\\portfolio-site\\index.ts", 7],
  ["Projects\\portfolio-site\\config.yml", 3],
  ["Projects\\scraper.py", 8],

  // Archives
  ["Downloads\\project-backup.zip", 4],
  ["Downloads\\photos-2024.7z", 2],
  ["Downloads\\assets.zip", 3],

  // Apps
  ["AppData\\Local\\Programs\\Visual Studio Code.exe", 60],
  ["AppData\\Local\\Programs\\Discord.exe", 35],
  ["AppData\\Local\\Programs\\Spotify.exe", 28],
  ["AppData\\Local\\Programs\\Figma.exe", 19],
  ["AppData\\Local\\Programs\\Obsidian.exe", 14],
  ["AppData\\Local\\Programs\\Notepad.exe", 21],

  // Other
  ["Projects\\better-search\\LICENSE", 1],
  ["Projects\\better-search\\.gitignore", 1],
  ["Downloads\\data_export.bin", 1],
  ["Documents\\server_debug.log", 2],
];

/** The mock index: what a real search would return from the SQLite file list. */
export const MOCK_FILES: SearchResult[] = ENTRIES.map(([rel, open_count], i) => {
  const dir = rel.endsWith("\\");
  const path = `${HOME}\\${rel}`;
  const parts = rel.split("\\").filter(Boolean);
  return {
    id: i + 1,
    name: parts[parts.length - 1],
    path,
    type: dir ? "directory" : "file",
    size: 0,
    modified_at: 0,
    open_count,
  };
});

/** Searches the demo starts with, newest first. A "/" one is a web search. */
export const MOCK_RECENT_SEARCHES = ["invoice", "resume", "screenshot", "/best coffee near me", "project"];

// --- Preview contents ----------------------------------------------------

const TEXT: Record<string, string> = {
  "notes.txt": `groceries
- oat milk
- coffee beans
- bananas

call landlord about the lease
finish thesis draft before friday
book flights for the conference
renew passport`,
  "meeting-notes.md": `# Weekly sync

## Agenda
- search index rebuild times
- memory usage on idle
- release checklist

## Decisions
- ship v0.3 on Friday
- keep the index in RAM only
- no telemetry. ever.`,
  "budget_2025.csv": `month,income,rent,food,other
jan,3200,1100,420,310
feb,3200,1100,390,280
mar,3350,1100,455,360
apr,3350,1100,410,295
may,3350,1100,430,340`,
  "README.md": `# better-search

Clean, super fast search
for Windows.

- indexes once
- 0% idle CPU
- private and local

## Build
npm install
npm run tauri build`,
  "server_debug.log": `[10:02:11] indexer started
[10:02:13] read C:\\ (1,204,883 records)
[10:02:19] saved C:\\ in 6.1s
[10:02:19] watcher attached
[10:14:52] search "invoice" 12ms
[10:15:03] search "resu" 9ms`,
  "App.tsx": `export default function App() {
  const [query, setQuery] = useState("");
  const results = useSearch(query);

  return (
    <SearchBox
      value={query}
      onChange={setQuery}
    >
      <Results items={results} />
    </SearchBox>
  );
}`,
  "main.go": `package main

import "fmt"

func main() {
	idx := index.Open()
	defer idx.Close()

	for _, r := range idx.Search("invoice") {
		fmt.Println(r.Path)
	}
}`,
  "search.rs": `pub fn search(q: &str, limit: usize) -> Vec<Hit> {
    let terms = tokenize(q);
    INDEX
        .iter()
        .filter(|f| terms.iter().all(|t| f.name.contains(t)))
        .take(limit)
        .collect()
}`,
  "package.json": `{
  "name": "better-search",
  "version": "0.3.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "react": "^19.3.1"
  }
}`,
  "schema.sql": `CREATE TABLE files (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  is_dir INTEGER NOT NULL,
  open_count INTEGER DEFAULT 0
);

CREATE INDEX idx_name ON files(name);`,
  "build.ps1": `$ErrorActionPreference = "Stop"
go build -o bin\\indexer.exe .\\cmd\\indexer
go build -o bin\\watcher.exe .\\cmd\\watcher
Write-Host "backend built"`,
  "index.html": `<!doctype html>
<html lang="en">
  <head>
    <title>Portfolio</title>
  </head>
  <body>
    <h1>Hi, I'm Alex</h1>
  </body>
</html>`,
  "styles.css": `:root {
  --bg: #fafafa;
  --fg: #111;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font: 16px/1.5 system-ui;
}`,
  "index.ts": `import { render } from "./render";

const root = document.querySelector("#app")!;
render(root, { theme: "light" });`,
  "config.yml": `site:
  title: Portfolio
  theme: light
deploy:
  branch: main
  region: eu-west`,
  "scraper.py": `import requests
from bs4 import BeautifulSoup

def titles(url):
    html = requests.get(url).text
    soup = BeautifulSoup(html, "html.parser")
    return [h.text for h in soup.select("h2")]`,
  ".gitignore": `node_modules
dist
*.log
.env`,
  LICENSE: `MIT License

Copyright (c) 2025

Permission is hereby granted, free of
charge, to any person obtaining a copy
of this software and associated
documentation files...`,
};

const PAGES: Record<string, { text: string; heading: boolean }[]> = {
  "Resume.pdf": [
    { text: "Alex Morgan", heading: true },
    { text: "Software Engineer · Berlin", heading: false },
    { text: "Experience", heading: true },
    { text: "Built a desktop search tool that indexes two million files in about ten seconds and idles at zero percent CPU.", heading: false },
    { text: "Led the move of the web frontend from a single-page app to static pages, cutting load time by half.", heading: false },
    { text: "Education", heading: true },
    { text: "B.Sc. Computer Science", heading: false },
  ],
  "Resume_2025_final.docx": [
    { text: "Alex Morgan", heading: true },
    { text: "Résumé · 2025", heading: false },
    { text: "Summary", heading: true },
    { text: "Engineer who likes fast, quiet software. Comfortable across Go, Rust and TypeScript.", heading: false },
    { text: "Skills", heading: true },
    { text: "Go, Rust, TypeScript, React, SQLite", heading: false },
  ],
  "Cover_Letter.docx": [
    { text: "Dear hiring team,", heading: false },
    { text: "I'm writing to apply for the Staff Engineer role. I've spent the last two years building tools that stay out of the way.", heading: false },
    { text: "Sincerely,", heading: false },
    { text: "Alex Morgan", heading: false },
  ],
  "Invoice_March_2025.pdf": [
    { text: "INVOICE #0312", heading: true },
    { text: "Billed to: Northwind Studio", heading: false },
    { text: "Design consultation · 12h", heading: false },
    { text: "Frontend build · 24h", heading: false },
    { text: "Total due: €3,240.00", heading: true },
  ],
  "Invoice_April_2025.pdf": [
    { text: "INVOICE #0327", heading: true },
    { text: "Billed to: Northwind Studio", heading: false },
    { text: "Maintenance retainer · April", heading: false },
    { text: "Total due: €1,800.00", heading: true },
  ],
  "Invoice_May_2025.pdf": [
    { text: "INVOICE #0341", heading: true },
    { text: "Billed to: Northwind Studio", heading: false },
    { text: "Maintenance retainer · May", heading: false },
    { text: "Total due: €1,800.00", heading: true },
  ],
  "Annual_Report_2024.pdf": [
    { text: "Annual Report 2024", heading: true },
    { text: "A year of steady growth", heading: false },
    { text: "Revenue grew 18% over 2023, driven by the new subscription tier and a smaller, faster product.", heading: false },
    { text: "Highlights", heading: true },
    { text: "Three releases, zero outages.", heading: false },
  ],
  "Q3_Report.pptx": [
    { text: "Q3 Report", heading: true },
    { text: "Where we are", heading: false },
    { text: "Search latency down to 12 ms median", heading: false },
    { text: "Memory use steady at 14 MB", heading: false },
  ],
  "Tax_Report_2024.xlsx": [
    { text: "Tax Report 2024", heading: true },
    { text: "Category · Amount", heading: false },
    { text: "Income · 41,200", heading: false },
    { text: "Deductions · 6,480", heading: false },
  ],
  "Sales_Report_Q2.xlsx": [
    { text: "Sales Report Q2", heading: true },
    { text: "April · 12,400", heading: false },
    { text: "May · 13,900", heading: false },
    { text: "June · 15,250", heading: false },
  ],
  "Project_Proposal.docx": [
    { text: "Project Proposal", heading: true },
    { text: "Scope", heading: true },
    { text: "A lightweight desktop search that keeps its index in memory and never touches the disk after the first scan.", heading: false },
    { text: "Timeline: six weeks.", heading: false },
  ],
  "Lease_Agreement.pdf": [
    { text: "RESIDENTIAL LEASE AGREEMENT", heading: true },
    { text: "This agreement is made between the Landlord and the Tenant for the premises described below.", heading: false },
    { text: "1. Term", heading: true },
    { text: "The lease begins on the first of the month and runs for twelve months.", heading: false },
  ],
  "Thesis_Draft_v3.docx": [
    { text: "Fast Substring Search over Large File Tables", heading: true },
    { text: "Abstract", heading: true },
    { text: "We study in-memory indexes for file names and show that a flat scan with early exit beats a trie at two million records.", heading: false },
  ],
  "receipt_order_88231.pdf": [
    { text: "Receipt", heading: true },
    { text: "Order #88231", heading: false },
    { text: "Mechanical keyboard · €89.00", heading: false },
    { text: "Paid by card", heading: false },
  ],
  "Conference_Schedule.pdf": [
    { text: "DevDays 2025", heading: true },
    { text: "Day 1 · Keynote 9:00", heading: false },
    { text: "Day 1 · Workshops 11:00", heading: false },
    { text: "Day 2 · Talks 10:00", heading: false },
  ],
};

const FOLDERS: Record<string, { name: string; dir: boolean }[]> = {
  Documents: [
    { name: "Resumes", dir: true },
    { name: "Invoices", dir: true },
    { name: "Reports", dir: true },
    { name: "Project_Proposal.docx", dir: false },
    { name: "Thesis_Draft_v3.docx", dir: false },
    { name: "meeting-notes.md", dir: false },
    { name: "notes.txt", dir: false },
  ],
  Resumes: [
    { name: "Resume.pdf", dir: false },
    { name: "Resume_2025_final.docx", dir: false },
    { name: "Cover_Letter.docx", dir: false },
  ],
  Invoices: [
    { name: "Invoice_March_2025.pdf", dir: false },
    { name: "Invoice_April_2025.pdf", dir: false },
    { name: "Invoice_May_2025.pdf", dir: false },
  ],
  Reports: [
    { name: "Annual_Report_2024.pdf", dir: false },
    { name: "Q3_Report.pptx", dir: false },
    { name: "Tax_Report_2024.xlsx", dir: false },
    { name: "Sales_Report_Q2.xlsx", dir: false },
  ],
  Downloads: [
    { name: "project-backup.zip", dir: false },
    { name: "photos-2024.7z", dir: false },
    { name: "assets.zip", dir: false },
    { name: "receipt_order_88231.pdf", dir: false },
    { name: "Conference_Schedule.pdf", dir: false },
  ],
  Pictures: [
    { name: "Screenshots", dir: true },
    { name: "Photos", dir: true },
    { name: "wallpaper.png", dir: false },
    { name: "logo.svg", dir: false },
  ],
  Screenshots: [
    { name: "Screenshot 2025-10-12.png", dir: false },
    { name: "Screenshot 2025-10-18.png", dir: false },
    { name: "Screenshot 2025-10-21.png", dir: false },
  ],
  Photos: [
    { name: "vacation_photo_001.jpg", dir: false },
    { name: "vacation_photo_002.jpg", dir: false },
    { name: "profile-photo.jpg", dir: false },
    { name: "sunset_beach.jpg", dir: false },
  ],
  Projects: [
    { name: "better-search", dir: true },
    { name: "portfolio-site", dir: true },
    { name: "scraper.py", dir: false },
  ],
  "better-search": [
    { name: "App.tsx", dir: false },
    { name: "main.go", dir: false },
    { name: "search.rs", dir: false },
    { name: "package.json", dir: false },
    { name: "schema.sql", dir: false },
    { name: "README.md", dir: false },
  ],
  "portfolio-site": [
    { name: "index.html", dir: false },
    { name: "styles.css", dir: false },
    { name: "index.ts", dir: false },
    { name: "design-mockup.png", dir: false },
    { name: "config.yml", dir: false },
  ],
  Music: [
    { name: "playlist_focus.mp3", dir: false },
    { name: "podcast_episode_12.mp3", dir: false },
    { name: "voice_memo_idea.m4a", dir: false },
  ],
  Videos: [
    { name: "Project_Demo.mp4", dir: false },
    { name: "screen_recording_oct.mp4", dir: false },
    { name: "birthday_2024.mov", dir: false },
  ],
};

export const MOCK_TEXT = TEXT;
export const MOCK_PAGES = PAGES;
export const MOCK_FOLDERS = FOLDERS;
