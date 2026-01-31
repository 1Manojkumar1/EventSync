"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Popover = ({ children }: { children: React.ReactNode }) => {
    return <div className="relative inline-block">{children}</div>;
};

const PopoverTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={cn(className)}
            {...props}
        />
    );
});
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    // Simple state management for the popover would go here if this was a real component
    // For now, we'll make it appear on hover via CSS in the parent or just use a simple block
    return (
        <div
            ref={ref}
            className={cn(
                "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 invisible group-hover:visible absolute top-full mt-2 left-1/2 -translate-x-1/2",
                className
            )}
            {...props}
        />
    );
});
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
