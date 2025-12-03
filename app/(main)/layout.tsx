import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import { NavigationSidebar } from "@/components/navigation/navigationSidebar";
import { db } from "@/lib/db";

async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const profile = await db.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!profile) {
    return redirect("/");
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <main className="md:pl-[72px] h-full">{children}</main>
    </div>
  );
}

export default MainLayout;
