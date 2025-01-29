import { UnstructuredClient } from "unstructured-client";

export const unstructuredIO = new UnstructuredClient({
  serverURL: "https://api.unstructured.io/general/v0/general",
  security: {
    apiKeyAuth: process.env.UNSTRUCTURED_IO_API_KEY,
  },
});
