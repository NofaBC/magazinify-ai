import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("content-type", "application/json");
  res.status(200).send(JSON.stringify({ ok: true, ts: new Date().toISOString() }));
}
