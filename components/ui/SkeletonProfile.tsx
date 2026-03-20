import { Skeleton } from "@/components/ui/Skeleton";

export function SkeletonProfile() {
  return (
    <div className="flex flex-col gap-[24px] w-full">
      <div className="flex items-center gap-[16px] p-[20px] bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <Skeleton className="w-[80px] h-[80px] rounded-full" />
        <div className="flex flex-col gap-[8px]">
          <Skeleton className="w-[160px] h-[20px]" />
          <Skeleton className="w-[120px] h-[14px]" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px]">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="w-full h-[88px] border border-[#e5e7eb] rounded-[8px]" />)}
      </div>
    </div>
  );
}
