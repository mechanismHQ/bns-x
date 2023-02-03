import { z } from 'zod';

export const nftProperty = z.union([
  z.object({
    type: z
      .union([z.literal('object'), z.literal('string'), z.literal('number'), z.literal('integer')])
      .describe('type of the property'),
    description: z.string().describe('description of the property'),
    value: z
      .union([
        z.record(z.any()),
        z.string(),
        z.number(),
        z.number().int(),
        z.boolean(),
        z.array(z.any()),
      ])
      .describe('value of the property'),
  }),
  z.string(),
  z.number(),
]);

export type NftProperty = z.infer<typeof nftProperty>;

export const nftMetadata = z.object({
  sip: z
    .literal(16)
    .describe(
      'SIP number that defines the JSON schema for metadata. For this SIP, the sip number must be `16`.'
    ),
  name: z.string().describe('Identifies the asset which this token represents'),
  description: z.string().describe('Describes the asset which this token represents').optional(),
  image: z
    .string()
    .describe(
      "A URI pointing to a resource with MIME type image/* representing the asset to which this token represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive. If the token represents a media file of different MIME type or of higher quality defined in property 'raw_media_file_uri', then this image should be used as preview image like a cover for music, or an low-res image."
    )
    .optional(),
  attributes: z
    .array(
      z.object({
        display_type: z.string().optional(),
        trait_type: z.string(),
        value: z.union([
          z.record(z.any()),
          z.string(),
          z.number(),
          z.number().int(),
          z.boolean(),
          z.array(z.any()),
        ]),
      })
    )
    .describe(
      'Additional attributes of the token that are "observable". See section below. Values may be strings, numbers, object or arrays.'
    )
    .optional(),
  properties: z
    .record(nftProperty)
    .describe(
      'Additional other properties of the token. See section below. Values may be strings, numbers, object or arrays.'
    )
    .optional(),
  localization: z
    .object({
      uri: z
        .string()
        .describe(
          'The URI pattern to fetch localized data from. This URI should contain the substring `{locale}` which will be replaced with the appropriate locale value before sending the request. See section about localization for more rules'
        ),
      default: z.string().describe('The locale of the default data within the base JSON'),
      locales: z
        .array(z.any())
        .describe(
          'The list of locales for which data is available. These locales should conform to those defined in the Unicode Common Locale Data Repository (http://cldr.unicode.org/).'
        ),
    })
    .optional(),
  image_data: z
    .string()
    .describe('Raw SVG image data. Deprecated. Use `properties.image_data`.')
    .optional(),
  external_url: z
    .string()
    .describe(
      'Url to view the item on a 3rd party web site. Deprecated. Use `properties.external_url`.'
    )
    .optional(),
  animation_url: z
    .string()
    .describe(
      'URL to a multi-media attachment for the item. Deprecated. Use `properties.animation_url`.'
    )
    .optional(),
});

export type NftMetadata = z.infer<typeof nftMetadata>;

const propsJson = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Token Metadata Property',
  type: 'object',
  required: [],
  properties: {
    type: {
      type: 'string',
      description: 'type of the property',
    },
    description: {
      type: 'string',
      description: 'description of the property',
    },
    value: {
      type: {
        oneOf: [
          { type: 'object' },
          { type: 'string' },
          { type: 'number' },
          { type: 'integer' },
          { type: 'boolean' },
          { type: 'array' },
        ],
      },
      description: 'value of the property',
    },
  },
};
