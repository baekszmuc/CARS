import type { MetadataRoute } from "next";
import { getPublishedVehicles, getSiteBase } from "@/lib/data";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [base, vehicles] = await Promise.all([getSiteBase(), getPublishedVehicles()]);
  const pages = ["", "/vehiculos", "/servicios", "/incluye", "/contacto", "/privacidad"].map((p) => ({
    url: `${base.url}${p}`,
  }));
  return [
    ...pages,
    ...vehicles.map((v) => ({ url: `${base.url}/vehiculos/${v.slug}`, lastModified: v.updated_at })),
  ];
}
