import { z } from "zod";

const credentials = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(128),
});

export function parseCredentials(value: unknown) {
  return credentials.parse(value);
}
