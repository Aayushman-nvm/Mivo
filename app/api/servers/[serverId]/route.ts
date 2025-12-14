import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";

export async function DELETE(
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

    // Only server owner can delete
    const server = await db.server.findUnique({
      where: {
        id: serverId,
        profileId: profile.id, // Must be owner
      },
    });

    if (!server) {
      return new NextResponse("Not authorized to delete this server", {
        status: 403,
      });
    }

    await db.server.delete({
      where: {
        id: serverId,
      },
    });

    return NextResponse.json({ message: "Server deleted successfully" });
  } catch (error) {
    console.error("[SERVER_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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

    const { name, imageUrl } = await req.json();

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!name || !imageUrl) {
      return new NextResponse("Name and image are required", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        name,
        imageUrl,
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[SERVER_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
