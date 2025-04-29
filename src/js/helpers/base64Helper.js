import pako from 'pako';

export const compressToBase64 = (data) => {
  const stringified = JSON.stringify(data);
  const compressed = pako.deflate(stringified);
  return btoa(String.fromCharCode.apply(null, compressed));
};

export const decompressFromBase64 = (base64String) => {
  const compressed = Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0));
  const decompressed = pako.inflate(compressed);
  return JSON.parse(new TextDecoder().decode(decompressed));
};
