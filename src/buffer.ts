export function concatByteArrays(byteArrays: Uint8Array[]): Uint8Array {
  const totalSize = byteArrays.reduce((len, bytes) => len + bytes.length, 0);
  const resultArray = new Uint8Array(totalSize);
  let offset = 0;
  for (let i = 0; i < byteArrays.length; i++) {
    resultArray.set(byteArrays[i], offset);
    offset += byteArrays[i].length;
  }
  return resultArray;
}
