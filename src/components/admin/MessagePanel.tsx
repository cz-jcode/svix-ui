import { useRef, useEffect} from "react";
import { Plus, Trash2, Send, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SvixMessage, SelectedItem, SvixEndpoint } from "@/types/svix";
import { JsonField } from "./JsonField";
import { pretty, classNames, statusTone, statusLabel } from "@/utils/admin";

interface MessagePanelProps {
    selected: SelectedItem;
    messages: SvixMessage[];
    destinations: SvixEndpoint[];
    isBusy: boolean;
    isLoadingMore: boolean;
    readIds: Set<string>;
    onSelect: (appId: string, msg: SvixMessage) => void;
    onLoadMore: (appId: string) => void;
    onResend: (appId: string, msgId: string, endpointId: string) => void;
    onDeleteContent: (appId: string, msgId: string) => void;
    msgSearch: string;
    onSearchChange: (val: string) => void;
    onRefresh: (appId: string) => void;
    messageForm: any;
    setMessageForm: React.Dispatch<React.SetStateAction<any>>;
    createMessage: (appId: string) => Promise<void>;
    eventTypes: any[];
    attemptQuery: () => string;
    loadAttemptsForMessage: (appId: string, msgId: string, query: string) => Promise<void>;
    selectedMessageAttempts: any[];
}

export function MessagePanel({
    selected,
    messages,
    destinations,
    isBusy,
    isLoadingMore,
    readIds,
    onSelect,
    onLoadMore,
    onResend,
    onDeleteContent,
    msgSearch,
    onSearchChange,
    messageForm,
    setMessageForm,
    createMessage,
    eventTypes,
    attemptQuery,
    loadAttemptsForMessage,
    selectedMessageAttempts,
    onTabChange,
}: MessagePanelProps & { onTabChange?: (tab: string) => void }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewport = scrollRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
        if (!viewport) return;

        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            const { scrollTop, scrollHeight, clientHeight } = target;
            
            // If we're within 150px of the bottom, load more
            if (scrollHeight - scrollTop - clientHeight < 150 && !isLoadingMore && selected.appId) {
                onLoadMore(selected.appId);
            }
        };

        viewport.addEventListener("scroll", handleScroll);
        return () => viewport.removeEventListener("scroll", handleScroll);
    }, [isLoadingMore, selected.appId, onLoadMore]);

    if (selected.type === "message-create") {
        return (
            <div className="flex-1 min-h-0 w-full p-6 pb-20 overflow-hidden">
                <ScrollArea className="h-full w-full">
                    <div className="p-1 pb-10">
                        <Card className="rounded-2xl">
                            <CardHeader>
                                <CardTitle>Create Message</CardTitle>
                                <CardDescription>Dispatch a new message to all matching endpoints.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Event Type</Label>
                                        <div className="relative group">
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                                value={messageForm.eventType}
                                                onChange={(e) => setMessageForm((s: any) => ({ ...s, eventType: e.target.value }))}
                                                title={messageForm.eventType}
                                            >
                                                {eventTypes.map((et) => (
                                                    <option key={et.name} value={et.name} title={et.name}>
                                                        {et.name.length > 25 ? `${et.name.substring(0, 25)}...` : et.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Event ID (Optional UID)</Label>
                                        <Input
                                            value={messageForm.eventId}
                                            onChange={(e) => setMessageForm((s: any) => ({ ...s, eventId: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Channels (JSON array)</Label>
                                        <Input
                                            value={messageForm.channels}
                                            onChange={(e) => setMessageForm((s: any) => ({ ...s, channels: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Payload Retention (days)</Label>
                                        <Input
                                            type="number"
                                            value={messageForm.payloadRetentionPeriod}
                                            onChange={(e) => setMessageForm((s: any) => ({ ...s, payloadRetentionPeriod: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <JsonField
                                    label="Payload JSON"
                                    value={messageForm.payload}
                                    onChange={(v) => setMessageForm((s: any) => ({ ...s, payload: v }))}
                                    rows={10}
                                />
                                <Button
                                    onClick={() => selected.appId && createMessage(selected.appId)}
                                    disabled={isBusy || !messageForm.eventType}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create & Send
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </div>
        );
    }

    const selectedMsg = selected.type === "message" || selected.type === "message-attempts" ? (selected.item as SvixMessage) || (messages.find(m => m.id === selected.msgId)) : null;

    return (
        <div className="flex flex-1 h-full gap-6 overflow-hidden p-6 pb-0">
            {/* List Side */}
            <div className="w-[300px] shrink-0 flex flex-col gap-4 min-h-0 h-full pb-20 overflow-hidden">
                <div className="flex flex-col gap-2 shrink-0 px-1">
                    <div className="flex items-center gap-2">
                        <div className="relative w-full group">
                            <select
                                className="flex h-10 w-full rounded-2xl border border-input/50 bg-card/40 px-4 py-1 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 appearance-none shadow-sm cursor-pointer hover:bg-muted/40 hover:border-input transition-all font-medium text-foreground/80"
                                value={msgSearch}
                                onChange={(e) => onSearchChange(e.target.value)}
                                title={msgSearch || "Filter by Event Type: All"}
                            >
                                <option value="">Filter: All</option>
                                {eventTypes.map((et) => (
                                    <option key={et.name} value={et.name} title={et.name}>
                                        {et.name.length > 25 ? `${et.name.substring(0, 25)}...` : et.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <ScrollArea viewportRef={scrollRef} className="flex-1 rounded-2xl border bg-card/30 min-h-0">
                    <div className="p-2 space-y-1">
                        {messages.map((m) => {
                            const isRead = readIds.has(m.id);
                            const isActive = selected.msgId === m.id;
                            return (
                                <div
                                    key={m.id}
                                    className={classNames(
                                        "group relative flex flex-col p-3 rounded-xl cursor-pointer transition-all border",
                                        isActive
                                            ? "bg-muted border-muted-foreground/20 shadow-sm"
                                            : "hover:bg-muted/50 border-transparent",
                                        !isRead && !isActive && "bg-blue-50/50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"
                                    )}
                                    onClick={() => selected.appId && onSelect(selected.appId, m)}
                                >
                                    {!isRead && !isActive && (
                                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 shadow-sm" />
                                    )}
                                    <div className={classNames("text-xs font-mono font-bold text-foreground/90 truncate mb-1 pr-4", isActive && "text-primary dark:text-blue-400 font-extrabold")}>{m.id}</div>
                                    <div className="flex items-center justify-between text-[11px] opacity-60">
                                        <span>{m.timestamp || m.createdAt}</span>
                                        {m.eventId && <span className="truncate ml-2">UID: {m.eventId}</span>}
                                    </div>
                                </div>
                            );
                        })}
                        {selected.appId && (
                            <div className="px-2 pb-2">
                                <Button
                                    variant="ghost"
                                    className="w-full text-[10px] h-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => selected.appId && onLoadMore(selected.appId)}
                                    disabled={isLoadingMore}
                                >
                                    {isLoadingMore ? (
                                        <span className="flex items-center gap-2">
                                            <RefreshCw className="h-3 w-3 animate-spin" />
                                            Loading...
                                        </span>
                                    ) : (
                                        "Load more messages"
                                    )}
                                </Button>
                            </div>
                        )}
                        {!messages.length && !isBusy && <div className="text-center py-10 text-muted-foreground italic text-sm">No messages found.</div>}
                    </div>
                </ScrollArea>
            </div>

            {/* Detail Side */}
            <div className="flex-1 flex flex-col min-w-0 h-full pb-20">
                {selectedMsg ? (
                    <Tabs 
                        value={selected.type === "message-attempts" ? "attempts" : "payload"} 
                        onValueChange={onTabChange}
                        className="flex-1 flex flex-col min-h-0"
                    >
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <TabsList className="bg-muted/50 p-1 rounded-xl">
                                <TabsTrigger value="payload" className="rounded-lg px-4 py-1.5 text-xs font-semibold">Payload</TabsTrigger>
                                <TabsTrigger value="attempts" className="rounded-lg px-4 py-1.5 text-xs font-semibold">Attempts</TabsTrigger>
                            </TabsList>
                            <div className="flex gap-2 shrink-0 ml-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                                    onClick={() => selected.appId && selectedMsg.id && onDeleteContent(selected.appId, selectedMsg.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Purge Payload
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
                            <TabsContent value="payload" className="flex-1 h-full w-full m-0 outline-none overflow-hidden">
                                <ScrollArea className="flex-1 h-full w-full rounded-2xl border bg-card/30 min-h-0">
                                    <div className="p-4 space-y-4 w-full">
                                        <div className="w-full">
                                            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Message Headers & Metadata</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 p-3 rounded-xl bg-muted/30 text-xs font-mono w-full">
                                                <div className="flex justify-between border-b border-muted py-1"><span className="opacity-50 font-semibold">ID:</span> <span className="font-bold text-foreground">{selectedMsg.id}</span></div>
                                                <div className="flex justify-between border-b border-muted py-1"><span className="opacity-50 font-semibold">Event:</span> <span className="font-bold text-foreground">{selectedMsg.eventType}</span></div>
                                                <div className="flex justify-between border-b border-muted py-1"><span className="opacity-50 font-semibold">Created:</span> <span>{selectedMsg.timestamp || selectedMsg.createdAt}</span></div>
                                                <div className="flex justify-between border-b border-muted py-1"><span className="opacity-50 font-semibold">UID:</span> <span className="font-bold text-foreground">{selectedMsg.eventId || "-"}</span></div>
                                                {selectedMsg.tags && selectedMsg.tags.length > 0 && (
                                                    <div className="flex justify-between border-b border-muted py-1 md:col-span-2">
                                                        <span className="opacity-50">Tags:</span>
                                                        <div className="flex gap-1">
                                                            {selectedMsg.tags.map(t => <Badge key={t} variant="outline" className="text-[9px] px-1 py-0">{t}</Badge>)}
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedMsg.channels && selectedMsg.channels.length > 0 && (
                                                    <div className="flex justify-between border-b border-muted py-1 md:col-span-2">
                                                        <span className="opacity-50">Channels:</span>
                                                        <div className="flex gap-1">
                                                            {selectedMsg.channels.map(c => <Badge key={c} variant="secondary" className="text-[9px] px-1 py-0">{c}</Badge>)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Payload Content</div>
                                            <pre className="p-4 rounded-xl bg-muted/30 text-xs overflow-auto border whitespace-pre-wrap leading-relaxed w-full">
                                                {pretty(selectedMsg.payload)}
                                            </pre>
                                        </div>

                                        {destinations.length > 0 && (
                                            <div className="w-full">
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Destinations ({destinations.length})</div>
                                                <div className="space-y-3 w-full">
                                                    {destinations.map((d) => (
                                                        <Card key={d.id} className="rounded-xl border shadow-none bg-card/50 w-full">
                                                            <CardContent className="p-4 w-full">
                                                                <div className="flex items-center justify-between mb-3 w-full">
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="text-xs font-bold truncate mb-1 text-foreground/90">{d.description || d.url}</div>
                                                                        <div className="text-[10px] font-mono font-bold text-muted-foreground truncate">{d.id}</div>
                                                                    </div>
                                                                    <div className="flex gap-2 shrink-0 ml-4">
                                                                        {d.disabled && <Badge variant="destructive" className="text-[9px]">Disabled</Badge>}
                                                                        <Button
                                                                            size="sm"
                                                                            variant="secondary"
                                                                            className="h-8 text-xs shrink-0"
                                                                            onClick={() => selected.appId && selectedMsg.id && onResend(selected.appId, selectedMsg.id, d.id)}
                                                                        >
                                                                            <Send className="h-3 w-3 mr-1.5" /> Resend
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] bg-muted/20 p-2 rounded-lg border w-full">
                                                                    <div className="flex justify-between"><span className="opacity-50">URL:</span> <span className="truncate ml-2">{d.url}</span></div>
                                                                    <div className="flex justify-between"><span className="opacity-50">Version:</span> <span>{d.version}</span></div>
                                                                    {d.uid && <div className="flex justify-between"><span className="opacity-50">UID:</span> <span>{d.uid}</span></div>}
                                                                    {d.rateLimit && <div className="flex justify-between"><span className="opacity-50">Rate Limit:</span> <span>{d.rateLimit}</span></div>}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>


                            <TabsContent value="attempts" className="flex-1 w-full m-0 outline-none overflow-hidden h-full">
                                <div className="h-full w-full flex flex-col gap-3 min-h-0">
                                    <div className="flex-1 min-h-0 w-full overflow-hidden">
                                        <ScrollArea className="flex-1 h-full w-full rounded-2xl border bg-card/30 min-h-0">
                                            <div className={classNames("p-4 space-y-3 w-full", !selectedMessageAttempts.length && "h-full flex items-center justify-center")}>
                                                {selectedMessageAttempts.map((attempt) => (
                                                    <Card key={attempt.id} className="rounded-xl border shadow-none bg-card/50 w-full">
                                                        <CardContent className="p-3 space-y-2 w-full">
                                                            <div className="flex items-start justify-between w-full">
                                                                <div className="flex flex-col min-w-0 mr-2">
                                                                    <div className="text-[11px] font-mono font-bold opacity-70 truncate">{attempt.id}</div>
                                                                    <div className="text-[10px] opacity-60 mt-0.5">{attempt.timestamp}</div>
                                                                </div>
                                                                <div className="flex flex-col items-end shrink-0 gap-1">
                                                                    <Badge variant="outline" className={classNames("text-[9px] px-1.5 py-0 font-bold border-none", statusTone(attempt.status))}>
                                                                        {statusLabel(attempt.status)}
                                                                    </Badge>
                                                                    <div className="text-[9px] font-bold opacity-60">HTTP {attempt.responseStatusCode}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between text-[11px] w-full">
                                                                <div className="font-medium text-muted-foreground truncate flex-1">EP: {attempt.endpointId}</div>
                                                                <div className="shrink-0 ml-2">{attempt.responseDurationMs}ms</div>
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground truncate border-t pt-1 w-full">URL: {attempt.url}</div>
                                                            <Separator className="my-1" />
                                                            <div className="mt-1 rounded bg-muted/50 p-2 max-h-40 overflow-auto scrollbar-hide w-full">
                                                                <pre className="text-[9px] whitespace-pre-wrap w-full">{pretty(attempt.response)}</pre>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                                {!selectedMessageAttempts.length && !isBusy && (
                                                    <div className="text-sm text-muted-foreground text-center py-8 bg-muted/10 rounded-xl border border-dashed italic w-full">
                                                        No attempts found.
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full rounded-xl"
                                        onClick={() => selected.appId && selectedMsg.id && loadAttemptsForMessage(selected.appId, selectedMsg.id, attemptQuery())}
                                        disabled={isBusy}
                                    >
                                        <RefreshCw className={classNames("mr-2 h-4 w-4", isBusy && "animate-spin")} /> Reload Attempts
                                    </Button>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                ) : (
                    <div className="flex-1 flex items-center justify-center rounded-2xl border border-dashed bg-muted/10 text-muted-foreground italic text-sm">
                        Select a message to see details
                    </div>
                )}
            </div>
        </div>
    );
}
