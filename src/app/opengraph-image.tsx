import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "Andre and Bebe wedding website preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Image() {
  const photo = await readFile(path.join(process.cwd(), "public/media/andre-bebe-car-portrait.jpg"));
  const photoUrl = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          height: "100%",
          width: "100%",
          overflow: "hidden",
          background: "#1f1d12",
          color: "#fffaf3",
          fontFamily: "Georgia, serif",
        }}
      >
        <img
          src={photoUrl}
          alt=""
          width={1320}
          height={1979}
          style={{
            position: "absolute",
            inset: 0,
            height: "100%",
            width: "100%",
            objectFit: "cover",
            objectPosition: "50% 42%",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(20,21,17,0.52)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 80px 110px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#eef0e6",
              fontFamily: "Arial, sans-serif",
              fontSize: 20,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            We&apos;re getting married
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              color: "#fffaf3",
              fontSize: 124,
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: 0.95,
            }}
          >
            Andre &amp; Bebe
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              color: "#eef0e6",
              fontFamily: "Arial, sans-serif",
              fontSize: 21,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            May 30, 2027 / Saint Paul + Minneapolis, Minnesota
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            display: "flex",
            width: "100%",
            height: 72,
            alignItems: "center",
            justifyContent: "center",
            background: "#59604d",
            color: "#fffaf3",
            fontFamily: "Arial, sans-serif",
            fontSize: 18,
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Andre and Bebe&apos;s wedding weekend
        </div>
      </div>
    ),
    size,
  );
}
