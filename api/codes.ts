import type { QRCodeData } from "../types";
import { getIdBySlug, listCodes, listCodesByOwner, redis } from "./_lib/kvHelpers.js";

const isAdmin = (req: any) => {
  const token = (req.headers?.authorization || "").replace("Bearer ", "");
  return Boolean(process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN);
};

const getOwnerKey = (req: any) => {
  const ownerKey = req.headers?.["x-owner-key"];
  if (typeof ownerKey !== "string") return "";
  return ownerKey.trim();
};

const isValidCode = (code: QRCodeData) => {
  return Boolean(
    code.id &&
      code.title &&
      code.slug &&
      code.targetUrl &&
      typeof code.createdAt === "number" &&
      typeof code.scanCount === "number"
  );
};

export default async function handler(req: any, res: any) {
  const admin = isAdmin(req);
  const ownerKey = getOwnerKey(req);
  if (!admin && !ownerKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.method === "GET") {
    const codes = admin ? await listCodes() : await listCodesByOwner(ownerKey);
    codes.sort((a, b) => b.createdAt - a.createdAt);
    res.status(200).json(codes);
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const code = req.body as QRCodeData;
  if (!code || !isValidCode(code)) {
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const existingId = await getIdBySlug(code.slug);
  if (existingId && existingId !== code.id) {
    res.status(409).json({ error: "Slug already exists" });
    return;
  }

  const saved: QRCodeData = {
    ...code,
    ownerKey: admin ? (code.ownerKey || "admin") : ownerKey
  };

  await redis.set(`code:${saved.id}`, saved);
  await redis.set(`slug:${saved.slug}`, saved.id);
  await redis.sadd("codes", code.id);
  if (saved.ownerKey) {
    await redis.sadd(`owner:${saved.ownerKey}:codes`, saved.id);
  }

  res.status(201).json(saved);
}
