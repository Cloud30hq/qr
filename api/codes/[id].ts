import type { QRCodeData } from "../../types";
import { getCodeById, getIdBySlug, redis } from "../_lib/kvHelpers.js";

const isAdmin = (req: any) => {
  const token = (req.headers?.authorization || "").replace("Bearer ", "");
  return Boolean(process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN);
};

const getOwnerKey = (req: any) => {
  const ownerKey = req.headers?.["x-owner-key"];
  if (typeof ownerKey !== "string") return "";
  return ownerKey.trim();
};

export default async function handler(req: any, res: any) {
  const admin = isAdmin(req);
  const ownerKey = getOwnerKey(req);
  if (!admin && !ownerKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

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
    if (!admin && existing.ownerKey !== ownerKey) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const updates = req.body as Partial<QRCodeData>;
    const next: QRCodeData = {
      ...existing,
      ...updates,
      ownerKey: existing.ownerKey || (admin ? "admin" : ownerKey)
    };

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
      if (!admin && existing.ownerKey !== ownerKey) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      await redis.del(`code:${id}`);
      await redis.del(`slug:${existing.slug}`);
      await redis.srem("codes", id);
      if (existing.ownerKey) {
        await redis.srem(`owner:${existing.ownerKey}:codes`, id);
      }
    }
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
