// Isometric projection kernel (from iso-figure by Tolga Cohce, MIT).
// +x runs down-right, +y down-left, +z up. (ox, oy) is where the origin lands.
const C = Math.cos(Math.PI / 6);
const S = 0.5;

export type V3 = [number, number, number];
type V2 = [number, number];

const r2 = (v: number) => Math.round(v * 100) / 100;
const r4 = (v: number) => Math.round(v * 10000) / 10000;

export function iso(ox: number, oy: number) {
	const P = (x: number, y: number, z: number): V2 => [r2((x - y) * C + ox), r2((x + y) * S - z + oy)];
	const D = (x: number, y: number, z: number): V2 => [(x - y) * C, (x + y) * S - z];

	const plane = (o: V3, u: V3, v: V3) => {
		const a = P(...o);
		const b = D(...u);
		const c = D(...v);
		return `matrix(${r4(b[0])} ${r4(b[1])} ${r4(c[0])} ${r4(c[1])} ${a[0]} ${a[1]})`;
	};

	// Planes to draw ordinary 2D shapes on. Local x/y are in the figure's units; y grows downward on FRONT/SIDE.
	const TOP = (x: number, y: number, z: number) => plane([x, y, z], [1, 0, 0], [0, 1, 0]);
	const FRONT = (x: number, y: number, z: number) => plane([x, y, z], [1, 0, 0], [0, 0, -1]); // y = max face
	const SIDE = (x: number, y: number, z: number) => plane([x, y, z], [0, -1, 0], [0, 0, -1]); // x = max face

	const pts = (...p: V2[]) => p.map((q) => q.join(',')).join(' ');

	// A box is its three visible faces, drawn opaque.
	const box = (x: number, y: number, z: number, w: number, d: number, h: number, cls = 'f') =>
		`<polygon class="${cls}" points="${pts(P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h))}"/>` +
		`<polygon class="${cls}" points="${pts(P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h))}"/>` +
		`<polygon class="${cls}" points="${pts(P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h))}"/>`;

	const line = (a: V3, b: V3, cls = 'd') => {
		const p = P(...a);
		const q = P(...b);
		return `<line class="${cls}" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/>`;
	};

	const path = (a: V3, b: V3, cls: string, extra = '') => {
		const p = P(...a);
		const q = P(...b);
		return `<path class="${cls}" d="M${p[0]} ${p[1]}L${q[0]} ${q[1]}" ${extra}/>`;
	};

	// Parallel hairlines "M a,v0 V v1" at a0, a0+step ... a1, for pins and vents on a face.
	const slits = (a0: number, a1: number, step: number, v0: number, v1: number) => {
		let d = '';
		for (let a = a0; a <= a1; a += step) d += `M${a} ${v0}V${v1}`;
		return d;
	};

	return { P, TOP, FRONT, SIDE, box, line, path, pts, slits };
}
