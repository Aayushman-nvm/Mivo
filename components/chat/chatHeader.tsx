import React from "react";
import { Hash } from "lucide-react";
import { MobileToggle } from "../mobileToggle";
import { UserAvatar } from "../userAvatar";
import { SocketIndicator } from "../socketIndicator";
import ChatVideoButton from "./chatVideoButton";

interface ChatHeaderProps {
  serverId: string;
  name: string;
  type: "channel" | "conversation";
  imageUrl?: string | null;
}

const ChatHeader = ({ serverId, name, type, imageUrl }: ChatHeaderProps) => {
  return (
    <header className="sticky top-0 flex items-center gap-x-3 px-4 h-14 border-b">
      <div className="md:hidden">
        <MobileToggle serverId={serverId} />
      </div>

      {type === "channel" && <Hash className="w-5 h-5 text-muted-foreground" />}
      {type === "conversation" && (
        <UserAvatar src={imageUrl!} className="h-8 w-8 md:h-8 md:w-8 mr-2" />
      )}

      <p className="font-semibold text-sm md:text-base truncate">{name}</p>
      <div className="ml-auto flex items-center">
        {type === "conversation" && <ChatVideoButton />}
        <SocketIndicator />
      </div>
    </header>
  );
};

export default ChatHeader;
