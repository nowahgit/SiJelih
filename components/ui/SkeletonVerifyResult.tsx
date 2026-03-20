import { Skeleton } from "@/components/ui/Skeleton";

export function SkeletonVerifyResult() {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[20px] flex flex-col gap-[14px]">
      <div className="flex justify-between items-start">
        <Skeleton className="w-[100px] h-[24px] rounded-[4px]" />
        <Skeleton className="w-[60px] h-[24px]" />
      </div>
      <Skeleton className="w-full h-[14px]" />
      <Skeleton className="w-[85%] h-[14px]" />
      <Skeleton className="w-[60%] h-[14px]" />
      <Skeleton className="w-full h-[8px] rounded-full mt-[4px]" />
      <div className="flex gap-[8px] mt-[6px]">
        <Skeleton className="w-[140px] h-[36px] rounded-[6px]" />
        <Skeleton className="w-[140px] h-[36px] rounded-[6px]" />
      </div>
    </div>
  );
}
