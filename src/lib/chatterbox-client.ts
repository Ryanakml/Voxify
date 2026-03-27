import createClient from "openapi-fetch";
import type { paths } from "@/types/chatterbox-api";

export const chatterbox = createClient<paths>({
  baseUrl: process.env.CHATTERBOX_API_URL,
  headers: {
    "x-api-key": process.env.CHATTERBOX_API_KEY,
  },
});
