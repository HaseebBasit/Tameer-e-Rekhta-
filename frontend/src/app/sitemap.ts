import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://tameererekhta.org";

  const routes = [
    "",
    "/about",
    "/our-work",
    "/events",
    "/gallery",
    "/volunteer",
    "/donate",
    "/contact",
    "/team",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/events" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
