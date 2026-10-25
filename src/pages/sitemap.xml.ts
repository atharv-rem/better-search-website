import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
	const loc = site ? new URL('/', site).href : '/';
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${loc}</loc></url></urlset>\n`,
		{ headers: { 'Content-Type': 'application/xml' } },
	);
};
