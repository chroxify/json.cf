import type { TApp } from "@/lib/hono";
import { createRoute, z } from "@hono/zod-openapi";
import { Response } from "@/lib/response";
import { errorResponses } from "@/utils/errorResponses";
import { NotFoundError } from "@/lib/errors";

const route = createRoute({
  method: "get",
  path: "/config/:id/kv/:key{.+}",
  responses: {
    200: Response.schema(
      z.object({
        status: z.string(),
      }),
      {
        description: "Get a single key value pair from a config.",
      }
    ),
    ...errorResponses,
  },
});

export const registerConfigIdKvKey = (app: TApp) => {
  app.openapi(route, async (c) => {
    const config = await c.env.KV.getWithMetadata(c.req.param("id"));

    if (
      !config.value ||
      ((config.metadata as { private: boolean; secret: string })?.private &&
        (config.metadata as { private: boolean; secret: string })?.secret !==
          c.req.header("x-config-secret"))
    ) {
      throw new NotFoundError({
        message: "Config could not be found.",
      });
    }
    const value = JSON.parse(config.value);
    const keyPath = c.req.param("key").split("/");

    let current = value;
    for (const key of keyPath) {
      if (current[key] === undefined) {
        throw new NotFoundError({
          message: "Config key could not be found.",
        });
      }
      current = current[key];
    }

    return Response.success({
      data: current,
    }).send(c);
  });
};
