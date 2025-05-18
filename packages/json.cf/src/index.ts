import type { JsonConfigOptions } from "./types";
import { createReactConfig } from "./frameworks/react";

export * from "./types";

export const jsonConfig = (options: JsonConfigOptions) => {
  return createReactConfig(options);
};
