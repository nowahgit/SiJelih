import { Skeleton } from "@/components/ui/Skeleton";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

export function SkeletonDashboardPanel() {
  return (
    <div className="flex flex-col gap-[1px]">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white p-[12px_16px] flex flex-col gap-[12px] border-b border-[#f3f4f6]">
          <div className="flex justify-between items-start">
            <Skeleton className="w-[80px] h-[20px] rounded-full" />
            <Skeleton className="w-[60px] h-[14px]" />
          </div>
          <Skeleton className="w-full h-[14px]" />
          <Skeleton className="w-[75%] h-[14px]" />
        </div>
      ))}
    </div>
  );
}
