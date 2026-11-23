import { ImageResponse } from "next/og";
import { lookupExperience } from "@/lib/server";

export const alt = "A little universe made for you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const Heart = ({ size: s, color, style }: { size: number; color: string; style: React.CSSProperties }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ position: "absolute", ...style }}>
    <path fill={color} d="M12 21s-7.5-4.6-10-9.3C.3 8.3 2.4 4 6.4 4c2.2 0 3.8 1.2 4.6 2.7h2C13.8 5.2 15.4 4 17.6 4c4 0 6.1 4.3 4.4 7.7C19.5 16.4 12 21 12 21z" />
  </svg>
);

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await lookupExperience(slug);
  const name = res.status === "ok" ? res.config.recipientName : "you";
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
          background: "linear-gradient(135deg, #ffe0ea 0%, #fff1f5 45%, #ece0ff 100%)",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        <Heart size={90} color="#ff8fb8" style={{ top: 60, left: 90, transform: "rotate(-14deg)" }} />
        <Heart size={56} color="#c9a7ff" style={{ top: 120, right: 140, transform: "rotate(12deg)" }} />
        <Heart size={70} color="#f0619a" style={{ bottom: 70, right: 90, transform: "rotate(-8deg)" }} />
        <Heart size={44} color="#ffb3cb" style={{ bottom: 110, left: 170 }} />
        <div style={{ fontSize: 34, letterSpacing: 8, color: "#9a5a78", textTransform: "uppercase", display: "flex" }}>
          someone made a little something
        </div>
        <div style={{ fontSize: 96, color: "#5b2140", marginTop: 18, fontStyle: "italic", display: "flex" }}>
          for {name}
        </div>
        <div
          style={{
            marginTop: 36,
            padding: "16px 40px",
            borderRadius: 999,
            background: "#f0619a",
            color: "white",
            fontSize: 32,
            display: "flex",
          }}
        >
          tap to open your surprise
        </div>
      </div>
    ),
    size
  );
}
