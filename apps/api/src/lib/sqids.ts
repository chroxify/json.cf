import Sqids from "sqids";
import type { TContext } from "./hono";

export const s = (c: TContext) =>
  new Sqids({
    minLength: 14,
    alphabet: c.env.SQIDS_ALPHABET,
  });
