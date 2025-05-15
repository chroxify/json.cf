import type { TApp } from "@/lib/hono";
import { createRoute, z } from "@hono/zod-openapi";
import { Response } from "@/lib/response";
import { errorResponses } from "@/utils/errorResponses";
import { s } from "@/lib/sqids";

const route = createRoute({
  method: "post",
  path: "/config",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: z.any(),
        },
      },
    },
  },
  responses: {
    200: Response.schema(
      z.object({
        status: z.string(),
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
    // Get count & build config id
    const count = await c.env.KV.get("count");
    const configId = s(c).encode([Number(count) + 1]);

    // Get body & create secret
    const body = await c.req.valid("json");
    const secret = crypto.randomUUID();
    const metadata = {
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Create config
    await c.env.KV.put(configId, JSON.stringify(body), {
      metadata: {
        secret,
        ...metadata,
      },
    });

    // Increment count
    await c.env.KV.put("count", String(Number(count) + 1));

    return Response.success({
      data: {
        id: configId,
        secret,
        config: {
          ...body,
        },
        metadata,
      },
    }).send(c);
  });
};
