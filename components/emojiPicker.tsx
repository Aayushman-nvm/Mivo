"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";
import { EmojiClickData } from "emoji-picker-react";
import EmojiPickerReact from "emoji-picker-react";

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open emoji picker"
          className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition" 
        >
          <Smile className="h-5 w-5" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        sideOffset={12}
        align="end"
        className="bg-transparent border-none shadow-none p-0"
      >
        <div className="w-[min(90vw,352px)]">
          <EmojiPickerReact
            onEmojiClick={(emojiData: EmojiClickData) =>
              onChange(emojiData.emoji)
            }
            lazyLoadEmojis
            height={350}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
