"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { Channel } from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

const MediaRoom = ({ chatId, video, audio }: MediaRoomProps) => {
  const { user } = useUser();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user?.firstName) return;

    const name = `${user.firstName} ${user.lastName || ""}`.trim();

    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=${chatId}&identity=${name}`,
        );

        if (!resp.ok) {
          const errorText = await resp.text();
          console.error("LiveKit token fetch failed:", resp.status, errorText);
          setError(`Failed to connect: ${resp.status}`);
          return;
        }

        const data = await resp.json();

        if (!data.token) {
          console.error("No token in response:", data);
          setError("No token received from server");
          return;
        }

        setToken(data.token);
      } catch (error) {
        console.error("LiveKit error:", error);
        setError("Connection failed");
      }
    })();
  }, [user?.firstName, user?.lastName, chatId]);

  if (error) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          Check console for details
        </p>
      </div>
    );
  }

  if (token === "") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};

export default MediaRoom;
