import React from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SvixApplication, SelectedItem } from "@/types/svix";
import { JsonField } from "./JsonField";

export function SmallStat({ title, value }: { title: string; value: number | string }) {
    const isMore = typeof value === 'string' && value.endsWith('+');
    return (
        <Card className="rounded-xl bg-card/40 border shadow-none">
            <CardContent className="p-3">
                <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">{title}</div>
                <div className={`text-xl font-bold ${isMore ? 'text-orange-500' : ''}`}>{value}</div>
            </CardContent>
        </Card>
    );
}

interface AppPanelProps {
    selectedApp: SvixApplication | null;
    appForm: { name: string; uid: string; throttleRate: string; metadata: string };
    setAppForm: React.Dispatch<React.SetStateAction<{ name: string; uid: string; throttleRate: string; metadata: string }>>;
    createApplication: () => Promise<void>;
    patchApplication: (id: string) => Promise<void>;
    deleteApplication: (id: string) => Promise<void>;
    isBusy: boolean;
    selected: SelectedItem;
    stats: {
        appsCount: number;
        eventTypesCount: number;
        endpointsCount: number;
        messagesCount: number | string;
    };
}

export function AppPanel({
    selectedApp,
    appForm,
    setAppForm,
    createApplication,
    patchApplication,
    deleteApplication,
    isBusy,
    selected,
    stats
}: AppPanelProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-4">
                <SmallStat title="Apps" value={stats.appsCount} />
                <SmallStat title="Event Types" value={stats.eventTypesCount} />
                <SmallStat title="Endpoints" value={stats.endpointsCount} />
                <SmallStat title="Messages" value={stats.messagesCount} />
            </div>
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="font-bold">
                        {selected.type === "newApp" ? "Create Application" : (selectedApp ? `Application: ${selectedApp.name}` : "Application")}
                    </CardTitle>
                    <CardDescription>
                        {selected.type === "newApp" ? "Fill in the details to create a new application." : (selectedApp ? "Full CRUD for applications." : "Overview of all your applications.")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(selected.type === "newApp" || selectedApp) && (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input
                                        value={appForm.name}
                                        onChange={(e) => setAppForm((s) => ({ ...s, name: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>UID</Label>
                                    <Input
                                        value={appForm.uid}
                                        onChange={(e) => setAppForm((s) => ({ ...s, uid: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Throttle rate</Label>
                                    <Input
                                        value={appForm.throttleRate}
                                        onChange={(e) => setAppForm((s) => ({ ...s, throttleRate: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <JsonField
                                label="Metadata JSON"
                                value={appForm.metadata}
                                onChange={(v) => setAppForm((s) => ({ ...s, metadata: v }))}
                                rows={8}
                                placeholder="{}"
                            />
                            <div className="flex flex-wrap gap-2">
                                {selected.type === "newApp" ? (
                                    <Button onClick={createApplication} disabled={isBusy || !appForm.name}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => selected.appId && patchApplication(selected.appId)}
                                            disabled={isBusy || !selected.appId}
                                        >
                                            <Edit3 className="mr-2 h-4 w-4" />
                                            Patch
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => selected.appId && deleteApplication(selected.appId)}
                                            disabled={isBusy || !selected.appId}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                    {selected.type === "root" && (
                        <div className="text-sm text-muted-foreground py-8 text-center border-2 border-dashed rounded-xl">
                            Select an application from the tree to see its details or click the "+" button to create a new one.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
