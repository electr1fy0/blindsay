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
          background:
            "linear-gradient(135deg, #0f0f11 0%, #141416 40%, #1a1a1e 100%)",
          fontFamily: '"Geist"',
          color: "#f4f4f6",
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
                border: "3px solid rgba(255,255,255,0.15)",
                boxShadow: "0 0 0 8px rgba(255,255,255,0.05)",
              }}
            />
          ) : (
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid rgba(255,255,255,0.12)",
                boxShadow: "0 0 0 8px rgba(255,255,255,0.05)",
                fontSize: 48,
                fontWeight: 500,
                color: "rgba(255,255,255,0.6)",
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
                  color: "rgba(255,255,255,0.5)",
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
              color: "rgba(255,255,255,0.4)",
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
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: "rgba(0, 185, 255, 0.7)",
              textTransform: "uppercase",
            }}
          >
            blindsay
          </span>
          <span
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.2)",
              fontWeight: 400,
            }}
          >
            ·
          </span>
          <span
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.25)",
              fontWeight: 400,
            }}
          >
            say the things you never said
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
