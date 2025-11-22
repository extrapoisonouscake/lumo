import { PUBLIC_DOMAIN } from "@/constants/website";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/$",
      disallow: "*",
    },
    sitemap: `https://${PUBLIC_DOMAIN}/sitemap.xml`,
  };
}
