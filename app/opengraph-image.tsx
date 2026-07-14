import { ImageResponse } from "next/og";
import { SITE } from "@/lib/config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #9a3412 0%, #f0530f 55%, #ff8a4c 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, display: "flex" }}>{SITE.name}</div>
        <div style={{ fontSize: 32, marginTop: 24, opacity: 0.92, display: "flex", maxWidth: 900 }}>
          Carte des feux de forêt et incendies en France en direct
        </div>
      </div>
    ),
    size
  );
}
