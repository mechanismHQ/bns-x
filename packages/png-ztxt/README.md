## `@bns-x/png`

A library for verifying and creating "Verified PNGs".

A demo is available on [Dots](https://www.dots.so/verifier).

## Why?

Cryptographic signatures are a mechanism that allows anyone to attest to certain information. Blockchains utilize this technology to verify whether a transaction came from a specific address.

With the growth of NFTs and especially [Ordinals](https://ordinals.com/) inscriptions, there is often a need to establish provenance around a specific image. For example, an artist may wish to use signatures to provably establish that they endorse an artwork.

This library provides an efficient mechanism for anyone to embed their signature in a PNG file, without effecting how the image is displayed.

## How it works

PNG files are made up of many "chunks". These chunks contain information about the image, such as the dimensions, color profile, and raw pixel data. Chunks can also be used to include "extra" information, including arbitrary text.

This library utilizes PNG chunks to store signatures.

### Creating signatures

The workflow for creating a signature chunk is:

**1. Generate a hash of the PNG**

For the purposes of this specification, it's not possible to immediately hash the image like any other file, because the file's hash will change after signatures are added. Instead, to generate a hash, you first need to _remove_ any signature-based chunks. This way, a file's hash can remain the same after adding signatures.

**2. Create a signature**

When generating a signature, the "message" is of the format:

```

PNG_VERIFICATION:{pngHash}

```

Where `pngHash` is created from step 1.

**3. Encode signature data**

Once a signature is created, it must be encoded as follows:

| Name           | Format                 | Notes                                                                              |
| -------------- | ---------------------- | ---------------------------------------------------------------------------------- | --- | --- | --- |
| Protocol       | Null-terminated string | Used to denote the method for verifying signature data                             |
| Version        | `uint8`                | To support future versions of this specification. At the moment, `1` is supported. |
| Signature Data | Bytes                  |                                                                                    |     |     |     |

The contents of "Signature Data" is dependent on the "protocol" label. For the "STX" protocol, the format is:

| Name       | Format         | Notes                     |
| ---------- | -------------- | ------------------------- |
| Public key | 33 bytes       |                           |
| Signature  | 64 or 65 bytes | Signature in "RSV" format |

**4. Create a new chunk**

This specification uses the `zTXt` chunk type, because it supports compressed data, which reduces the size of added signatures.

The "label" for the chunk must be `verified-inscription`. The compression flag must be `0`, and the value must be the zlib compressed value of the encoded signature data bytes.

**5. Add the chunk to the PNG**

The chunk can be included anywhere other than as the last chunk of the PNG. This library appends the chunk as the second-to-last chunk in the file.

### Verifying signatures

**1. Create the PNG hash**

Refer to the process from "creating inscriptions". This is the `sha256` hash of the image, **after** removing signature chunks.

**2. Extract verification chunks**

A verification chunk is any chunk of the `zTXt` type with the `verified-inscription` label. There may be more than one verification chunk.

**3. Verify chunk signatures**

The methodology for verifying each chunk's signature is dependent on the `protocol` flag of that chunk. The `message` used to verify each signature is `sha256("PNG_VERIFICATION" + sha256(pngHash))`.

## Using the library

To extract and verify all verification chunks, use `getPngVerifications(pngFile)`.

```ts
import { PNG, getPngVerifications } from '@bns-x/png';

const url = 'https://www.dots.so/signed-example.png';
const response = await fetch(url);
const bytes = new Uint8Array(await response.arrayBuffer());
const png = PNG.decode(bytes);
const verifications = getPngVerifications(png);
```
