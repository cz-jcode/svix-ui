import React from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SelectedItem } from "@/types/svix";
import { pretty, classNames, statusTone, statusLabel } from "@/utils/admin";

interface AttemptsPanelProps {
    kind: "endpoint" | "message";
    selected: SelectedItem;
    attemptFilter: any;
    setAttemptFilter: React.Dispatch<React.SetStateAction<any>>;
    loadAttempts: (appId: string, id: string, query: string) => Promise<void>;
    isBusy: boolean;
    items: any[];
    attemptQuery: () => string;
}

export function AttemptsPanel({
    kind,
    selected,
    attemptFilter,
    setAttemptFilter,
    loadAttempts,
    isBusy,
    items,
    attemptQuery,
}: AttemptsPanelProps) {
    const id = kind === "endpoint" ? selected.endpointId : selected.msgId;

    return (
        <div className="space-y-4">
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Filter Attempts ({kind})</CardTitle>
                    <CardDescription>Filter message delivery attempts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">Limit</Label>
                            <Input
                                className="h-10 rounded-xl"
                                value={attemptFilter.limit}
                                onChange={(e) => setAttemptFilter((s: any) => ({ ...s, limit: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">Status</Label>
                            <Input
                                className="h-10 rounded-xl"
                                value={attemptFilter.status}
                                onChange={(e) => setAttemptFilter((s: any) => ({ ...s, status: e.target.value }))}
                                placeholder="0|1|2|3"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">Status code class</Label>
                            <Input
                                className="h-10 rounded-xl"
                                value={attemptFilter.statusCodeClass}
                                onChange={(e) => setAttemptFilter((s: any) => ({ ...s, statusCodeClass: e.target.value }))}
                                placeholder="200|400|500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">Channel</Label>
                            <Input
                                className="h-10 rounded-xl"
                                value={attemptFilter.channel}
                                onChange={(e) => setAttemptFilter((s: any) => ({ ...s, channel: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">Event types (comma separated)</Label>
                            <Input
                                className="h-10 rounded-xl"
                                value={attemptFilter.eventTypes}
                                onChange={(e) => setAttemptFilter((s: any) => ({ ...s, eventTypes: e.target.value }))}
                                placeholder="user.signup,user.deleted"
                            />
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-end">
                            <div className="flex items-center justify-between rounded-xl border bg-background/50 px-3 py-2 h-10">
                                <Label className="text-xs font-semibold text-muted-foreground">With content</Label>
                                <Switch
                                    checked={attemptFilter.withContent}
                                    onCheckedChange={(v) => setAttemptFilter((s: any) => ({ ...s, withContent: v }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">After</Label>
                            <Input
                                className="h-10 rounded-xl"
                                value={attemptFilter.after}
                                onChange={(e) => setAttemptFilter((s: any) => ({ ...s, after: e.target.value }))}
                                placeholder="2026-04-12T10:00:00Z"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">Before</Label>
                            <Input
                                className="h-10 rounded-xl"
                                value={attemptFilter.before}
                                onChange={(e) => setAttemptFilter((s: any) => ({ ...s, before: e.target.value }))}
                                placeholder="2026-04-12T12:00:00Z"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => {
                                if (!selected.appId || !id) return;
                                loadAttempts(selected.appId, id, attemptQuery());
                            }}
                            disabled={isBusy}
                        >
                            <RefreshCw className={classNames("mr-2 h-4 w-4", isBusy && "animate-spin")} />
                            Load attempts
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Attempt list</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {items.map((attempt) => (
                        <div key={attempt.id} className="rounded-xl border p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="font-medium break-all text-muted-foreground text-[0.7rem] uppercase tracking-wider mb-1">
                                        Attempt ID
                                    </div>
                                    <div className="font-medium break-all">{attempt.id}</div>
                                    {kind === "endpoint" && (
                                        <div className="text-xs text-muted-foreground break-all font-mono mt-1">
                                            msg: {attempt.msgId}
                                        </div>
                                    )}
                                    {kind === "message" && (
                                        <div className="text-xs text-muted-foreground break-all font-mono mt-1">
                                            ep: {attempt.endpointId}
                                        </div>
                                    )}
                                    <div className="text-xs text-muted-foreground mt-1">{attempt.timestamp}</div>
                                    <div className="text-xs text-muted-foreground">
                                        HTTP {attempt.responseStatusCode} · {attempt.responseDurationMs} ms
                                    </div>
                                    <div className="text-xs text-muted-foreground break-all">{attempt.url}</div>
                                </div>
                                <Badge className={classNames("rounded-full px-2 py-0.5", statusTone(attempt.status))}>
                                    {attempt.statusText || statusLabel(attempt.status)}
                                </Badge>
                            </div>
                            <div className="mt-2 rounded-xl bg-muted/30 p-3">
                                <pre className="text-xs whitespace-pre-wrap break-words">{pretty(attempt.response)}</pre>
                            </div>
                        </div>
                    ))}
                    {!items.length && <div className="text-sm text-muted-foreground">No attempts loaded.</div>}
                </CardContent>
            </Card>
        </div>
    );
}
