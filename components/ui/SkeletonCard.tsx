import { Skeleton } from "@/components/ui/Skeleton";

export function SkeletonCard() {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[20px] flex flex-col gap-[12px]">
      <div className="flex justify-between items-start">
        <Skeleton className="w-[80px] h-[20px] rounded-full" />
        <Skeleton className="w-[100px] h-[14px]" />
      </div>
      <Skeleton className="w-full h-[14px]" />
      <Skeleton className="w-[75%] h-[14px]" />
      <Skeleton className="w-full h-[6px] rounded-full" />
    </div>
  );
}
