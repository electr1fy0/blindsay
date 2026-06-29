import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const fontUrls = {
  400: "https://fonts.gstatic.com/s/geist/v5/gyBhhwUxId8gMGYQMKR3pzfaWI_RnOM4nQ.ttf",
  500: "https://fonts.gstatic.com/s/geist/v5/gyBhhwUxId8gMGYQMKR3pzfaWI_RruM4nQ.ttf",
  600: "https://fonts.gstatic.com/s/geist/v5/gyBhhwUxId8gMGYQMKR3pzfaWI_RQuQ4nQ.ttf",
} as const;

async function loadFonts() {
  const entries = await Promise.all(
    (Object.entries(fontUrls) as [string, string][]).map(async ([weight, url]) => {
      const res = await fetch(url);
      const data = await res.arrayBuffer();
      return { name: "Geist" as const, data, weight: Number(weight) as 400 | 500 | 600, style: "normal" as const };
    })
  );
  return entries;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { name: true, username: true, image: true },
  });

  const userName = user?.name ?? null;
  const displayUsername = user?.username ?? username;
  const avatarUrl = user?.image ?? null;

  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#ffffff",
          fontFamily: '"Geist"',
          color: "#09090b",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            padding: "60px",
            gap: "24px",
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              width={120}
              height={120}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid rgba(0,0,0,0.08)",
                boxShadow: "0 0 0 8px rgba(0,0,0,0.03)",
              }}
            />
          ) : (
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid rgba(0,0,0,0.06)",
                boxShadow: "0 0 0 8px rgba(0,0,0,0.02)",
                fontSize: 48,
                fontWeight: 500,
                color: "rgba(0,0,0,0.3)",
              }}
            >
              @
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {userName && (
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 400,
                  color: "rgba(0,0,0,0.4)",
                  letterSpacing: "0.02em",
                }}
              >
                {userName}
              </span>
            )}
            <span
              style={{
                fontSize: 64,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              @{displayUsername}
            </span>
          </div>

          <span
            style={{
              fontSize: 22,
              color: "rgba(0,0,0,0.35)",
              fontWeight: 400,
              marginTop: "4px",
            }}
          >
            Anonymous inbox
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: "rgba(0,0,0,0.25)",
              textTransform: "uppercase",
            }}
          >
            blindsay
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
}
