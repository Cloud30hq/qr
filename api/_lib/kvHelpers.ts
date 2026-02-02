import { Redis } from "@upstash/redis";
import type { QRCodeData } from "../../types";

const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  "";
const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  "";

export const redis = new Redis({ url: redisUrl, token: redisToken });

export const getCodeById = async (id: string) => {
  return redis.get<QRCodeData>(`code:${id}`);
};

export const getIdBySlug = async (slug: string) => {
  return redis.get<string>(`slug:${slug}`);
};

export const listCodes = async () => {
  const ids = await redis.smembers<string>("codes");
  if (!ids.length) return [];
  const records = await redis.mget<QRCodeData>(...ids.map(id => `code:${id}`));
  return records.filter(Boolean) as QRCodeData[];
};
