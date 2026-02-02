
import { QRCodeData } from "../types";

const getAdminToken = () => localStorage.getItem("cloud30qr_admin_token") || "";

const authHeaders = () =>
  getAdminToken()
    ? { Authorization: `Bearer ${getAdminToken()}` }
    : {};

const handleJson = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Request failed");
  }
  return res.json() as Promise<T>;
};

export const storageService = {
  getCodes: async (): Promise<QRCodeData[]> => {
    const res = await fetch("/api/codes", {
      headers: authHeaders()
    });
    return handleJson<QRCodeData[]>(res);
  },

  addCode: async (code: QRCodeData): Promise<QRCodeData> => {
    const res = await fetch("/api/codes", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(code)
    });
    return handleJson<QRCodeData>(res);
  },

  updateCode: async (id: string, updates: Partial<QRCodeData>): Promise<QRCodeData> => {
    const res = await fetch(`/api/codes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(updates)
    });
    return handleJson<QRCodeData>(res);
  },

  deleteCode: async (id: string): Promise<void> => {
    const res = await fetch(`/api/codes/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    if (!res.ok && res.status !== 204) {
      const message = await res.text();
      throw new Error(message || "Request failed");
    }
  },

  incrementScan: async (slug: string): Promise<string | null> => {
    const res = await fetch(`/api/resolve/${slug}`);
    if (res.status === 404) return null;
    const data = await handleJson<{ targetUrl: string }>(res);
    return data.targetUrl;
  }
};
