import type { TApp } from "@/lib/hono";
import { createRoute, z } from "@hono/zod-openapi";
import { Response } from "@/lib/response";
import { errorResponses } from "@/utils/errorResponses";
import { NotFoundError } from "@/lib/errors";

const route = createRoute({
  method: "get",
  path: "/config/{id}",
  responses: {
    200: Response.schema(
      z.object({
        status: z.string(),
      }),
      {
        description: "Get a config by id.",
      }
    ),
    ...errorResponses,
  },
});

export const registerConfigId = (app: TApp) => {
  app.openapi(route, async (c) => {
    const config = await c.env.KV.get(c.req.param("id"));

    if (!config) {
      throw new NotFoundError();
    }

    return Response.success({
      data: JSON.parse(config),
    }).send(c);
  });
};
