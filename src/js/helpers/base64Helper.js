import pako from 'pako';

export const compressToBase64 = (data) => {
  const stringified = JSON.stringify(data);
  const compressed = pako.deflate(stringified);
  return btoa(String.fromCharCode.apply(null, compressed));
};

export const decompressFromBase64 = (base64String) => {
  try {
    let standardBase64 = base64String
      .replace(/\s/g, '+')
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    while (standardBase64.length % 4) {
      standardBase64 += '=';
    }

    const compressed = Uint8Array.from(atob(standardBase64), (c) => c.charCodeAt(0));
    const decompressed = pako.inflate(compressed);
    return JSON.parse(new TextDecoder().decode(decompressed));
  } catch (error) {
    console.error('Decompression error:', error);
    throw error;
  }
};
