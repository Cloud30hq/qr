import type { QRCodeData } from "../../types";
import { getCodeById, getIdBySlug, redis } from "../_lib/kvHelpers";

export default async function handler(req: any, res: any) {
  const { slug } = req.query;
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (typeof slug !== "string") {
    res.status(400).json({ error: "Invalid slug" });
    return;
  }

  const id = await getIdBySlug(slug);
  if (!id) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const code = await getCodeById(id);
  if (!code) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const updated: QRCodeData = {
    ...code,
    scanCount: (code.scanCount || 0) + 1,
    lastScanned: Date.now()
  };

  await redis.set(`code:${id}`, updated);
  res.status(200).json({ targetUrl: updated.targetUrl });
}
