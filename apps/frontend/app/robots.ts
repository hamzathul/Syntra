import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/register"],
      // App pages require auth; keep crawlers out of private areas.
      // Mirrors protectedRoutes in apps/frontend/proxy.ts.
      disallow: [
        "/dashboard",
        "/onboarding",
        "/api/",
        "/sales",
        "/purchases",
        "/items",
        "/reports",
        "/settings",
      ],
    },
  };
}
