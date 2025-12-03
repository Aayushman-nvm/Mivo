"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value?: string;
  endpoint: "messageFile" | "serverImage";
}

export const FileUpload = ({ onChange, value, endpoint }: FileUploadProps) => {
  const fileType = value?.split(".").pop();

  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-32 w-32 sm:h-40 sm:w-40 mx-auto">
        <Image
          fill
          src={value}
          alt="Upload"
          className="rounded-full object-cover"
        />
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm hover:bg-rose-600 transition"
          type="button"
          aria-label="Remove image"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone<OurFileRouter, typeof endpoint>
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].ufsUrl);
      }}
      onUploadError={(error: Error) => {
        console.error(error);
      }}
      appearance={{
        label: {
          color: "#6366f1",
        },
        allowedContent: {
          color: "#71717a",
        },
      }}
      className="ut-label:text-sm sm:ut-label:text-base ut-allowed-content:text-xs sm:ut-allowed-content:text-sm cursor-pointer"
    />
  );
};
