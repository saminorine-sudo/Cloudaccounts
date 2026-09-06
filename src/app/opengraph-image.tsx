import { ImageResponse } from "next/og";

/**
 * Default Open Graph card.
 *
 * Generated rather than shipped as a static image so it always matches the
 * brand, and so per-page cards can be added later by copying this file into a
 * route segment. Uses only system-safe styling — no external font fetch, which
 * would make social preview generation fragile.
 */
export const alt = "CloudAccounts — Accounting that helps your business move forward";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#166534",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "30px",
              fontWeight: 700,
            }}
          >
            ↗
          </div>
          <div style={{ display: "flex", fontSize: "34px", fontWeight: 700 }}>
            <span style={{ color: "#0F172A" }}>Cloud</span>
            <span style={{ color: "#166534" }}>Accounts</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "68px",
              fontWeight: 700,
              color: "#0F172A",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              maxWidth: "900px",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            Accounting that helps your business move forward.
          </div>
          <div
            style={{
              marginTop: "28px",
              fontSize: "30px",
              color: "#64748B",
              maxWidth: "820px",
            }}
          >
            Accounting, tax and business support for UK businesses.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #E2E8F0",
            paddingTop: "28px",
            fontSize: "24px",
            color: "#64748B",
          }}
        >
          <span>Sole traders · Contractors · Limited companies</span>
          <span style={{ color: "#166534", fontWeight: 600 }}>
            Book a free consultation
          </span>
        </div>
      </div>
    ),
    size,
  );
}
