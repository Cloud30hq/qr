
export interface QRCodeData {
  id: string;
  title: string;
  slug: string; // The unique ID used in the redirect URL
  targetUrl: string;
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
