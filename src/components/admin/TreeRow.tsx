import React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { classNames } from "@/utils/admin";

interface TreeRowProps {
    depth?: number;
    selected: boolean;
    onClick: () => void;
    expanded?: boolean;
    expandable?: boolean;
    icon: React.ReactNode;
    label: React.ReactNode;
    right?: React.ReactNode;
    title?: string;
}

export function TreeRow({ depth = 0, selected, onClick, expanded, expandable = false, icon, label, right, title }: TreeRowProps) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={classNames(
                "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm transition hover:bg-muted/60",
                selected ? "bg-muted/80 ring-1 ring-muted-foreground/20 shadow-sm" : ""
            )}
            style={{ paddingLeft: 8 + depth * 18 }}
        >
            <span className="w-4 text-muted-foreground">
                {expandable ? expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" /> : null}
            </span>
            <span className="w-4 text-muted-foreground">{icon}</span>
            <span className="min-w-0 flex-1 truncate font-medium text-foreground/90">{label}</span>
            {right}
        </button>
    );
}
