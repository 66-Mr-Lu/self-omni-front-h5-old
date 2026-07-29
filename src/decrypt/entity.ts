export interface DecryptResult {
  title: string;
  album?: string;
  artist?: string;
  duration?: number;
  bitrate?:number;
  codec?: string;
  sampleRate?: number;
  bitDepth?: number;

  mime: string;
  ext: string;

  file: string;
  blob: Blob;
  picture?: string;

  message?: string;
  rawExt?: string;
  rawFilename?: string;
  originalFilename?: string;
}

export interface FileInfo {
  status: string;
  name: string;
  size: number;
  percentage: number;
  uid: number;
  raw: File;
}
