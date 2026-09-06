import { ImageResponse } from "next/og";

/**
 * Favicon, generated from the brand mark so it stays in step with the logo.
 * The ascending line inside a rounded green tile, matching
 * `components/layout/logo.tsx`.
 */
export const size = { width: 32, height: 32 };
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
          background: "#166534",
          borderRadius: "7px",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 17.5 9.5 11l3.5 3.2L20 6.5" />
          <path d="M15.2 6.5H20v4.7" />
        </svg>
      </div>
    ),
    size,
  );
}
