import type { TApp } from "@/lib/hono";
import { createRoute, z } from "@hono/zod-openapi";
import { Response } from "@/lib/response";
import { errorResponses } from "@/utils/errorResponses";
import { s } from "@/lib/sqids";
import { BadRequestError } from "@/lib/errors";
import { jsonSchema } from "@/utils/zodTypes";

const route = createRoute({
  method: "post",
  path: "/config",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: jsonSchema,
        },
      },
    },
    query: z.object({
      private: z
        .union([z.literal("true"), z.literal("false")])
        .optional()
        .default("false"),
    }),
  },
  responses: {
    200: Response.schema(
      z.object({
        id: z.string(),
        secret: z.string(),
        config: jsonSchema,
        metadata: z.object({
          updatedAt: z.string(),
          createdAt: z.string(),
        }),
      }),
      {
        description: "Create a new config.",
      }
    ),
    ...errorResponses,
  },
});

export const registerConfig = (app: TApp) => {
  app.openapi(route, async (c) => {
    // Validate body
    const body = await c.req.valid("json");
    if (Object.keys(body).length === 0) {
      throw new BadRequestError({
        message: "Body can not be empty.",
      });
    }

    // Get count & build config id
    const count = await c.env.KV.get("count");
    const configId = s(c).encode([Number(count) + 1]);

    // Set secret & metadata
    const secret = crypto.randomUUID();
    const metadata = {
      secret,
      private: c.req.query("private") === "true",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Create config
    await c.env.KV.put(configId, JSON.stringify(body), {
      metadata: {
        ...metadata,
      },
    });

    // Increment count
    await c.env.KV.put("count", String(Number(count) + 1));

    return Response.success({
      data: {
        id: configId,
        secret,
        config: body,
        metadata,
      },
      ignoreTransform: true,
    }).send(c);
  });
};
