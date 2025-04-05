"use client";

import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { DocsSiteImageLayout } from "./DocsSiteImageLayout";

export function SkeletonDocsSiteImage() {
  return (
    <DocsSiteImageLayout>
      <Skeleton className="flex-1" />
    </DocsSiteImageLayout>
  );
}
