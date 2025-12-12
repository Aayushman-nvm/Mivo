import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProfile();
    const { memberId } = params;
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID is required", { status: 400 });
    }

    if (!memberId) {
      return new NextResponse("Member ID is required", { status: 400 });
    }

    // Ensure current user is server owner
    const server = await db.server.findFirst({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Prevent kicking yourself
    const targetMember = server.members.find(
      (member) => member.id === memberId
    );

    if (!targetMember || targetMember.profileId === profile.id) {
      return new NextResponse("Cannot remove this member", { status: 400 });
    }

    const updatedServer = await db.server.update({
      where: {
        id: serverId,
      },
      data: {
        members: {
          delete: {
            id: memberId,
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.error("[MEMBER_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProfile();
    const { memberId } = params;
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const { role } = (await req.json()) as { role?: MemberRole };

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID is required", { status: 400 });
    }

    if (!memberId) {
      return new NextResponse("Member ID is required", { status: 400 });
    }

    if (!role || !Object.values(MemberRole).includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    // Ensure current user is the server owner
    const server = await db.server.findFirst({
      where: {
        id: serverId,
        profileId: profile.id,
      },
    });

    if (!server) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Prevent modifying own role
    const targetMember = await db.member.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!targetMember || targetMember.profileId === profile.id) {
      return new NextResponse("Cannot modify this member", { status: 400 });
    }

    const updatedServer = await db.server.update({
      where: {
        id: serverId,
      },
      data: {
        members: {
          update: {
            where: {
              id: memberId,
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.error("[MEMBER_PATCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
