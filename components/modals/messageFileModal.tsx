"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/fileUpload";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/useModalStore";

const formSchema = z.object({
  fileUrl: z.string().min(1, { message: "file is required." }),
});

function MessageFileModal() {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === "messageFile";

  const apiUrl = data?.apiUrl as string | undefined;
  const query = data?.query as
    | { serverId?: string; channelId?: string }
    | undefined;
  const serverId = query?.serverId;
  const channelId = query?.channelId;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { fileUrl: "" },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isLoading = form.formState.isSubmitting;
  const fileUrl = form.watch("fileUrl");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!apiUrl || !serverId || !channelId) return;

    try {
      await axios.post(
        `${apiUrl}?serverId=${serverId}&channelId=${channelId}`,
        { ...values, content: values.fileUrl }
      );

      form.reset();
      router.refresh();
      handleClose();
    } catch (error) {
      console.error("Error sending file message:", error);
    }
  };

  // Guard: don’t render if modal is open but required data isn’t ready yet
  if (isModalOpen && (!apiUrl || !serverId || !channelId)) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black dark:bg-zinc-900 dark:text-white p-0 overflow-hidden w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader className="pt-6 sm:pt-8 px-4 sm:px-6">
          <DialogTitle className="text-lg sm:text-2xl font-bold text-center">
            Add an attachment
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            Send a file as a message
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 sm:space-y-6"
          >
            <div className="px-4 sm:px-6">
              <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint="messageFile"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="bg-zinc-50 dark:bg-zinc-800/50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isLoading}
                className="w-full sm:w-auto min-h-11"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                // shadcn default variant is "default" (or omit)
                variant="default"
                disabled={isLoading || !fileUrl}
                className="w-full sm:w-auto min-h-11"
              >
                {isLoading ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default MessageFileModal;
