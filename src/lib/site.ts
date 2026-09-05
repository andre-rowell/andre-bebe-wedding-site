export const siteOrigin = (() => {
  const fallback = "https://rowell-wedding.vercel.app";
  const value = process.env.NEXT_PUBLIC_SITE_URL || fallback;

  try {
    return new URL(value).origin;
  } catch {
    return fallback;
  }
})();

export const siteName = "Andre & Bebe";
export const siteTitle = "Andre & Bebe | Wedding";
export const siteDescription = "Wedding details for Andre and Bebe on May 30, 2027, in Saint Paul and Minneapolis, Minnesota.";
