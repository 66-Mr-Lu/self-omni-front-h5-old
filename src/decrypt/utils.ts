import { IAudioMetadata } from 'music-metadata-browser';
// import { ID3Writer } from 'browser-id3-writer';
// import MetaFlac from 'metaflac-js';
import MetaFlac from 'metaflac-browser-js';

/** 在 TypeScript 中，当使用 await import() 动态导入一个 CommonJS 模块时，TypeScript 会将该模块的类型推断为包含默认导出和其他命名导出的模块对象（即 typeof import("browser-id3-writer")），而不是直接等同于导出的构造函数或类。
 在您提供的代码中，虽然您在顶部通过 const ID3Writer = ID3WriterModule.default || ID3WriterModule; 尝试获取了实际的导出对象，但 TypeScript 的类型系统并不会根据这行运行时的逻辑推断来改变 ID3Writer 的静态类型。因此，TypeScript 依然认为 ID3Writer 是一个模块对象类型，而模块对象本身是没有构造签名的，无法使用 new 关键字进行实例化，从而导致了 This expression is not constructable 的编译错误。

 要解决这个问题，我们需要显式地告诉 TypeScript，ID3Writer 是一个可以实例化的构造函数。可以通过类型断言将 ID3WriterModule.default || ID3WriterModule 断言为 any 类型，这样 TypeScript 就不会对它使用 new 操作符报错了。
 */
// 动态导入，拿到模块对象
const ID3WriterModule = await import('browser-id3-writer');
// 优先取 default，如果不存在则直接使用模块本身
const ID3Writer: any = ID3WriterModule.default || ID3WriterModule;

export const split_regex = /[ ]?[,;/_、][ ]?/;

export const FLAC_HEADER = [0x66, 0x4c, 0x61, 0x43];
export const MP3_HEADER = [0x49, 0x44, 0x33];
export const OGG_HEADER = [0x4f, 0x67, 0x67, 0x53];
export const M4A_HEADER = [0x66, 0x74, 0x79, 0x70];
//prettier-ignore
export const WMA_HEADER = [
  0x30, 0x26, 0xb2, 0x75, 0x8e, 0x66, 0xcf, 0x11,
  0xa6, 0xd9, 0x00, 0xaa, 0x00, 0x62, 0xce, 0x6c,
];
export const WAV_HEADER = [0x52, 0x49, 0x46, 0x46];
export const AAC_HEADER = [0xff, 0xf1];
export const DFF_HEADER = [0x46, 0x52, 0x4d, 0x38];

export const AudioMimeType: { [key: string]: string } = {
  mp3: 'audio/mpeg',
  flac: 'audio/flac',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
  wma: 'audio/x-ms-wma',
  wav: 'audio/x-wav',
  dff: 'audio/x-dff',
};

export function BytesHasPrefix(data: Uint8Array, prefix: number[]): boolean {
  if (prefix.length > data.length) return false;
  return prefix.every((val, idx) => {
    return val === data[idx];
  });
}

export function BytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => {
    return val === b[idx];
  });
}

export function SniffAudioExt(data: Uint8Array, fallback_ext: string = 'mp3'): string {
  if (BytesHasPrefix(data, MP3_HEADER)) return 'mp3';
  if (BytesHasPrefix(data, FLAC_HEADER)) return 'flac';
  if (BytesHasPrefix(data, OGG_HEADER)) return 'ogg';
  if (data.length >= 4 + M4A_HEADER.length && BytesHasPrefix(data.slice(4), M4A_HEADER)) return 'm4a';
  if (BytesHasPrefix(data, WAV_HEADER)) return 'wav';
  if (BytesHasPrefix(data, WMA_HEADER)) return 'wma';
  if (BytesHasPrefix(data, AAC_HEADER)) return 'aac';
  if (BytesHasPrefix(data, DFF_HEADER)) return 'dff';
  return fallback_ext;
}

export function GetArrayBuffer(obj: Blob): Promise<ArrayBuffer> {
  if (!!obj.arrayBuffer) return obj.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rs = e.target?.result;
      if (!rs) {
        reject('read file failed');
      } else {
        resolve(rs as ArrayBuffer);
      }
    };
    reader.readAsArrayBuffer(obj);
  });
}

export function GetCoverFromFile(metadata: IAudioMetadata): string {
  if (metadata.common?.picture && metadata.common.picture.length > 0) {
    const pic = metadata.common.picture[0];
    return URL.createObjectURL(
        new Blob([pic.data as BlobPart], { type: pic.format })
    );
  }
  return '';
}

export interface IMusicMetaBasic {
  title: string;
  artist?: string;
}

export function GetMetaFromFile(
    filename: string,
    exist_title?: string,
    exist_artist?: string,
    separator = '-',
): IMusicMetaBasic {
  const meta: IMusicMetaBasic = { title: exist_title ?? '', artist: exist_artist };

  const items = filename.split(separator);
  if (items.length > 1) {
    //由文件名和原metadata共同决定歌手tag(有时从文件名看有多个歌手，而metadata只有一个)
    if (!meta.artist || meta.artist.split(split_regex).length < items[0].trim().split(split_regex).length) meta.artist = items[0].trim();
    if (!meta.title) meta.title = items[1].trim();
  } else if (items.length === 1) {
    if (!meta.title) meta.title = items[0].trim();
  }
  return meta;
}

export async function GetImageFromURL(
    src: string,
): Promise<{ mime: string; buffer: ArrayBuffer; url: string } | undefined> {
  try {
    const resp = await fetch(src);
    const mime = resp.headers.get('Content-Type');
    if (mime?.startsWith('image/')) {
      const buffer = await resp.arrayBuffer();
      const url = URL.createObjectURL(new Blob([buffer], { type: mime }));
      return { buffer, url, mime };
    }
  } catch (e) {
    console.warn(e);
  }
}

export interface IMusicMeta {
  title: string;
  artists?: string[];
  album?: string;
  albumartist?: string;
  genre?: string[];
  picture?: ArrayBuffer;
  picture_desc?: string;
}

export function WriteMetaToMp3(audioData: Buffer, info: IMusicMeta, original: IAudioMetadata) {
  const writer = new ID3Writer(audioData);

  // reserve original data
  const frames = original.native['ID3v2.4'] || original.native['ID3v2.3'] || original.native['ID3v2.2'] || [];
  frames.forEach((frame) => {
    if (frame.id !== 'TPE1' && frame.id !== 'TIT2' && frame.id !== 'TALB') {
      try {
        writer.setFrame(frame.id, frame.value);
      } catch (e) {
        console.warn(`failed to write ID3 tag '${frame.id}'`);
      }
    }
  });

  const old = original.common;
  writer
      .setFrame('TPE1', old?.artists || info.artists || [])
      .setFrame('TIT2', old?.title || info.title)
      .setFrame('TALB', old?.album || info.album || '');
  if (info.picture) {
    writer.setFrame('APIC', {
      type: 3,
      data: info.picture,
      description: info.picture_desc || '',
    });
  }
  return writer.addTag();
}

export function WriteMetaToFlac(audioData: Buffer, info: IMusicMeta, original: IAudioMetadata) {
  const writer = new MetaFlac(audioData);
  const old = original.common;
  if (!old.title && !old.album && old.artists) {
    writer.setTag('TITLE=' + info.title);
    writer.setTag('ALBUM=' + info.album);
    if (info.artists) {
      writer.removeTag('ARTIST');
      info.artists.forEach((artist) => writer.setTag('ARTIST=' + artist));
    }
  }

  if (info.picture) {
    writer.importPictureFromBuffer(Buffer.from(info.picture));
  }
  return writer.save();
}

export function RewriteMetaToMp3(audioData: Buffer, info: IMusicMeta, original: IAudioMetadata) {
  const writer = new ID3Writer(audioData);

  // preserve original data
  const frames = original.native['ID3v2.4'] || original.native['ID3v2.3'] || original.native['ID3v2.2'] || [];
  frames.forEach((frame) => {
    if (frame.id !== 'TPE1'
        && frame.id !== 'TIT2'
        && frame.id !== 'TALB'
        && frame.id !== 'TPE2'
        && frame.id !== 'TCON'
    ) {
      try {
        writer.setFrame(frame.id, frame.value);
      } catch (e) {
        throw new Error(`failed to write ID3 tag '${frame.id}'`);
      }
    }
  });

  const old = original.common;
  writer
      .setFrame('TPE1', info?.artists || old.artists || [])
      .setFrame('TIT2', info?.title || old.title)
      .setFrame('TALB', info?.album || old.album || '')
      .setFrame('TPE2', info?.albumartist || old.albumartist || '')
      .setFrame('TCON', info?.genre || old.genre || []);
  if (info.picture) {
    writer.setFrame('APIC', {
      type: 3,
      data: info.picture,
      description: info.picture_desc || '',
    });
  }
  return writer.addTag();
}

export function RewriteMetaToFlac(audioData: Buffer, info: IMusicMeta, original: IAudioMetadata) {
  const writer = new MetaFlac(audioData);
  const old = original.common;
  if (info.title) {
    if (old.title) {
      writer.removeTag('TITLE');
    }
    writer.setTag('TITLE=' + info.title);
  }
  if (info.album) {
    if (old.album) {
      writer.removeTag('ALBUM');
    }
    writer.setTag('ALBUM=' + info.album);
  }
  if (info.albumartist) {
    if (old.albumartist) {
      writer.removeTag('ALBUMARTIST');
    }
    writer.setTag('ALBUMARTIST=' + info.albumartist);
  }
  if (info.artists) {
    if (old.artists) {
      writer.removeTag('ARTIST');
    }
    info.artists.forEach((artist) => writer.setTag('ARTIST=' + artist));
  }
  if (info.genre) {
    if (old.genre) {
      writer.removeTag('GENRE');
    }
    info.genre.forEach((singlegenre) => writer.setTag('GENRE=' + singlegenre));
  }

  if (info.picture) {
    writer.importPictureFromBuffer(Buffer.from(info.picture));
  }
  return writer.save();
}

export function SplitFilename(n: string): { name: string; ext: string } {
  const pos = n.lastIndexOf('.');
  return {
    ext: n.substring(pos + 1).toLowerCase(),
    name: n.substring(0, pos),
  };
}
