"use client";

import { useState } from "react";
import axios from "axios";
import { AlertTriangle, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModalStore";
import { useRouter } from "next/navigation";

export function DeleteChannelModal() {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isModalOpen = isOpen && type === "deleteChannel";
  const { server, channel } = data;

  const onDelete = async () => {
    try {
      setIsLoading(true);

      await axios.delete(`/api/channels/${channel?.id}?serverId=${server?.id}`);

      onClose();
      router.refresh();
      router.push(`/servers/${server?.id}`);
    } catch (error) {
      console.error("Failed to delete channel", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!server || !channel) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black dark:bg-zinc-900 dark:text-white p-0 overflow-hidden max-w-md w-full">
        <DialogHeader className="pt-6 sm:pt-8 px-4 sm:px-6">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
            Delete Channel
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base text-zinc-500 dark:text-zinc-400 space-y-2">
            <p>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-indigo-500 dark:text-indigo-400">
                #{channel.name}
              </span>
              ?
            </p>
            <p className="text-xs sm:text-sm">
              This action cannot be undone. All messages in this channel will be
              lost.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 sm:p-6 pt-0 space-y-4">
          {/* Warning Banner */}
          <div className="flex items-center gap-3 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 rounded-md p-3 sm:p-4">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-rose-500 shrink-0" />
            <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-medium">
              Warning: This will permanently delete all channel data
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              className="flex-1 h-10 sm:h-11"
              disabled={isLoading}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-10 sm:h-11"
              disabled={isLoading}
              onClick={onDelete}
            >
              {isLoading ? (
                <>
                  <span className="animate-pulse">Deleting...</span>
                </>
              ) : (
                <>
                  Delete Channel
                  <Trash2 className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
