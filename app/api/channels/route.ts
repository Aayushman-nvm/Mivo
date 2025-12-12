import { NextResponse } from "next/server";
import { ChannelType } from "@prisma/client";

import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    const { name, type, serverId } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Channel name is required", { status: 400 });
    }

    if (!type || !Object.values(ChannelType).includes(type)) {
      return new NextResponse("Invalid channel type", { status: 400 });
    }

    if (!serverId) {
      return new NextResponse("Server ID is required", { status: 400 });
    }

    // Check if user is member of server (not just owner)
    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
    });

    if (!server) {
      return new NextResponse("No access to this server", { status: 403 });
    }

    // Check if channel "general" already exists (only one allowed)
    const existingChannel = await db.channel.findFirst({
      where: {
        name: "general",
        serverId,
      },
    });

    if (name === "general" && existingChannel) {
      return new NextResponse("General channel already exists", {
        status: 400,
      });
    }

    const channel = await db.channel.create({
      data: {
        name,
        type: type as ChannelType,
        profileId: profile.id,
        serverId,
      },
      include: {
        server: true,
        profile: true,
      },
    });

    return NextResponse.json(channel);
  } catch (error) {
    console.log("[CHANNELS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
