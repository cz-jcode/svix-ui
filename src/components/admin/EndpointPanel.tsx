import { Plus, Edit3, Trash2, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectedItem, SvixEndpoint } from "@/types/svix";
import { JsonField } from "./JsonField";
import { classNames, parseJsonSafe, pretty } from "@/utils/admin";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AttemptsPanel } from "./AttemptsPanel";
import { SmallStat } from "./AppPanel";

interface EndpointPanelProps {
    selected: SelectedItem;
    endpointForm: any;
    setEndpointForm: React.Dispatch<React.SetStateAction<any>>;
    eventTypes: any[];
    endpoints: SvixEndpoint[];
    createEndpoint: (appId: string) => Promise<void>;
    patchEndpoint: (appId: string, endpointId: string) => Promise<void>;
    deleteEndpoint: (appId: string, endpointId: string) => Promise<void>;
    isBusy: boolean;
    onTabChange?: (tab: string) => void;
    attempts?: any[];
    attemptFilter?: any;
    setAttemptFilter?: (f: any) => void;
    loadAttempts?: any;
    attemptQuery?: any;
}

export function EndpointPanel({
    selected,
    endpointForm,
    setEndpointForm,
    eventTypes,
    endpoints,
    createEndpoint,
    patchEndpoint,
    deleteEndpoint,
    isBusy,
    onTabChange,
    attempts = [],
    attemptFilter,
    setAttemptFilter,
    loadAttempts,
    attemptQuery,
}: EndpointPanelProps) {
    const availableEventTypes = eventTypes.map((et) => et.name).sort();
    const currentFilters = parseJsonSafe(endpointForm.filterTypes, []);
    const isArrayFilter = Array.isArray(currentFilters);

    const toggleFilter = (name: string) => {
        let next;
        if (!isArrayFilter) {
            next = [name];
        } else if (currentFilters.includes(name)) {
            next = currentFilters.filter((n: string) => n !== name);
        } else {
            next = [...currentFilters, name];
        }
        setEndpointForm((s: any) => ({ ...s, filterTypes: next.length > 0 ? pretty(next) : "" }));
    };

    if (selected.type === "newEndpoint") {
        return (
            <div className="flex h-full flex-col p-6 overflow-hidden">
                <ScrollArea className="flex-1 h-full w-full min-h-0">
                    <div className="p-1 pb-10 space-y-4">
                        <Card className="rounded-2xl">
                            <CardHeader>
                                <CardTitle className="font-bold">Create Endpoint</CardTitle>
                                <CardDescription>Fill in the details below to create a new endpoint destination.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>URL</Label>
                                        <Input
                                            placeholder="https://api.example.com/webhook"
                                            value={endpointForm.url}
                                            onChange={(e) => setEndpointForm((s: any) => ({ ...s, url: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Description</Label>
                                        <Input
                                            placeholder="Production Webhook"
                                            value={endpointForm.description}
                                            onChange={(e) => setEndpointForm((s: any) => ({ ...s, description: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>UID</Label>
                                        <Input
                                            placeholder="unique-id"
                                            value={endpointForm.uid}
                                            onChange={(e) => setEndpointForm((s: any) => ({ ...s, uid: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={() => selected.appId && createEndpoint(selected.appId)}
                                    disabled={isBusy || !endpointForm.url || !selected.appId}
                                    className="w-full sm:w-auto"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </div>
        );
    }

    if (selected.type === "endpoint-folder") {
        return (
            <div className="flex h-full flex-col p-6 overflow-hidden">
                <ScrollArea className="flex-1 h-full w-full min-h-0">
                    <div className="p-1 pb-10 space-y-4">
                        <div className="grid gap-4 lg:grid-cols-4">
                            <SmallStat title="Total Endpoints" value={endpoints.length} />
                            <SmallStat title="Active" value={endpoints.filter(e => !e.disabled).length} />
                            <SmallStat title="Disabled" value={endpoints.filter(e => e.disabled).length} />
                        </div>

                        <Card className="rounded-2xl">
                            <CardHeader>
                                <CardTitle className="font-bold">Endpoints</CardTitle>
                                <CardDescription>List of endpoints for the current application.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {endpoints.length === 0 ? (
                                        <div className="text-sm text-muted-foreground p-4 text-center border rounded-xl border-dashed">
                                            No endpoints found.
                                        </div>
                                    ) : (
                                        endpoints.map((ep) => (
                                            <div key={ep.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <Send className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium">{ep.description || ep.url}</div>
                                                        <div className="text-xs text-muted-foreground font-mono">{ep.id}</div>
                                                    </div>
                                                </div>
                                                <Badge className={classNames("rounded-full px-2 py-0.5", ep.disabled ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300")}>
                                                    {ep.disabled ? "disabled" : "active"}
                                                </Badge>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="text-sm text-muted-foreground py-8 text-center border-2 border-dashed rounded-xl">
                            Select an endpoint from the tree to see its settings and attempts.
                        </div>
                    </div>
                </ScrollArea>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col p-6 pb-0 overflow-hidden">
            <Tabs 
                value={selected.type === "endpoint-attempts" ? "attempts" : "settings"} 
                onValueChange={onTabChange}
                className="flex-1 flex flex-col h-full min-h-0"
            >
            <div className="flex items-center justify-between mb-4 shrink-0">
                <TabsList className="bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="settings" className="rounded-lg px-4 py-1.5 text-xs font-semibold">Settings</TabsTrigger>
                    <TabsTrigger value="attempts" className="rounded-lg px-4 py-1.5 text-xs font-semibold">Attempts</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="settings" className="flex-1 m-0 outline-none overflow-hidden h-full pb-20">
                <ScrollArea className="flex-1 h-full w-full min-h-0">
                    <div className="p-1 pb-10">
                        <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="font-bold">
                            {(selected.type as string) === "newEndpoint" ? "Create Endpoint" : (selected.endpointId ? `Endpoint: ${selected.endpointId}` : "Endpoint")}
                        </CardTitle>
                        <CardDescription>
                            {(selected.type as string) === "newEndpoint" ? "Fill in the details to create a new endpoint destination." : "Full CRUD for endpoints under the selected application."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <Label>URL</Label>
                                <Input
                                    value={endpointForm.url}
                                    onChange={(e) => setEndpointForm((s: any) => ({ ...s, url: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Description</Label>
                                <Input
                                    value={endpointForm.description}
                                    onChange={(e) => setEndpointForm((s: any) => ({ ...s, description: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>UID</Label>
                                <Input
                                    value={endpointForm.uid}
                                    onChange={(e) => setEndpointForm((s: any) => ({ ...s, uid: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Secret (create only / rotate manually)</Label>
                                <Input
                                    value={endpointForm.secret}
                                    onChange={(e) => setEndpointForm((s: any) => ({ ...s, secret: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Throttle rate</Label>
                                <Input
                                    value={endpointForm.throttleRate}
                                    onChange={(e) => setEndpointForm((s: any) => ({ ...s, throttleRate: e.target.value }))}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-xl border px-3 py-2">
                                <Label>Disabled</Label>
                                <Switch
                                    checked={endpointForm.disabled}
                                    onCheckedChange={(v) => setEndpointForm((s: any) => ({ ...s, disabled: v }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Filter types (quick select)</Label>
                            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border bg-muted/20 max-h-40 overflow-y-auto">
                                {availableEventTypes.map((etName) => {
                                    const active = isArrayFilter && currentFilters.includes(etName);
                                    return (
                                        <Badge
                                            key={etName}
                                            variant={active ? "default" : "outline"}
                                            className="cursor-pointer select-none"
                                            onClick={() => toggleFilter(etName)}
                                        >
                                            {etName}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <JsonField
                                label="Filter Types (Raw JSON)"
                                value={endpointForm.filterTypes}
                                onChange={(v) => setEndpointForm((s: any) => ({ ...s, filterTypes: v }))}
                                rows={6}
                                placeholder="[]"
                            />
                            <JsonField
                                label="Channels (Raw JSON)"
                                value={endpointForm.channels}
                                onChange={(v) => setEndpointForm((s: any) => ({ ...s, channels: v }))}
                                rows={6}
                                placeholder="[]"
                            />
                        </div>

                        <JsonField
                            label="Metadata (Raw JSON)"
                            value={endpointForm.metadata}
                            onChange={(v) => setEndpointForm((s: any) => ({ ...s, metadata: v }))}
                            rows={6}
                            placeholder="{}"
                        />

                        <div className="flex flex-wrap gap-2">
                            {(selected.type as string) === "newEndpoint" ? (
                                <Button
                                    onClick={() => selected.appId && createEndpoint(selected.appId)}
                                    disabled={isBusy || !endpointForm.url || !selected.appId}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => selected.appId && selected.endpointId && patchEndpoint(selected.appId, selected.endpointId)}
                                        disabled={isBusy || !selected.appId || !selected.endpointId}
                                    >
                                        <Edit3 className="mr-2 h-4 w-4" />
                                        Patch
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => selected.appId && selected.endpointId && deleteEndpoint(selected.appId, selected.endpointId)}
                                        disabled={isBusy || !selected.appId || !selected.endpointId}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
                </div>
                </ScrollArea>
            </TabsContent>

            <TabsContent value="attempts" className="flex-1 min-h-0 m-0 outline-none overflow-hidden h-full pb-20">
                <ScrollArea className="flex-1 h-full w-full min-h-0">
                    <div className="p-1 pb-10">
                        <AttemptsPanel
                            kind="endpoint"
                            selected={selected}
                            attemptFilter={attemptFilter}
                            setAttemptFilter={setAttemptFilter || (() => {})}
                            loadAttempts={loadAttempts}
                            isBusy={isBusy}
                            items={attempts}
                            attemptQuery={attemptQuery}
                        />
                    </div>
                </ScrollArea>
            </TabsContent>
        </Tabs>
        </div>
    );
}
