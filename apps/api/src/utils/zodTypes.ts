import { z, extendZodWithOpenApi } from "@hono/zod-openapi";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const jsonField: z.ZodType<JsonValue> = z
  .lazy(() =>
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.null(),
      z.array(jsonField),
      z.record(jsonField),
    ])
  )
  .openapi({
    type: "object",
    title: "JSON Value",
    description:
      "Any valid JSON value (string, number, boolean, null, array, or object)",
    externalDocs: {
      description: "JSON Specification",
      url: "https://www.json.org/json-en.html",
    },
  });

const jsonObject = z.record(z.string(), jsonField);

export const jsonSchema = z.union([jsonObject, z.array(jsonObject)]);
