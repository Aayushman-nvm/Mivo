"use client";

import { useState } from "react";
import axios from "axios";
import { ShieldAlert, ShieldCheck, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModalStore";
import { ServerWithMembersWithProfile } from "@/types";
import { UserAvatar } from "../userAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MemberRole } from "@prisma/client";
import { useRouter } from "next/navigation";

const roleIconMap: Record<MemberRole, React.ReactNode> = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 text-rose-500" />,
};

export function MembersModal() {
  const { isOpen, onClose, type, data } = useModal();
  const [loadingId, setLoadingId] = useState<string>("");
  const router = useRouter();

  const isModalOpen = isOpen && type === "members";
  const { server } = data as { server: ServerWithMembersWithProfile };

  const onKick = async (memberId: string) => {
    try {
      setLoadingId(memberId);
      await axios.delete(
        `/api/members/${memberId}?serverId=${server.id}`
      );
      router.refresh();
    } catch (error) {
      console.error("Failed to remove member", error);
    } finally {
      setLoadingId("");
    }
  };

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId);

      await axios.patch(
        `/api/members/${memberId}?serverId=${server.id}`,
        { role }
      );

      router.refresh();
    } catch (error) {
      console.error("Failed to update member role", error);
    } finally {
      setLoadingId("");
    }
  };

  if (!server) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black dark:bg-zinc-900 dark:text-white p-0 overflow-hidden max-w-md w-full">
        <DialogHeader className="pt-6 sm:pt-8 px-4 sm:px-6">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
            Manage members
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            View and update roles for members of{" "}
            <span className="font-semibold text-indigo-500 dark:text-indigo-400">
              {server.name}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 max-h-[340px] overflow-y-auto">
          {server.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
            >
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={member.profile.imageUrl ?? ""}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                />
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-medium">
                    {member.profile.name}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {member.profile.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {roleIconMap[member.role]}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loadingId === member.id}
                      className="text-xs sm:text-sm"
                    >
                      {member.role.toLowerCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="text-xs sm:text-sm"
                  >
                    <DropdownMenuItem
                      onClick={() => onRoleChange(member.id, "GUEST")}
                    >
                      Guest
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onRoleChange(member.id, "MODERATOR")}
                    >
                      Moderator
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onRoleChange(member.id, "ADMIN")}
                    >
                      Admin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={loadingId === member.id}
                  onClick={() => onKick(member.id)}
                  className="h-8 w-8 text-rose-500 hover:text-rose-600"
                  aria-label="Remove member"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {server.members.length === 0 && (
            <p className="text-xs sm:text-sm text-center text-zinc-500 dark:text-zinc-400">
              No members found.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
