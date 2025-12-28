"use client";

import { cn } from "@/lib/utils";

interface ShimmerProps {
    className?: string;
    rows?: number;
}

export const Shimmer = ({ className = "", rows = 3 }: ShimmerProps) => {
    return (
        <div className={cn("space-y-4 p-6", className)}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Project name shimmer */}
                        <div className="col-span-5 space-y-2">
                            <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
                            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
                        </div>

                        {/* Status shimmer */}
                        <div className="col-span-3">
                            <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-24"></div>
                        </div>

                        {/* Priority shimmer */}
                        <div className="col-span-2">
                            <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-20 mx-auto"></div>
                        </div>

                        {/* Date shimmer */}
                        <div className="col-span-2">
                            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-20 ml-auto"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Shimmer;
