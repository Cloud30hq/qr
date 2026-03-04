
export type QRInterest =
  | "general"
  | "food"
  | "fashion"
  | "music"
  | "sports"
  | "tech"
  | "travel";

export type QRScanMode = "dynamic" | "direct";

export interface QRCodeData {
  id: string;
  title: string;
  slug: string; // The unique ID used in the redirect URL
  targetUrl: string;
  scanMode?: QRScanMode;
  ownerKey?: string;
  interest?: QRInterest;
  logoImage?: string;
  createdAt: number;
  scanCount: number;
  lastScanned?: number;
  style: QRStyle;
}

export interface QRStyle {
  fgColor: string;
  bgColor: string;
  level: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
  size: number;
}

export interface AppState {
  codes: QRCodeData[];
}
