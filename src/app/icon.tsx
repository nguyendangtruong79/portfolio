import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#090A0F",
          borderRadius: 8,
          border: "1.5px solid #10B981",
          color: "#10B981",
          fontFamily: "monospace",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        {"</>"}
      </div>
    ),
    {
      ...size,
    }
  );
}
