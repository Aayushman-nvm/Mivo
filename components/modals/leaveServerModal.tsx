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
import { ServerWithMembersWithProfile } from "@/types";
import { useRouter } from "next/navigation";

export function LeaveServerModal() {
  const { isOpen, onClose, type, data } = useModal(); 
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isModalOpen = isOpen && type === "leaveServer";
  const { server } = data as { server: ServerWithMembersWithProfile };

  const onLeave = async () => {
    try {
      setIsLoading(true);

      await axios.patch(`/api/servers/${server?.id}/leave`);

      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Failed to leave server", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!server) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black dark:bg-zinc-900 dark:text-white p-0 overflow-hidden max-w-md w-full">
        <DialogHeader className="pt-6 sm:pt-8 px-4 sm:px-6">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
            Leave {server.name}
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            Are you sure you want to leave{" "}
            <span className="font-semibold text-indigo-500">{server.name}</span>
            ? You will lose access to this server and all its channels.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 sm:p-8 pt-0">
          <div className="flex items-center justify-center w-full mb-6">
            <AlertTriangle className="h-8 w-8 text-rose-500" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              disabled={isLoading}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={isLoading}
              onClick={onLeave}
            >
              {isLoading ? "Leaving..." : "Leave Server"}
              <Trash2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
