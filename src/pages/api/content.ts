import type { APIRoute } from 'astro';
import { readSite, writeSite } from '../../lib/store';

export const GET: APIRoute = async () => Response.json(await readSite());

export const PUT: APIRoute = async ({ request }) => {
  try {
    const site = await writeSite(await request.json());
    return Response.json({ ok: true, site });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Enregistrement impossible';
    return Response.json({ error: message }, { status: 400 });
  }
};
