import { ImageResponse } from "next/og";
import { sanityFetch } from "@/sanity/lib/live";
import { siteSettingsQuery } from "@/sanity/lib/queries";
import type { SiteSettings } from "@/types";

export const alt = "Gulddal Piercings";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  let title = "Gulddal Piercings";
  let tagline = "Piercinger med omhu";
  try {
    const { data } = await sanityFetch({
      query: siteSettingsQuery,
      stega: false,
    });
    const s = data as SiteSettings;
    if (s?.title) title = s.title;
    if (s?.tagline) tagline = s.tagline;
  } catch {
    // Brug standardværdier hvis Sanity ikke kan nås.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(60% 60% at 80% 0%, #ffe0ef 0%, transparent 60%), radial-gradient(50% 50% at 0% 20%, #fff1f7 0%, transparent 55%), #fff5f9",
          color: "#5c0a2f",
        }}
      >
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            color: "#db1e73",
            letterSpacing: -2,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 34, marginTop: 12, color: "#8a0f47" }}>
          {tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
