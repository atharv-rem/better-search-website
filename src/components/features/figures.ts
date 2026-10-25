import { iso } from './iso';

// Each figure is drawn into a 340x190 box: hairline in near-black, with Vercel blue
// only on whatever is live. Animations are CSS and loop forever; the per-figure
// `css` holds only keyframes that depend on the figure's own numbers.
// Centre the drawing on (cx, cy) and scale it to fill the cell.
const fit = (svg: string, cx: number, cy: number, s: number) =>
	`<g transform="translate(170 95) scale(${s}) translate(${-cx} ${-cy})">${svg}</g>`;

export interface Figure {
	svg: string;
	css: string;
}

// ~10 - 17mb: a memory bank where only a few cells are ever lit.
function memory(): Figure {
	const k = iso(126.75, 40.5);
	const W = 168;
	const D = 68;
	const H = 9;

	let cells = '';
	let lit = '';
	let trail = '';
	for (let r = 0; r < 4; r++) {
		for (let c = 0; c < 8; c++) {
			const i = r * 8 + c;
			const x = 8 + c * 19.5;
			const y = 9 + r * 14;
			cells += `<rect class="d" x="${x}" y="${y}" width="15" height="11" rx="1.5"/>`;
			// A scattered order, so the lit cells wander instead of sweeping.
			const delay = -(((i * 13) % 32) * 0.3).toFixed(1);
			lit += `<rect class="fg-mem" style="animation-delay:${delay}s" x="${x}" y="${y}" width="15" height="11" rx="1.5"/>`;
			trail += `<rect class="fg-trail" style="--d:${((r + c) * 0.06).toFixed(2)}s" x="${x}" y="${y}" width="15" height="11" rx="1.5"/>`;
		}
	}

	const svg =
		k.box(0, 0, 0, W, D, H) +
		`<g transform="${k.TOP(0, 0, H)}">${cells}</g>` +
		`<g class="glow"><g transform="${k.TOP(0, 0, H)}">${lit}${trail}</g></g>` +
		`<g transform="${k.FRONT(0, D, H)}"><path class="d" d="${k.slits(4, W - 4, 4, 4.5, 9)}"/></g>` +
		`<g transform="${k.FRONT(0, D + 14, 0)}">` +
		`<path class="d" d="M0 0H${W}M0 -3V3M${W} -3V3"/>` +
		`<text class="t" x="${W / 2}" y="13" text-anchor="middle">~10 - 17mb</text></g>`;

	const css = `
.fg-mem{fill:var(--fg-acc);opacity:0;animation:fg-mem 9.6s linear infinite}
@keyframes fg-mem{0%,100%{opacity:0}2%,9%{opacity:1}11%{opacity:0}}
.fg-trail{fill:var(--fg-acc);opacity:0;transition:opacity 1.6s ease-out}
.fg-trail:hover{opacity:1;transition:none}
.fg-host.fg-click .fg-trail{animation:fg-surge 1.5s ease-out both;animation-delay:var(--d)}
@keyframes fg-surge{0%{opacity:0}25%,55%{opacity:1}100%{opacity:0}}
@media (prefers-reduced-motion:reduce){.fg-mem:nth-child(9n+1){opacity:1}}`;
	return { svg: fit(svg, 170, 105, 1.2), css };
}

// indexes once and never touches the disk again: one pulse disk -> memory, then the disk goes dark.
function indexOnce(): Figure {
	const k = iso(120, 43);
	const wire = `M${k.P(64, 28, 0).join(' ')}L${k.P(132, 28, 0).join(' ')}`;

	let cells = '';
	let all = '';
	let css = '';
	for (let c = 0; c < 3; c++) {
		for (let r = 0; r < 3; r++) {
			const i = r * 3 + c;
			const a = 26 + i * 5;
			cells += `<rect class="fg-c${i}" x="${4 + c * 16}" y="${4 + r * 13}" width="12" height="10" rx="1.5"/>`;
			all += `<rect class="fg-all" style="--d:${(i * 0.05).toFixed(2)}s" x="${4 + c * 16}" y="${4 + r * 13}" width="12" height="10" rx="1.5"/>`;
			css += `.fg-c${i}{fill:var(--fg-acc);opacity:0;animation:fg-c${i} 8s linear infinite}`;
			css += `@keyframes fg-c${i}{0%,${a}%{opacity:0}${a + 2}%,94%{opacity:1}98%,100%{opacity:0}}`;
		}
	}

	const [dlx, dly] = k.P(32, 56, 0);
	const [clx, cly] = k.P(158, 56, 0);

	const svg =
		`<g class="fg-hot">` +
		k.box(0, 0, 0, 64, 56, 16) +
		`<g transform="${k.TOP(0, 0, 16)}">` +
		`<circle class="d" cx="32" cy="28" r="21"/><circle class="d" cx="32" cy="28" r="6"/>` +
		`<g class="glow"><circle class="fg-spin" cx="32" cy="28" r="13.5"/></g>` +
		`<path class="k" d="M54 8L37 24"/><circle class="k" cx="54" cy="8" r="2.5"/></g>` +
		`<g transform="${k.FRONT(0, 56, 16)}"><path class="d" d="${k.slits(8, 36, 4, 5, 12)}"/>` +
		`<rect class="f" x="50" y="6" width="8" height="3" rx="1"/>` +
		`<g class="glow"><rect class="fg-led" x="50" y="6" width="8" height="3" rx="1"/></g></g>` +
		`<text class="t fg-lab" x="${dlx}" y="${dly + 14}" text-anchor="middle">disk: idle</text></g>` +
		`<path class="d" d="${wire}"/>` +
		`<g class="glow"><path class="fg-pulse" pathLength="100" d="${wire}"/></g>` +
		`<g class="fg-hot">` +
		k.box(132, 12, 0, 52, 44, 7) +
		`<g class="glow"><g transform="${k.TOP(132, 12, 7)}">${cells}${all}</g></g>` +
		`<g transform="${k.FRONT(132, 56, 7)}"><path class="d" d="${k.slits(4, 48, 4, 2, 7)}"/></g>` +
		`<g transform="${k.SIDE(184, 56, 7)}"><path class="d" d="${k.slits(4, 40, 4, 2, 7)}"/></g>` +
		`<text class="t fg-lab" x="${clx}" y="${cly + 14}" text-anchor="middle">served from memory</text></g>`;

	css += `
.fg-all{fill:var(--fg-acc);opacity:0;transition:opacity .25s}
.fg-hot:hover .fg-all{opacity:1}
.fg-lab{opacity:0;transition:opacity .2s}
.fg-hot:hover .fg-lab{opacity:1}
.fg-host.fg-click .fg-pulse{animation:fg-pulse1 1.2s linear both}
.fg-host.fg-click .fg-spin{animation:fg-spin1 1.2s linear both}
.fg-host.fg-click .fg-led{animation:fg-led1 1.2s linear both}
.fg-host.fg-click .fg-all{animation:fg-allin 1.7s both;animation-delay:var(--d)}
@keyframes fg-pulse1{0%{stroke-dashoffset:12}100%{stroke-dashoffset:-100}}
@keyframes fg-spin1{0%{opacity:1;transform:rotate(0)}70%{opacity:1;transform:rotate(540deg)}100%{opacity:0;transform:rotate(700deg)}}
@keyframes fg-led1{0%,55%{opacity:1}65%,100%{opacity:0}}
@keyframes fg-allin{0%,40%{opacity:0}55%,85%{opacity:1}100%{opacity:0}}
.fg-spin{fill:none;stroke:var(--fg-acc);stroke-width:1.6;stroke-dasharray:7 7.5;transform-box:fill-box;transform-origin:center;opacity:0;animation:fg-spin 8s linear infinite}
@keyframes fg-spin{0%{opacity:0;transform:rotate(0)}2%{opacity:1}25%{opacity:1;transform:rotate(900deg)}30%,100%{opacity:0;transform:rotate(1000deg)}}
.fg-led{fill:var(--fg-acc);opacity:0;animation:fg-led 8s linear infinite}
@keyframes fg-led{0%{opacity:0}2%,25%{opacity:1}28%,100%{opacity:0}}
.fg-pulse{fill:none;stroke:var(--fg-acc);stroke-width:2.2;stroke-linecap:round;vector-effect:none;stroke-dasharray:12 100;stroke-dashoffset:12;animation:fg-pulse 8s linear infinite}
@keyframes fg-pulse{0%{stroke-dashoffset:12}25%,100%{stroke-dashoffset:-100}}
@media (prefers-reduced-motion:reduce){.fg-c0,.fg-c1,.fg-c3,.fg-c4,.fg-c6{opacity:1}}`;
	return { svg: fit(svg, 170, 95, 1.3), css };
}

// 2 million file records indexed in ~10s: files stream into an index that fills as the counter climbs.
function records(): Figure {
	const k = iso(120, 40);
	const RING = 2 * Math.PI * 9;

	let stack = '';
	const off = [0, 2, -1, 1];
	for (let i = 0; i < 4; i++) stack += k.box(off[i], 0, i * 3, 40, 52, 2.4);
	stack += `<g transform="${k.TOP(1, 0, 11.4)}"><path class="d" d="M6 10H34M6 18H34M6 26H24M6 34H30"/></g>`;

	// Three lanes, two files each, half a cycle apart.
	let tiles = '';
	for (let i = 0; i < 6; i++) {
		const y = [6, 22, 38][i % 3];
		tiles += `<g class="fg-tile" style="animation-delay:-${(i * 0.667).toFixed(2)}s">${k.box(46, y, 0, 12, 12, 2.5, 'a')}</g>`;
	}
	// Extra files that only pour in while the cell is hovered.
	for (let i = 0; i < 9; i++) {
		const y = [4, 16, 28, 40][i % 4];
		tiles += `<g class="fg-tile-x" style="animation-delay:-${(i * 0.178).toFixed(2)}s">${k.box(46, y, 0, 10, 10, 2.5, 'a')}</g>`;
	}

	let rows = '';
	for (let y = 8; y < 62; y += 8) rows += `M3 ${y}H53`;
	let rowsSide = '';
	for (let y = 8; y < 62; y += 8) rowsSide += `M3 ${y}H69`;

	const svg =
		`<circle class="d" cx="18" cy="22" r="9"/>` +
		`<g class="glow"><circle class="fg-ring" cx="18" cy="22" r="9" transform="rotate(-90 18 22)" stroke-dasharray="${RING.toFixed(2)}"/></g>` +
		`<text class="n" data-fg-count x="34" y="22">0</text><text class="t" x="34" y="33">records</text>` +
		stack +
		tiles +
		k.box(112, 0, 0, 56, 72, 66) +
		`<g class="glow">` +
		`<g transform="${k.FRONT(112, 72, 66)}"><rect class="fg-fill" x="3" y="3" width="50" height="60"/></g>` +
		`<g transform="${k.SIDE(168, 72, 66)}"><rect class="fg-fill" x="3" y="3" width="66" height="60"/></g>` +
		`<g transform="${k.TOP(112, 0, 66)}"><rect class="fg-cap" x="3" y="3" width="50" height="66"/></g></g>` +
		`<g transform="${k.FRONT(112, 72, 66)}"><path class="w" d="${rows}"/></g>` +
		`<g transform="${k.SIDE(168, 72, 66)}"><path class="w" d="${rowsSide}"/></g>`;

	const css = `
.fg-tile{opacity:0;animation:fg-tile 4s linear infinite}
@keyframes fg-tile{0%{opacity:0;transform:translate(0,0)}8%{opacity:1}80%{opacity:1;transform:translate(53.7px,31px)}86%,100%{opacity:0;transform:translate(57px,32.9px)}}
.fg-host.fg-click .fg-fill{animation:fg-fillfast 1.4s linear both}
.fg-host.fg-click .fg-cap{animation:fg-capfast 1.4s linear both}
.fg-host.fg-click .fg-ring{animation:fg-ringfast 1.4s linear both}
@keyframes fg-fillfast{0%{transform:scaleY(0);opacity:1}90%{transform:scaleY(1);opacity:1}100%{transform:scaleY(1);opacity:0}}
@keyframes fg-capfast{0%,88%{opacity:0}92%,96%{opacity:1}100%{opacity:0}}
@keyframes fg-ringfast{0%{stroke-dashoffset:${RING.toFixed(2)};opacity:1}90%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}
.fg-tile-x{opacity:0}
.fg-host:hover .fg-tile-x{animation:fg-tile 1.6s linear infinite}
.fg-fill,.fg-cap{fill:var(--fg-acc)}
.fg-fill{transform-box:fill-box;transform-origin:50% 100%;animation:fg-fill 10s linear infinite}
@keyframes fg-fill{0%{transform:scaleY(0);opacity:1}90%,97%{transform:scaleY(1);opacity:1}100%{transform:scaleY(1);opacity:0}}
.fg-cap{opacity:0;animation:fg-cap 10s linear infinite}
@keyframes fg-cap{0%,89%{opacity:0}91%,97%{opacity:1}100%{opacity:0}}
.fg-ring{fill:none;stroke:var(--fg-acc);stroke-width:2;stroke-linecap:round;stroke-dashoffset:${RING.toFixed(2)};animation:fg-ring 10s linear infinite}
@keyframes fg-ring{0%{stroke-dashoffset:${RING.toFixed(2)};opacity:1}90%,97%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}
@media (prefers-reduced-motion:reduce){.fg-fill{transform:scaleY(.6)}.fg-ring{stroke-dashoffset:${(RING * 0.4).toFixed(2)}}}`;
	return { svg: fit(svg, 138, 86, 1.2), css };
}

// private and local: a lock inside a glass box; the signal stops at the wall.
function privateLocal(): Figure {
	const k = iso(116, 80);
	const X = 100;
	const Y = 80;
	const Z = 60;

	const hidden = [
		k.line([0, 0, 0], [X, 0, 0], 'dd'),
		k.line([0, 0, 0], [0, Y, 0], 'dd'),
		k.line([0, 0, 0], [0, 0, Z], 'dd'),
	].join('');
	const shell = [
		[[X, 0, 0], [X, Y, 0]],
		[[0, Y, 0], [X, Y, 0]],
		[[X, 0, 0], [X, 0, Z]],
		[[X, Y, 0], [X, Y, Z]],
		[[0, Y, 0], [0, Y, Z]],
		[[0, 0, Z], [X, 0, Z]],
		[[X, 0, Z], [X, Y, Z]],
		[[X, Y, Z], [0, Y, Z]],
		[[0, Y, Z], [0, 0, Z]],
	]
		.map(([a, b]) => k.line(a as [number, number, number], b as [number, number, number], 'k fg-shell'))
		.join('');

	const inner = `M${k.P(76, 25, 34).join(' ')}L${k.P(100, 25, 34).join(' ')}`;
	const outer = `M${k.P(108, 25, 34).join(' ')}L${k.P(160, 25, 34).join(' ')}`;
	const [wx, wy] = k.P(100, 25, 34);
	const [lx, ly] = k.P(50, 25, 17.5);
	const outerBack = `M${k.P(160, 25, 34).join(' ')}L${k.P(108, 25, 34).join(' ')}`;
	const [gx, gy] = [k.P(160, 25, 34)[0] + 22, k.P(160, 25, 34)[1]];

	const laptop =
		k.box(24, 22, 0, 52, 38, 3) +
		`<g transform="${k.TOP(24, 22, 3)}"><path class="d" stroke-dasharray="2.5 2" d="M5 10H47M5 16H47M5 22H47"/><rect class="d" x="19" y="28" width="14" height="7" rx="1"/></g>` +
		k.box(24, 22, 3, 52, 3, 34) +
		`<g transform="${k.FRONT(24, 25, 37)}"><g class="fg-lock glow">` +
		`<rect x="20" y="15" width="12" height="10" rx="1.8" fill="var(--fg-acc)"/>` +
		`<path d="M22.5 15V11.5a3.5 3.5 0 0 1 7 0V15" fill="none" stroke="var(--fg-acc)" stroke-width="1.8" stroke-linecap="round" vector-effect="none"/>` +
		`<circle cx="26" cy="19.5" r="1.4" style="fill:var(--fg-paper)"/></g></g>`;

	const svg =
		hidden +
		laptop +
		shell +
		`<g class="glow"><circle class="fg-lockring" cx="${lx}" cy="${ly}" r="6"/></g>` +
		`<path class="d" d="${inner}"/>` +
		`<g class="glow"><path class="fg-ping" pathLength="100" d="${inner}"/></g>` +
		`<path class="d" stroke-dasharray="3 3" d="${outer}"/>` +
		`<path class="d" stroke-dasharray="3 3" d="${outerBack}"/>` +
		`<g class="d"><circle cx="${gx}" cy="${gy}" r="17"/><ellipse cx="${gx}" cy="${gy}" rx="7" ry="17"/>` +
		`<path d="M${gx - 17} ${gy}H${gx + 17}M${gx - 14.5} ${gy - 8.5}H${gx + 14.5}M${gx - 14.5} ${gy + 8.5}H${gx + 14.5}"/></g>` +
		`<g><path class="fg-in" pathLength="100" d="${outerBack}"/></g>` +
		`<g class="fg-x"><path class="k" stroke-width="1.6" d="M${wx - 4.5} ${wy - 4.5}l9 9m0 -9l-9 9"/></g>`;

	const css = `
.fg-lock{animation:fg-lock 3.6s ease-in-out infinite}
@keyframes fg-lock{0%,100%{opacity:.6}50%{opacity:1}}
.fg-ping{fill:none;stroke:var(--fg-acc);stroke-width:2.4;stroke-linecap:round;vector-effect:none;stroke-dasharray:10 100;stroke-dashoffset:10;animation:fg-ping 3.6s linear infinite}
@keyframes fg-ping{0%{stroke-dashoffset:10}34%,100%{stroke-dashoffset:-100}}
.fg-x{transform-box:fill-box;transform-origin:center;opacity:.35;animation:fg-x 3.6s ease-out infinite}
@keyframes fg-xhit{0%,55%{opacity:.35;transform:scale(1)}65%{opacity:1;transform:scale(1.7)}85%{opacity:1;transform:scale(1)}100%{opacity:.35;transform:scale(1)}}
.fg .fg-shell{transition:stroke .3s}
.fg-host:hover .fg .fg-shell{stroke:var(--fg-acc)}
.fg-in{fill:none;stroke:var(--fg-ink);stroke-width:2;stroke-linecap:round;vector-effect:none;stroke-dasharray:10 100;stroke-dashoffset:10;opacity:0}
.fg-host:hover .fg-in{opacity:1;animation:fg-pingf 1.4s linear infinite}
@keyframes fg-pingf{0%{stroke-dashoffset:10}60%,100%{stroke-dashoffset:-100}}
.fg-lockring{fill:none;stroke:var(--fg-acc);stroke-width:1.5;opacity:0;transform-box:fill-box;transform-origin:center}
.fg-host.fg-click .fg-lockring{animation:fg-lring .9s ease-out 2}
@keyframes fg-lring{0%{opacity:.9;transform:scale(.6)}100%{opacity:0;transform:scale(4)}}
.fg-host.fg-click .fg-lock{animation:fg-lockpop .7s ease-out;transform-box:fill-box;transform-origin:center}
@keyframes fg-lockpop{0%{transform:scale(1)}30%{transform:scale(1.5)}100%{transform:scale(1)}}
.fg-host.fg-click .fg .fg-shell{animation:fg-shellflash 1.3s ease-out}
@keyframes fg-shellflash{0%{stroke:var(--fg-acc);stroke-width:3}100%{stroke-width:1}}
.fg-host.fg-click .fg-in{opacity:1;animation:fg-pingf .5s linear 3}
.fg-host.fg-click .fg-x{animation:fg-xhit .5s ease-out 3}
.fg-host:hover .fg-x{animation:fg-xhit 1.4s ease-out infinite}
@keyframes fg-x{0%,30%{opacity:.35;transform:scale(1)}36%{opacity:1;transform:scale(1.5)}52%{opacity:1;transform:scale(1)}72%,100%{opacity:.35;transform:scale(1)}}`;
	return { svg: fit(svg, 158, 95, 1.2), css };
}

// 0% idle CPU use: a dark chip, one slow standby dot, and a meter that never moves.
function idleCpu(): Figure {
	const k = iso(147.5, 50.5);

	const svg =
		k.box(0, 0, 0, 70, 70, 8) +
		`<g transform="${k.TOP(0, 0, 8)}">` +
		`<rect class="d" x="14" y="14" width="42" height="42" rx="3"/><path class="d" d="M6 6h8l-8 8z"/>` +
		`<g class="glow"><rect class="fg-die" x="14" y="14" width="42" height="42" rx="3"/>` +
		`<circle class="fg-ripple" cx="35" cy="35" r="4"/><circle class="fg-standby" cx="35" cy="35" r="3.5"/>` +
		[0, 0.2, 0.4].map((d) => `<circle class="fg-wave" style="--d:${d}s" cx="35" cy="35" r="5"/>`).join('') +
		`</g></g>` +
		`<g transform="${k.FRONT(0, 70, 8)}"><path class="d" d="${k.slits(5, 65, 5, 2, 8)}"/></g>` +
		`<g transform="${k.SIDE(70, 70, 8)}"><path class="d" d="${k.slits(5, 65, 5, 2, 8)}"/></g>` +
		k.box(100, 34, 0, 58, 5, 44) +
		`<g transform="${k.FRONT(100, 39, 44)}">` +
		`<text class="t" x="6" y="11">cpu</text>` +
		`<g class="glow-soft"><text class="big fg-b0" x="6" y="30">0%</text><text class="big fg-b3" x="6" y="30">3%</text><text class="big fg-b100" x="6" y="30">100%</text>` +
		`<path class="fg-flat" d="M5 38H53"/><path class="fg-spike" d="M5 38H20L25 21L30 40L34 38H53"/><path class="fg-spike2" d="M5 38H13L18 15L25 42L31 20L36 38H53"/></g></g>`;

	const css = `
.fg-standby{fill:var(--fg-acc);animation:fg-standby 4s ease-in-out infinite}
@keyframes fg-standby{0%,100%{opacity:.3}50%{opacity:1}}
.fg-ripple{fill:none;stroke:var(--fg-acc);stroke-width:1;transform-box:fill-box;transform-origin:center;opacity:0;animation:fg-ripple 4s ease-out infinite}
@keyframes fg-ripple{0%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(3.2)}}
.fg-die{fill:var(--fg-acc);opacity:0}
.fg-flat{fill:none;stroke:var(--fg-acc);stroke-width:1.4;stroke-dasharray:2 3;animation:fg-flat 1.2s linear infinite}
@keyframes fg-flat{to{stroke-dashoffset:-5}}
.fg-spike{fill:none;stroke:var(--fg-acc);stroke-width:1.4;stroke-linejoin:round;opacity:0}
.fg-b3,.fg-b100{opacity:0}
.fg-wave{fill:none;stroke:var(--fg-acc);stroke-width:1.5;opacity:0;transform-box:fill-box;transform-origin:center}
.fg-spike2{fill:none;stroke:var(--fg-acc);stroke-width:1.4;stroke-linejoin:round;opacity:0}
.fg-host.fg-click .fg-wave{animation:fg-wave 1.2s ease-out forwards;animation-delay:var(--d)}
.fg-host.fg-click .fg-b0{animation:fg-b0k 1.6s ease-out}
.fg-host.fg-click .fg-b3{animation:none}
.fg-host.fg-click .fg-b100{animation:fg-b100k 1.6s ease-out}
.fg-host.fg-click .fg-spike{animation:none}
.fg-host.fg-click .fg-spike2{animation:fg-b100k 1.6s ease-out}
.fg-host.fg-click .fg-die{animation:fg-diewake 1.6s ease-out}
@keyframes fg-wave{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(7)}}
@keyframes fg-b0k{0%,100%{opacity:1}10%,70%{opacity:0}}
@keyframes fg-b100k{0%,100%{opacity:0}10%,70%{opacity:1}}
@keyframes fg-diewake{0%,100%{opacity:0}10%,55%{opacity:.55}}
.fg-host:hover .fg-b0{animation:fg-b0 1.4s ease-out}
.fg-host:hover .fg-b3{animation:fg-b3 1.4s ease-out}
@keyframes fg-b0{0%,100%{opacity:1}10%,60%{opacity:0}}
@keyframes fg-b3{0%,100%{opacity:0}10%,60%{opacity:1}}
.fg-host:hover .fg-spike{animation:fg-blip 1.4s ease-out}
.fg-host:hover .fg-die{animation:fg-dieblip 1.4s ease-out}
@keyframes fg-blip{0%,100%{opacity:0}10%,60%{opacity:1}}
@keyframes fg-dieblip{0%,100%{opacity:0}10%,50%{opacity:.35}}
@media (prefers-reduced-motion:reduce){.fg-standby{opacity:1}}`;
	return { svg: fit(svg, 170, 95, 1.6), css };
}

// searches in ~10 - 100ms: a lens sweeps the files and the match lights up.
function search(): Figure {
	const k = iso(134.5, 42);
	const hit = { c: 3 };

	const tile = (x: number, y: number, cls = 'f') => k.box(x, y, 0, 22, 28, 3, cls);
	const mark = (x: number, y: number) =>
		`<g transform="${k.TOP(x, y, 3)}"><path class="d" d="M5 9H17M5 14H17M5 19H12"/></g>`;

	let back = '';
	let front = '';
	let hl = '';
	let css = '';
	for (let c = 0; c < 5; c++) {
		back += `<g class="fg-col fg-col${c}">${tile(32 * c, 0) + mark(32 * c, 0)}</g>`;
		front += `<g class="fg-col fg-col${c}">${tile(32 * c, 40) + mark(32 * c, 40)}</g>`;
		hl += `<g class="fg-hl fg-hl${c}">${tile(32 * c, 0, 'a')}<g transform="${k.TOP(32 * c, 0, 3)}"><path class="w" d="M5 9H17M5 14H17M5 19H12"/></g></g>`;
		css += `.fg-host:has(.fg-col${c}:hover) .fg-lens{transform:translate(${(32 * c * 0.866).toFixed(1)}px,${16 * c}px)}`;
		css += `.fg-host:has(.fg-col${c}:hover) .fg-hl${c}{opacity:1}`;
		css += `.fg-host.fg-click:has(.fg-col${c}:hover) .fg-hl${c}{animation:fg-pop .7s ease-out}`;
	}

	const [dx, dy] = [96 * 0.866, 96 * 0.5];
	const lens =
		`<g class="fg-lens">` +
		`<path class="d" stroke-dasharray="2 2" d="M${k.P(11, 14, 16).join(' ')}L${k.P(11, 14, 3).join(' ')}"/>` +
		`<g transform="${k.TOP(0, 0, 16)}"><path class="k" stroke-width="2.6" stroke-linecap="round" vector-effect="none" d="M19.5 22.5L28 31"/>` +
		`<circle class="lens" cx="11" cy="14" r="12"/></g></g>`;

	const svg =
		`<g transform="translate(0 0)">` +
		`<circle class="d" cx="22" cy="22" r="11"/>` +
		`<circle class="fg-watch" cx="22" cy="22" r="11" pathLength="100" transform="rotate(-90 22 22)"/>` +
		`<path class="k" d="M22 8V11M19 7H25"/>` +
		`<text class="n" x="40" y="26">~10 - 100ms</text></g>` +
		back +
		`<g class="fg-hit glow">${tile(32 * hit.c, 0, 'a')}<g transform="${k.TOP(32 * hit.c, 0, 3)}"><path class="w" d="M5 9H17M5 14H17M5 19H12"/></g></g>` +
		`<g class="glow">${hl}</g>` +
		front +
		lens;

	css += `
.fg-hl{opacity:0;transition:opacity .25s}
@keyframes fg-pop{0%{transform:translateY(0)}35%{transform:translateY(-8px)}100%{transform:translateY(0)}}
.fg-host.fg-click:not(:has(.fg-col:hover)) .fg-lens{animation:fg-lens1 1s cubic-bezier(.4,0,.2,1) both}
.fg-host.fg-click:not(:has(.fg-col:hover)) .fg-hit{animation:fg-hit1 1.9s linear both}
.fg-host.fg-click:not(:has(.fg-col:hover)) .fg-watch{animation:fg-watch1 1.2s ease-out both}
@keyframes fg-lens1{0%{transform:translate(0,0)}70%,100%{transform:translate(${dx.toFixed(1)}px,${dy}px)}}
@keyframes fg-hit1{0%,62%{opacity:0}70%,90%{opacity:1}100%{opacity:0}}
@keyframes fg-watch1{0%{stroke-dasharray:0.01 100;opacity:1}70%,90%{stroke-dasharray:11 100;opacity:1}100%{stroke-dasharray:11 100;opacity:0}}
.fg-lens{pointer-events:none;transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.fg-host:has(.fg-col:hover) :is(.fg-lens,.fg-hit,.fg-watch){animation:none}
.fg-host:has(.fg-col:hover) .fg-watch{stroke-dasharray:11 100}
.lens{fill:rgb(255 255 255 / .55);stroke:var(--fg-ink);stroke-width:1.4}
.fg-lens{animation:fg-lens 3.6s ease-in-out infinite}
@keyframes fg-lens{0%,8%{transform:translate(0,0)}55%,85%{transform:translate(${dx.toFixed(1)}px,${dy}px)}100%{transform:translate(0,0)}}
.fg-hit{opacity:0;animation:fg-hit 3.6s linear infinite}
@keyframes fg-hit{0%,53%{opacity:0}58%,88%{opacity:1}96%,100%{opacity:0}}
.fg-watch{fill:none;stroke:var(--fg-acc);stroke-width:2.2;stroke-linecap:round;vector-effect:none;stroke-dasharray:0.01 100;animation:fg-watch 3.6s ease-in-out infinite}
@keyframes fg-watch{0%,8%{stroke-dasharray:0.01 100;opacity:1}55%,88%{stroke-dasharray:11 100;opacity:1}100%{stroke-dasharray:11 100;opacity:0}}
@media (prefers-reduced-motion:reduce){.fg-hit{opacity:1}.fg-watch{stroke-dasharray:11 100}}`;
	return { svg: fit(svg, 138, 81, 1.25), css };
}

export const figures = {
	memory: memory(),
	indexOnce: indexOnce(),
	records: records(),
	privateLocal: privateLocal(),
	idleCpu: idleCpu(),
	search: search(),
} satisfies Record<string, Figure>;

export type FigureName = keyof typeof figures;
