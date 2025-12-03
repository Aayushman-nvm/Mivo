"use client";

import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/modeToggle";

export const NavigationFooter = () => {
  return (
    <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
      <ModeToggle />
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-[48px] w-[48px]",
          },
        }}
      />
    </div>
  );
};
