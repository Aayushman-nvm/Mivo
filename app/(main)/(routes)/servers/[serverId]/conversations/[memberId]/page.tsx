import ChatHeader from "@/components/chat/chatHeader";
import ChatMessages from "@/components/chat/chatMessages";
import ChatInput from "@/components/chat/chatInput";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";
import MediaRoom from "@/components/mediaRoom";

interface MemberIdPageProps {
  memberId: string;
  serverId: string;
}

interface searchParamsProps {
  video?: string | boolean | undefined;
}

const MemberIdPage = async ({
  params,
  searchParams,
}: {
  params: Promise<MemberIdPageProps>;
  searchParams: searchParamsProps;
}) => {
  const profile = await currentProfile();
  const { serverId, memberId } = await params;

  if (!profile) {
    redirect("/sign-in");
  }

  const currentMember = await db.member.findFirst({
    where: {
      serverId,
      profileId: profile.id,
    },
    include: {
      profile: true,
    },
  });

  if (!currentMember) {
    redirect("/");
  }

  const conversation = await getOrCreateConversation(
    currentMember.id,
    memberId,
  );

  if (!conversation) {
    redirect(`/servers/${serverId}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember = memberOne.id === currentMember.id ? memberTwo : memberOne;

  const isVideo = searchParams.video === "true";

  return (
    <div className="h-full flex flex-col">
      <ChatHeader
        imageUrl={otherMember.profile.imageUrl}
        name={otherMember.profile.name}
        serverId={serverId}
        type="conversation"
      />

      {isVideo && (
        <MediaRoom chatId={conversation.id} video={true} audio={true} />
      )}

      {!isVideo && (
        <>
          <ChatMessages
            member={currentMember}
            name={otherMember.profile.name}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/directMessages"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl="/api/socket/directMessages"
            socketQuery={{
              conversationId: conversation.id,
            }}
          />

          <ChatInput
            name={otherMember.profile.name}
            type="conversation"
            apiUrl="/api/socket/directMessages"
            query={{
              conversationId: conversation.id,
            }}
          />
        </>
      )}
    </div>
  );
};

export default MemberIdPage;
