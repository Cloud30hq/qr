import type { QRCodeData } from "../../types";
import { getCodeById, getIdBySlug, redis } from "../_lib/kvHelpers";

export default async function handler(req: any, res: any) {
  const { id } = req.query;
  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  if (req.method === "PUT") {
    const existing = await getCodeById(id);
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const updates = req.body as Partial<QRCodeData>;
    const next: QRCodeData = { ...existing, ...updates };

    if (!next.title || !next.slug || !next.targetUrl) {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }

    if (next.slug !== existing.slug) {
      const slugOwner = await getIdBySlug(next.slug);
      if (slugOwner && slugOwner !== id) {
        res.status(409).json({ error: "Slug already exists" });
        return;
      }
      await redis.del(`slug:${existing.slug}`);
      await redis.set(`slug:${next.slug}`, id);
    }

    await redis.set(`code:${id}`, next);
    res.status(200).json(next);
    return;
  }

  if (req.method === "DELETE") {
    const existing = await getCodeById(id);
    if (existing) {
      await redis.del(`code:${id}`);
      await redis.del(`slug:${existing.slug}`);
      await redis.srem("codes", id);
    }
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
