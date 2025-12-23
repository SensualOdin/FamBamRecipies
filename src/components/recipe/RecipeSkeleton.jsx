import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const RecipeSkeleton = () => {
  return (
    <Card className="flex flex-col h-full bg-white/70 backdrop-blur-sm rounded-[32px] overflow-hidden border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="relative h-64 overflow-hidden">
        <Skeleton className="w-full h-full rounded-none bg-slate-200/50" />
      </div>
      <CardContent className="p-4 sm:p-6 flex flex-col flex-1 gap-4">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16 bg-slate-200/50" />
          <Skeleton className="h-4 w-16 bg-slate-200/50" />
        </div>
        <Skeleton className="h-8 w-3/4 bg-slate-200/50" />
        <Skeleton className="h-4 w-full bg-slate-200/50" />
        <Skeleton className="h-4 w-full bg-slate-200/50" />
        <div className="flex items-center gap-4 py-4 border-y border-slate-100/50">
          <Skeleton className="h-4 w-20 bg-slate-200/50" />
          <Skeleton className="h-4 w-20 bg-slate-200/50" />
        </div>
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-xl bg-slate-200/50" />
            <Skeleton className="h-10 w-10 rounded-xl bg-slate-200/50" />
          </div>
          <Skeleton className="h-11 w-24 rounded-2xl bg-slate-200/50" />
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeSkeleton;

