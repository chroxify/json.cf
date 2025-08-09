import type { TApp } from "@/lib/hono";
import { createRoute, z } from "@hono/zod-openapi";
import { Response } from "@/lib/response";
import { errorResponses } from "@/utils/errorResponses";
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from "@/lib/errors";
import { jsonSchema } from "@/utils/zodTypes";

const getRoute = createRoute({
  method: "get",
  path: "/config/:id",
  responses: {
    200: Response.schema(jsonSchema, {
      description: "Get a config by id.",
    }),
    ...errorResponses,
  },
});

const updateRoute = createRoute({
  method: "put",
  path: "/config/:id",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: jsonSchema,
        },
      },
    },
  },
  responses: {
    200: Response.schema(
      z.object({
        id: z.string(),
        config: jsonSchema,
        metadata: z.object({
          updatedAt: z.string(),
          createdAt: z.string(),
        }),
      }),
      {
        description: "Update a config by id.",
      }
    ),
    ...errorResponses,
  },
});

export const registerConfigId = (app: TApp) => {
  // GET endpoint
  app.openapi(getRoute, async (c) => {
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

    return Response.success({
      data: JSON.parse(config.value),
      ignoreTransform: true,
    }).send(c);
  });

  // PUT endpoint
  app.openapi(updateRoute, async (c) => {
    const configId = c.req.param("id");
    const body = await c.req.json();

    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestError({
        message: "Body can not be empty.",
      });
    }

    // Get existing config with metadata
    const existingConfig = await c.env.KV.getWithMetadata(configId);

    if (!existingConfig.value) {
      throw new NotFoundError({
        message: "Config could not be found.",
      });
    }

    const metadata = existingConfig.metadata as {
      private: boolean;
      secret: string;
      createdAt: string;
    };

    // Check authorization for private configs
    if (metadata?.private) {
      const authHeader = c.req.header("authorization");
      const secret = authHeader?.replace("Bearer ", "");

      if (!secret || secret !== metadata.secret) {
        throw new UnauthorizedError({
          message: "Invalid or missing secret for private config.",
        });
      }
    }

    // Update metadata
    const updatedMetadata = {
      ...metadata,
      updatedAt: new Date().toISOString(),
    };

    // Update config
    await c.env.KV.put(configId, JSON.stringify(body), {
      metadata: updatedMetadata,
    });

    return Response.success({
      data: {
        id: configId,
        config: body,
        metadata: {
          updatedAt: updatedMetadata.updatedAt,
          createdAt: updatedMetadata.createdAt,
        },
      },
      ignoreTransform: true,
    }).send(c);
  });
};
