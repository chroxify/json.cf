import type { JsonConfigOptions } from "../../types";
import { createReactConfig } from "../react";

export const createSvelteConfig = (options: JsonConfigOptions) => {
  return createReactConfig(options);
};
