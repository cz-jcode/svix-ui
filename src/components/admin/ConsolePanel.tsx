import { useState } from "react";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { classNames, pretty } from "@/utils/admin";
import { ApiHistoryEntry } from "@/types/svix";

interface ConsolePanelProps {
    history: ApiHistoryEntry[];
    isOpen: boolean;
    onToggle: () => void;
    height: number;
    setHeight: (h: number) => void;
}

export function ConsolePanel({ history, isOpen, onToggle, height, setHeight }: ConsolePanelProps) {
    const [expandedIds, setExpandedIds] = useState(new Set<number | string>());
    const lastSystemMessage = history.find(e => e.type === "system");

    const toggleExpand = (id: number | string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedIds(next);
    };

    return (
        <div
            className={classNames(
                "fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-2xl transition-all duration-300 flex flex-col",
                isOpen ? "" : "h-10"
            )}
            style={isOpen ? { height: `${height}px` } : {}}
        >
            {/* Header / Grabber */}
            <div
                className="flex h-10 shrink-0 items-center justify-between px-4 cursor-pointer hover:bg-muted/50 border-b select-none"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4 shrink-0 overflow-hidden">
                    <div className="flex items-center gap-2 shrink-0">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold whitespace-nowrap">Console ({history.length})</span>
                    </div>

                    <div className="hidden md:flex items-center gap-4 text-[10px] text-muted-foreground border-l pl-4 ml-2 overflow-hidden">
                        <p className="font-medium whitespace-nowrap">
                            © {new Date().getFullYear()} <a href="https://github.com/sopak" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Kamil Sopko</a> & <a href="https://github.com/cz-jcode" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors italic">J-CODE</a> SVIX UI Admin
                        </p>
                        <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded border border-border/40">v{import.meta.env.PACKAGE_VERSION || '0.0.0'}</span>
                            <span className="uppercase tracking-wider opacity-70">MIT License</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 flex-1 justify-end min-w-0">
                    {!isOpen && lastSystemMessage && (
                        <div className={classNames(
                            "flex items-center gap-2 text-[11px] px-3 py-1 rounded-full border shadow-sm truncate max-w-[60%] animate-in fade-in slide-in-from-right-2",
                            lastSystemMessage.kind === "error" ? "bg-red-500 text-white border-red-600 font-bold" : "bg-emerald-500 text-white border-emerald-600 font-bold"
                        )}>
                            {lastSystemMessage.kind === "error" ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                            <span className="truncate">{lastSystemMessage.text}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        {isOpen && (
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setHeight(Math.max(200, height - 100))}>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setHeight(Math.min(window.innerHeight - 100, height + 100))}>
                                    <ChevronUp className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                    </div>
                </div>
            </div>

            {/* Content */}
            {isOpen && (
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1 font-mono text-xs">
                        {history.map((entry) => {
                            if (entry.type === "system") {
                                return (
                                    <div key={entry.id} className={classNames(
                                        "flex items-center gap-3 p-2 rounded-lg border",
                                        entry.kind === "error" ? "bg-red-50/50 border-red-100 text-red-900" : "bg-emerald-50/50 border-emerald-100 text-emerald-900"
                                    )}>
                                        <div className="w-16 shrink-0 text-[10px] uppercase font-extrabold opacity-70">System</div>
                                        <div className="flex-1 flex items-center gap-2 font-bold">
                                            {entry.kind === "error" ? <AlertTriangle className="h-3.5 w-3.5 text-red-600" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                                            <span>{entry.text}</span>
                                        </div>
                                        <span className="w-20 text-right opacity-50">{entry.timestamp}</span>
                                    </div>
                                );
                            }
                            const isExpanded = expandedIds.has(entry.id);
                            const isSuccess = entry.ok;
                            return (
                                <div key={entry.id} className="border rounded-lg overflow-hidden">
                                    <div
                                        className={classNames(
                                            "flex items-center gap-3 p-2 cursor-pointer hover:bg-muted/50",
                                            isExpanded ? "bg-muted/30" : ""
                                        )}
                                        onClick={() => toggleExpand(entry.id)}
                                    >
                                        <span className="w-16 shrink-0 text-muted-foreground uppercase font-extrabold">{entry.method}</span>
                                        <span className="flex-1 truncate font-bold text-foreground/90">{entry.path}</span>
                                        <Badge
                                            variant={isSuccess ? "outline" : "destructive"}
                                            className={classNames(
                                                "font-mono text-[10px] px-1.5 py-0 font-bold",
                                                isSuccess ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : ""
                                            )}
                                        >
                                            {entry.status || "ERR"}
                                        </Badge>
                                        <span className="w-16 text-right text-muted-foreground">{entry.durationMs}ms</span>
                                        <span className="w-20 text-right text-muted-foreground">{entry.timestamp}</span>
                                        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                    </div>

                                    {isExpanded && (
                                        <div className="p-3 bg-muted/20 border-t grid gap-4 md:grid-cols-2">
                                            <div>
                                                <div className="mb-1 text-[10px] uppercase text-muted-foreground font-bold">Request Body</div>
                                                <pre className="p-2 rounded bg-background border max-h-60 overflow-auto whitespace-pre-wrap break-all">
                                                    {entry.requestBody ? pretty(entry.requestBody) : "No body"}
                                                </pre>
                                            </div>
                                            <div>
                                                <div className="mb-1 text-[10px] uppercase text-muted-foreground font-bold">Response Body</div>
                                                <pre className="p-2 rounded bg-background border max-h-60 overflow-auto whitespace-pre-wrap break-all">
                                                    {(entry as any).error ? `Error: ${(entry as any).error}` : pretty(entry.body)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {!history.length && <div className="p-8 text-center text-muted-foreground italic">No API calls recorded yet.</div>}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}
