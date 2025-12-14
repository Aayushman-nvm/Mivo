import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { serverId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID required", { status: 400 });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId,
        profileId: {
          not: profile.id,
        },
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
    });

    if (!server) {
      return new NextResponse("Not a member of this server", { status: 403 });
    }

    await db.member.deleteMany({
      where: {
        serverId,
        profileId: profile.id,
      },
    });

    return NextResponse.json({ message: "Left server successfully" });
  } catch (error) {
    console.error("[SERVER_LEAVE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
