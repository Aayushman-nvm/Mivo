"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Hash, User, X } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface ServerSearchItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export interface ServerSearchSection {
  label: string;
  type: "channel" | "member";
  data?: ServerSearchItem[];
}

export interface ServerSearchProps {
  data: ServerSearchSection[];
}

function ServerSearch({ data }: ServerSearchProps) {
  const router = useRouter();
  const params = useParams();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cmdOpen, setCmdOpen] = useState(false);

  const hasAnyItems = data.some(
    (section) => section.data && section.data.length > 0
  );

  const flattened = useMemo(
    () =>
      data.flatMap((section) =>
        (section.data || []).map((item) => ({
          ...item,
          sectionLabel: section.label,
          sectionType: section.type as "channel" | "member",
        }))
      ),
    [data]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return flattened;
    const q = query.toLowerCase();
    return flattened.filter((item) => item.name.toLowerCase().includes(q));
  }, [flattened, query]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const onTriggerClick = () => {
    if (!hasAnyItems) return;
    setOpen((prev) => !prev);
  };

  const onClear = () => {
    setQuery("");
  };

  const navigateFromItem = (id: string, type: "channel" | "member") => {
    if (type === "channel") {
      router.push(`/servers/${params.serverId}/channels/${id}`);
    } else {
      router.push(`/servers/${params.serverId}/conversations/${id}`);
    }
    setOpen(false);
    setCmdOpen(false);
  };

  return (
    <>
      {/* Inline trigger + dropdown (width follows sidebar via w-full) */}
      <div className="relative">
        <button
          type="button"
          onClick={onTriggerClick}
          disabled={!hasAnyItems}
          className="group flex items-center w-full rounded-md px-2 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-200/70 dark:bg-zinc-800/70 hover:bg-zinc-300/80 dark:hover:bg-zinc-700/80 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          <Search className="h-3.5 w-3.5 mr-2 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
          <span className="flex-1 text-left truncate">
            {hasAnyItems
              ? "Search channels and members"
              : "Nothing to search yet"}
          </span>
          <kbd className="hidden sm:inline-flex items-center rounded bg-zinc-300/80 dark:bg-zinc-700/80 px-1 py-0.5 text-[10px] font-medium text-zinc-700 dark:text-zinc-200 border border-zinc-300/80 dark:border-zinc-600/80">
            Ctrl K
          </kbd>
        </button>

        {open && hasAnyItems && (
          <div className="absolute z-30 mt-1 w-full rounded-md bg-[#313338] text-zinc-100 shadow-lg border border-[#202225]">
            {/* Search input */}
            <div className="flex items-center px-2 py-1 border-b border-[#202225] gap-1.5">
              <Search className="h-3 w-3 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-xs text-zinc-100 placeholder:text-zinc-500"
                placeholder="Search channels and members..."
              />
              {query && (
                <button
                  type="button"
                  onClick={onClear}
                  className="p-0.5 text-zinc-400 hover:text-zinc-200 transition"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <p className="px-3 py-2 text-xs text-zinc-500">
                  No results found.
                </p>
              )}

              {filtered.map((item) => (
                <button
                  key={`${item.sectionType}-${item.id}`}
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-[#3A3C43] transition"
                  onClick={() => navigateFromItem(item.id, item.sectionType)}
                >
                  <span className="text-zinc-400">
                    {item.icon ??
                      (item.sectionType === "channel" ? (
                        <Hash className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      ))}
                  </span>
                  <span className="flex-1 truncate text-zinc-100">
                    {item.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                    {item.sectionType}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Global Command dialog with Ctrl/Cmd+K */}
      <CommandDialog
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        className="w-[90vw] sm:max-w-md"
      >
        <CommandInput
          placeholder="Search channels and members..."
          className="text-sm sm:text-base"
        />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty className="text-xs sm:text-sm">
            No results found.
          </CommandEmpty>

          {/* Channels */}
          {data
            .filter(
              (section) =>
                section.type === "channel" && (section.data?.length ?? 0) > 0
            )
            .map((section) => (
              <CommandGroup
                key={section.label}
                heading={section.label}
                className="text-xs"
              >
                {section.data!.map((item) => (
                  <CommandItem
                    key={`channel-${item.id}`}
                    value={item.name}
                    onSelect={() => navigateFromItem(item.id, "channel")}
                    className="text-xs"
                  >
                    <Hash className="mr-2 h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                    <span className="flex-1 truncate">{item.name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                      channel
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}

          {/* Members */}
          {data
            .filter(
              (section) =>
                section.type === "member" && (section.data?.length ?? 0) > 0
            )
            .map((section) => (
              <CommandGroup
                key={section.label}
                heading={section.label}
                className="text-xs"
              >
                {section.data!.map((item) => (
                  <CommandItem
                    key={`member-${item.id}`}
                    value={item.name}
                    onSelect={() => navigateFromItem(item.id, "member")}
                    className="text-xs"
                  >
                    <User className="mr-2 h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                    <span className="flex-1 truncate">{item.name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                      member
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export default ServerSearch;
