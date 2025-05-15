import { App } from "@/lib/hono";
import { registerHealth } from "./health";
import { registerConfigId } from "./config/[id]";
import { registerConfig } from "./config";

const v1 = App();

/*
 * /v1/health
 */
registerHealth(v1);

/*
 * /v1/config
 */
registerConfig(v1);

/*
 * /v1/config/:id
 */
registerConfigId(v1);

export default v1;
