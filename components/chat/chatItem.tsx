"use client";

import React, { useMemo, useState } from "react";
import { Member, MemberRole, Profile } from "@prisma/client";
import Image from "next/image";
import axios from "axios";
import qs from "query-string";
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Pencil,
  Trash,
} from "lucide-react";

import { UserAvatar } from "../userAvatar";
import { ActionTooltip } from "../actionTooltip";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/useModalStore";

interface ChatItemProps {
  id: string;
  content: string;
  member: Member & { profile: Profile };
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
}

const roleIconMap: Record<MemberRole, React.ReactNode> = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-1.5 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-1.5 text-rose-500" />,
};

function getFileType(fileUrl: string) {
  const url = fileUrl.toLowerCase();
  if (url.match(/\.(png|jpg|jpeg|gif|webp)$/)) return "image";
  if (url.match(/\.(mp4|webm|mov)$/)) return "video";
  if (url.match(/\.(mp3|wav|ogg)$/)) return "audio";
  return "file";
}

const ChatItem = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery,
}: ChatItemProps) => {
  const router = useRouter();
  const params = useParams();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const [isLoading, setIsLoading] = useState(false);

  const { onOpen } = useModal();

  const fileType = useMemo(
    () => (fileUrl ? getFileType(fileUrl) : null),
    [fileUrl]
  );

  const isOwner = currentMember?.id === member.id;
  const isAdmin = currentMember?.role === MemberRole.ADMIN;
  const isModerator = currentMember?.role === MemberRole.MODERATOR;
  const canDelete = !deleted && (isOwner || isAdmin || isModerator);
  const canEdit = !deleted && isOwner && !fileUrl;

  const onMemberClick = () => {
    if (member.id === currentMember.id) {
      return;
    }
    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  const onStartEdit = () => {
    setEditValue(content);
    setIsEditing(true);
  };

  const onCancelEdit = () => {
    setEditValue(content);
    setIsEditing(false);
  };

  const onSaveEdit = async () => {
    if (!socketUrl) return;

    try {
      setIsLoading(true);

      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      });

      await axios.patch(url, { content: editValue });

      setIsEditing(false);
      router.refresh();
    } catch (e) {
      console.error("Failed to edit message:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative w-full px-3 sm:px-4 py-2 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40 transition",
        deleted && "opacity-80"
      )}
    >
      {/* Hover actions (top-right) */}
      {(canEdit || canDelete) && (
        <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1">
          {canEdit && (
            <ActionTooltip label="Edit">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={onStartEdit}
                disabled={isLoading}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </ActionTooltip>
          )}

          {canDelete && (
            <ActionTooltip label="Delete">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-rose-600 hover:text-rose-700 dark:text-rose-400"
                onClick={() =>
                  onOpen("deleteMessage", {
                    apiUrl: `${socketUrl}/${id}`,
                    query: socketQuery,
                  })
                }
                disabled={isLoading}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </ActionTooltip>
          )}
        </div>
      )}

      <div className="flex gap-x-3 items-start">
        <button
          type="button"
          className="shrink-0 mt-0.5 cursor-pointer hover:drop-shadow-md transition"
          onClick={onMemberClick}
        >
          <UserAvatar src={member.profile.imageUrl ?? undefined} />
        </button>

        <div className="min-w-0 flex-1">
          {/* Header row */}
          <div className="flex items-baseline gap-x-2 min-w-0">
            <p
              onClick={onMemberClick}
              className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate"
            >
              {member.profile.name}
            </p>

            <ActionTooltip label={member.role}>
              <span className="shrink-0">{roleIconMap[member.role]}</span>
            </ActionTooltip>

            <span className="shrink-0 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>

          {/* Body */}
          <div className="mt-1 text-sm text-zinc-800 dark:text-zinc-200 wrap-break-word">
            {deleted ? (
              <span className="italic text-zinc-500 dark:text-zinc-400">
                This message was deleted.
              </span>
            ) : isEditing ? (
              <div className="flex flex-col gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  disabled={isLoading}
                  className="h-10"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Escape") onCancelEdit();
                    if (e.key === "Enter") onSaveEdit();
                  }}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-10"
                    onClick={onCancelEdit}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="min-h-10"
                    onClick={onSaveEdit}
                    disabled={isLoading || editValue.trim().length === 0}
                  >
                    Save
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Press Enter to save, Esc to cancel.
                </p>
              </div>
            ) : (
              <>
                {/* Text content */}
                {content && <p className="whitespace-pre-wrap">{content}</p>}

                {/* File attachments */}
                {fileUrl && (
                  <div className="mt-2">
                    {fileType === "image" ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full max-w-xs sm:max-w-sm"
                      >
                        <div className="relative aspect-video rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
                          <Image
                            src={fileUrl}
                            alt="attachment"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </a>
                    ) : (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        <FileText className="h-4 w-4 text-zinc-500" />
                        <span className="text-sm underline underline-offset-2">
                          Open attachment
                        </span>
                      </a>
                    )}
                  </div>
                )}

                {/* edited label */}
                {isUpdated && !fileUrl && (
                  <span className="ml-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    (edited)
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
