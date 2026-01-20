import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const roomName = req.nextUrl.searchParams.get("room");
  const identity = req.nextUrl.searchParams.get("identity");

  if (!roomName || !identity) {
    return NextResponse.json(
      { error: "Missing room or identity" },
      { status: 400 },
    );
  }

  // Create an access token
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: identity,
      ttl: "10m", // Token expires in 10 minutes
    },
  );

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await at.toJwt();
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  return NextResponse.json({ token, serverUrl: livekitUrl });
}
