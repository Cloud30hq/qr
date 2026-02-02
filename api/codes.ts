import type { QRCodeData } from "../types";
import { getIdBySlug, listCodes, redis } from "./_lib/kvHelpers.js";

const isAuthorized = (req: any) => {
  const token = (req.headers?.authorization || "").replace("Bearer ", "");
  return Boolean(process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN);
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
  if (!isAuthorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.method === "GET") {
    const codes = await listCodes();
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

  await redis.set(`code:${code.id}`, code);
  await redis.set(`slug:${code.slug}`, code.id);
  await redis.sadd("codes", code.id);

  res.status(201).json(code);
}
