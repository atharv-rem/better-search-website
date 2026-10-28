import fish from '../../assets/app-icon-fish.png';
import { cloud, flame, frame, gear } from './app-icons';
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

// alt + s, instant opening: a minimal full keyboard where only Alt and S are lit. They press in a loop (Alt, a pulse across, then S and a ring); hover holds them down and a click replays it.
function altS(): Figure {
	const k = iso(0, 0);
	const U = 15; // key pitch
	const M = 5; // case margin
	const Z = 4; // case height
	const H = 5; // key height
	const KD = U - 2; // key depth
	const W = 15 * U + 2 * M;
	const D = 5 * U + 2 * M;

	// Key widths per row, in units of the pitch. Each row adds up to 15.
	const rows: number[][] = [
		[...Array(13).fill(1), 2],
		[1.5, ...Array(12).fill(1), 1.5],
		[1.75, ...Array(11).fill(1), 2.25],
		[2.25, ...Array(10).fill(1), 2.75],
		[1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25],
	];
	// Alt is the third key on the bottom row, S the third on the home row.
	const lit: Record<string, { id: string; label: string }> = {
		'2,2': { id: 's', label: 'S' },
		'4,2': { id: 'a', label: 'Alt' },
	};

	let keys = '';
	let litKeys = '';
	const pos: Record<string, { x: number; y: number; w: number }> = {};
	rows.forEach((widths, r) => {
		let u = 0;
		widths.forEach((w, c) => {
			const x = M + u * U;
			const y = M + r * U;
			const kw = w * U - 2;
			u += w;
			const hot = lit[`${r},${c}`];
			if (!hot) {
				keys += k.box(x, y, Z, kw, KD, H, 'fg-as-p');
				return;
			}
			pos[hot.id] = { x, y, w: kw };
			// Lit keys are drawn last so the glow is never covered by a neighbour.
			litKeys +=
				`<g class="fg-as-key fg-as-k${hot.id}"><g class="glow">` +
				k.box(x, y, Z, kw, KD, H, 'a') +
				`<g transform="${k.TOP(x, y, Z + H)}"><text class="t" style="fill:#fff" x="${kw / 2}" y="${KD / 2 + 3}" text-anchor="middle">${hot.label}</text></g>` +
				`</g></g>`;
		});
	});

	const centre = ({ x, y, w }: { x: number; y: number; w: number }) => k.P(x + w / 2, y + KD / 2, Z + H + 0.5);
	const [ax, ay] = centre(pos.a);
	const [sx, sy] = centre(pos.s);
	const link = `M${ax} ${ay}L${sx} ${sy}`;

	const svg =
		k.box(0, 0, 0, W, D, Z, 'fg-as-p') +
		keys +
		`<g class="glow"><path class="fg-as-pulse" pathLength="100" d="${link}"/></g>` +
		litKeys +
		`<g class="glow"><g transform="${k.TOP(pos.s.x, pos.s.y, Z + H)}"><circle class="fg-as-ring" cx="${pos.s.w / 2}" cy="${KD / 2}" r="7"/></g></g>`;

	const css = `
.fg .fg-as-p{fill:var(--fg-paper);stroke:var(--fg-dim);stroke-width:1;stroke-linejoin:round}
.fg-as-key{cursor:pointer;transition:transform .12s ease-out}
.fg-as-ka{animation:fg-as-dnA 3.6s ease-in-out infinite}
.fg-as-ks{animation:fg-as-dnS 3.6s ease-in-out infinite}
.fg-as-pulse{fill:none;stroke:var(--fg-acc);stroke-width:2.2;stroke-linecap:round;vector-effect:none;stroke-dasharray:8 100;stroke-dashoffset:8;animation:fg-as-pulse 3.6s linear infinite}
.fg-as-ring{fill:none;stroke:var(--fg-acc);stroke-width:1.6;transform-box:fill-box;transform-origin:center;opacity:0;animation:fg-as-ring 3.6s ease-out infinite}
@keyframes fg-as-dnA{0%,10%{transform:translateY(0)}13%,62%{transform:translateY(3px)}68%,100%{transform:translateY(0)}}
@keyframes fg-as-dnS{0%,26%{transform:translateY(0)}29%,64%{transform:translateY(3px)}70%,100%{transform:translateY(0)}}
@keyframes fg-as-pulse{0%,14%{stroke-dashoffset:8}26%,100%{stroke-dashoffset:-100}}
@keyframes fg-as-ring{0%,26%{opacity:0;transform:scale(1)}28%{opacity:.9;transform:scale(1)}52%,100%{opacity:0;transform:scale(3.4)}}
.fg-host:hover .fg-as-key{animation:none;transform:translateY(3px)}
.fg-host.fg-click .fg-as-key{animation:fg-as-dn1 .9s ease-in-out both}
.fg-host.fg-click .fg-as-ks{animation-delay:.45s}
.fg-host.fg-click .fg-as-pulse{animation:fg-as-pulse1 .4s linear .1s both}
.fg-host.fg-click .fg-as-ring{animation:fg-as-ring1 .9s ease-out .45s forwards}
@keyframes fg-as-dn1{0%,100%{transform:translateY(0)}10%,70%{transform:translateY(3px)}}
@keyframes fg-as-pulse1{0%{stroke-dashoffset:8}100%{stroke-dashoffset:-100}}
@keyframes fg-as-ring1{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(3.4)}}`;
	return { svg: fit(svg, 65, 75, 1.0), css };
}

// alt + w, snap opening: translucent windows snap into place one after another, then the cursor clicks across them.
function snapOpen(): Figure {
	// [x, y, fill-opacity], back to front.
	const wins = [
		[58, 72, 0.88],
		[115, 35, 0.94],
		[187, 55, 0.57],
		[139, 92, 0.74],
	] as const;

	let svg = '';
	let css = '';
	wins.forEach(([x, y, o], i) => {
		const a = i * 8;
		svg +=
			`<g class="fg-win fg-win${i}" style="--d:${(i * 0.12).toFixed(2)}s">` +
			`<rect x="${x}" y="${y}" width="96" height="66" rx="5" style="fill:var(--fg-win,var(--fg-paper));stroke:var(--fg-faint)" fill-opacity="${o}"/>` +
			`<path fill="var(--fg-acc)" stroke="none" d="M${x} ${y + 5}C${x} ${y + 2.76} ${x + 2.24} ${y} ${x + 5} ${y}H${x + 91}C${x + 93.76} ${y} ${x + 96} ${y + 2.76} ${x + 96} ${y + 5}V${y + 8}H${x}V${y + 5}Z"/>` +
			[5.5, 10.5, 15.5].map((dx) => `<circle cx="${x + dx}" cy="${y + 4.5}" r="1.5" fill="#fff" stroke="none"/>`).join('') +
			`</g>`;
		css += `.fg-win${i}{animation:fg-win${i} 6s cubic-bezier(.2,.8,.2,1) infinite}`;
		css += `@keyframes fg-win${i}{0%,${a}%{opacity:0;transform:translateY(8px) scale(.9)}${a + 6}%,90%{opacity:1;transform:none}96%,100%{opacity:0;transform:none}}`;
	});

	svg +=
		`<path class="fg-cur" d="M184.971 160.989L192.898 158.465C193.316 158.332 193.373 157.765 192.99 157.552L176.951 148.618C176.579 148.41 176.135 148.733 176.217 149.151L179.747 167.107C179.833 167.545 180.407 167.659 180.654 167.287L184.706 161.188C184.769 161.093 184.862 161.023 184.971 160.989Z"/>`;

	css += `
.fg-win{transform-box:fill-box;transform-origin:center;filter:drop-shadow(0 4px 6px rgb(0 0 0/.08))}
.dark .fg-win{--fg-win:#303030}
.fg-cur{fill:var(--fg-ink);stroke:var(--fg-paper);stroke-width:1.5;stroke-linejoin:round;transform-box:fill-box;transform-origin:0 0;filter:drop-shadow(2px 3px 3px rgb(0 0 0/.3));animation:fg-cur 6s cubic-bezier(.4,0,.2,1) infinite}
/* The tip rests on the front window, then clicks its way across the others and back. */
@keyframes fg-cur{
0%,26%{opacity:0;transform:translate(14px,12px)}
32%,34%{opacity:1;transform:translate(0,0)}
36%{transform:translate(0,0) scale(.85)}
39%{transform:translate(0,0)}
47%{transform:translate(-86px,-39px)}
50%{transform:translate(-86px,-39px) scale(.85)}
53%{transform:translate(-86px,-39px)}
61%{transform:translate(-16px,-84px)}
64%{transform:translate(-16px,-84px) scale(.85)}
67%{transform:translate(-16px,-84px)}
75%{transform:translate(69px,-59px)}
78%{transform:translate(69px,-59px) scale(.85)}
81%{transform:translate(69px,-59px)}
89%,94%{opacity:1;transform:translate(0,0)}
98%,100%{opacity:0;transform:translate(0,0)}}
.fg-host.fg-click .fg-win{animation:fg-snap .5s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d)}
@keyframes fg-snap{0%{opacity:0;transform:translateY(8px) scale(.9)}100%{opacity:1;transform:none}}`;
	return { svg: fit(svg, 170.5, 101, 1.3), css };
}

// instant web search: a grid of files where the matches pop in, one after another, as if typed. The four marks are the providers behind web search.
function instantSearch(): Figure {
	const W = 43;
	const H = 39;
	const R = 5;

	// Tile origins from the artwork: columns 51 apart and rows 47 apart (an 8 gap), the lower row shifted half a tile.
	const row1 = [13, 63, 114, 165, 216, 267, 318];
	const row2 = [-17, 33, 84, 135, 186, 237, 288];
	// Matches in the order they light up; `icon` draws the app mark centred on the tile.
	const hits = [
		{ x: 63, y: 35, icon: `<path fill="#0143D9" fill-rule="evenodd" d="${frame}"/>` },
		{ x: 135, y: 82, icon: `<image href="${fish.src}" x="${135 + 21.5 - 12}" y="${82 + 19.5 - 12}" width="24" height="24"/>` },
		{ x: 216, y: 35, icon: `<path fill="#FA5D19" d="${flame}"/>` },
		{ x: 237, y: 82, icon: `<path transform="translate(0 3)" fill="#2563EB" d="${cloud}"/>` },
	];

	let tiles = '';
	for (const [y, xs] of [[35, row1], [82, row2]] as const) {
		for (const x of xs) tiles += `<rect class="fg-is-t" x="${x}" y="${y}" width="${W}" height="${H}" rx="${R}"/>`;
	}

	let cards = '';
	hits.forEach(({ x, y, icon }, i) => {
		cards +=
			`<g class="fg-is-hit" style="--d:${(i * 0.16).toFixed(2)}s">` +
			`<rect class="fg-is-card" x="${x + 0.25}" y="${y + 0.25}" width="${W - 0.5}" height="${H - 0.5}" rx="${R - 0.25}"/>` +
			icon +
			`</g>`;
	});

	// Rows run off both ends of the artwork, so the grid is cut to its frame.
	const svg = `<clipPath id="fg-is-clip"><rect width="341" height="190"/></clipPath><g clip-path="url(#fg-is-clip)">${tiles}${cards}</g>`;

	const css = `
.fg-is-t{fill:#f4f4f4;transition:fill .2s}
.fg-host:hover .fg-is-t{fill:#e8e8e8}
.dark .fg-is-t{fill:#1a1a1a}
.dark .fg-host:hover .fg-is-t{fill:#262626}
.fg-is-card{fill:#fff;stroke:#eaeaea;stroke-width:.5}
.dark .fg-is-card{fill:#2a2a2a;stroke:#3d3d3d}
.fg-is-hit{transform-box:fill-box;transform-origin:center;opacity:0;animation:fg-is-hit 6s cubic-bezier(.2,.8,.2,1) infinite;animation-delay:var(--d)}
.fg-is-hit .fg-is-card{animation:fg-is-ring 6s ease-out infinite;animation-delay:var(--d)}
@keyframes fg-is-hit{0%,4%{opacity:0;transform:translateY(6px) scale(.92)}10%,86%{opacity:1;transform:none}94%,100%{opacity:0;transform:none}}
@keyframes fg-is-ring{0%,4%{stroke:var(--fg-acc);stroke-width:1.2}16%,100%{stroke-width:.5}}
.fg-host:hover .fg-is-hit,.fg-host:hover .fg-is-hit .fg-is-card{animation:none}
.fg-host:hover .fg-is-hit{opacity:1}
.fg-host.fg-click .fg-is-hit{animation:fg-is-in .45s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d)}
.fg-host.fg-click .fg-is-hit .fg-is-card{animation:fg-is-flash 1s ease-out both;animation-delay:var(--d)}
@keyframes fg-is-in{0%{opacity:0;transform:translateY(6px) scale(.92)}100%{opacity:1;transform:none}}
@keyframes fg-is-flash{0%{stroke:var(--fg-acc);stroke-width:1.2}100%{stroke-width:.5}}
@media (prefers-reduced-motion:reduce){.fg-is-hit{animation:none;opacity:1}.fg-is-hit .fg-is-card{animation:none}}`;
	return { svg, css };
}

// built-in calculator: the search bar, a sum typed into it, and the answer arriving in blue just after the equals sign.
function calculator(): Figure {
	const CYCLE = 8;
	const START = 0.7; // first key, seconds into the loop
	const STEP = 0.06; // seconds between keys
	const expr = 'sqrt(1764) * (2^8 - 19) / 7 =';
	const answer = '1422';

	let chars = '';
	let keys = '';
	[...expr].forEach((ch, i) => {
		chars += `<tspan class="fg-ca-ch fg-ca-c${i}" style="--i:${i}">${ch}</tspan>`;
		// Each key has its own keyframes: all of them fade out together at the end of the loop.
		const at = (((START + i * STEP) / CYCLE) * 100).toFixed(2);
		keys += `.fg-ca-c${i}{animation-name:fg-ca${i}}@keyframes fg-ca${i}{0%,${at}%{fill-opacity:0}${(+at + 0.4).toFixed(2)}%,90%{fill-opacity:1}93%,100%{fill-opacity:0}}\n`;
	});

	// The bar as in the app: black, a text row over a row with the hint and the settings gear.
	const svg =
		`<g class="fg-ca-bar"><rect x="20" y="62" width="300" height="66" rx="12" class="fg-ca-bg"/>` +
		`<rect x="20.5" y="62.5" width="299" height="65" rx="11.5" class="fg-ca-ring"/></g>` +
		`<text class="fg-ca-t fg-ca-ph" x="32" y="86.5">what should i look for you?</text>` +
		`<text class="fg-ca-t" x="32" y="86.5">${chars}<tspan class="fg-ca-ans"> ${answer}</tspan></text>` +
		`<rect x="29" y="101" width="100" height="16" rx="5" class="fg-ca-pill"/>` +
		`<text class="fg-ca-hint" x="35" y="112"><tspan class="fg-ca-slash">/</tspan> to search the web</text>` +
		`<path class="fg-ca-gear" transform="translate(295 101) scale(${16 / 256})" d="${gear}"/>`;

	const css = `
.fg-ca-bg{fill:#fff}
.fg-ca-ring{fill:none;stroke:#000;stroke-opacity:.1}
.fg-ca-pill{fill:none;stroke:#000;stroke-opacity:.15}
.fg-ca-hint{font-size:9px;fill:#000;fill-opacity:.6}
.fg-ca-slash{fill:#0070f3;font-weight:600}
.fg-ca-gear{fill:#000;fill-opacity:.55}
.fg-ca-t{font-size:13px;fill:#262626;white-space:pre}
.dark .fg-ca-bg{fill:#000}
.dark .fg-ca-ring{stroke:#fff}
.dark .fg-ca-pill{stroke:#fff;stroke-opacity:.25}
.dark .fg-ca-hint,.dark .fg-ca-gear{fill:#fff;fill-opacity:.7}
.dark .fg-ca-slash,.dark .fg-ca-ans{fill:#2f8cff}
.dark .fg-ca-t{fill:#fff}
.fg-ca-ph{fill:#000;fill-opacity:.4;animation:fg-ca-ph ${CYCLE}s ease-in-out infinite}
.dark .fg-ca-ph{fill-opacity:.5}
.fg-ca-ch{fill-opacity:0;animation:${CYCLE}s linear infinite}
.fg-ca-ans{fill:#0070f3;fill-opacity:0;animation:fg-ca-ans ${CYCLE}s linear infinite}
@keyframes fg-ca-ph{0%,4%{opacity:1}8%,90%{opacity:0}97%,100%{opacity:1}}
@keyframes fg-ca-ans{0%,34%{fill-opacity:0}36%,90%{fill-opacity:1}93%,100%{fill-opacity:0}}
.fg-host:hover .fg-ca-ph{animation:none;opacity:0}
.fg-host:hover :is(.fg-ca-ch,.fg-ca-ans){animation:none;fill-opacity:1}
.fg-host.fg-click .fg-ca-ch{animation:fg-ca-in .12s both;animation-delay:calc(var(--i) * .03s)}
.fg-host.fg-click .fg-ca-ans{animation:fg-ca-in .3s both;animation-delay:1.05s}
@keyframes fg-ca-in{from{fill-opacity:0}to{fill-opacity:1}}
${keys}@media (prefers-reduced-motion:reduce){.fg-ca-ph{animation:none;opacity:0}.fg-ca-ch,.fg-ca-ans{animation:none;fill-opacity:1}}`;
	return { svg, css };
}

export const figures = {
	memory: memory(),
	indexOnce: indexOnce(),
	records: records(),
	privateLocal: privateLocal(),
	idleCpu: idleCpu(),
	search: search(),
	altS: altS(),
	snapOpen: snapOpen(),
	instantSearch: instantSearch(),
	calculator: calculator(),
} satisfies Record<string, Figure>;

export type FigureName = keyof typeof figures;
