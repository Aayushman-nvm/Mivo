import { Menu } from "lucide-react";
import React from "react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { NavigationSidebar } from "./navigation/navigationSidebar";
import ServerSidebar from "./server/serverSidebar";

export const MobileToggle = ({ serverId }: { serverId: string }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0 flex flex-row gap-x-0 w-[300px]">
        <NavigationSidebar />
        <ServerSidebar serverId={serverId} />
      </SheetContent>
    </Sheet>
  );
};
