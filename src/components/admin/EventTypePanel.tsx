import { Plus, Edit3, Trash2, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SelectedItem } from "@/types/svix";
import { JsonField } from "./JsonField";

interface EventTypePanelProps {
    selected: SelectedItem;
    eventTypeForm: {
        name: string;
        description: string;
        featureFlag: string;
        archived: boolean;
        deprecated: boolean;
        schemas: string;
    };
    setEventTypeForm: React.Dispatch<React.SetStateAction<any>>;
    createEventType: () => Promise<void>;
    patchEventType: (name: string) => Promise<void>;
    deleteEventType: (name: string) => Promise<void>;
    isBusy: boolean;
}

export function EventTypePanel({
    selected,
    eventTypeForm,
    setEventTypeForm,
    createEventType,
    patchEventType,
    deleteEventType,
    isBusy,
}: EventTypePanelProps) {
    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle>
                    {selected.type === "newEventType" ? "Create Event Type" : (selected.eventTypeName ? `Event Type: ${selected.eventTypeName}` : "Event Type Details")}
                </CardTitle>
                <CardDescription>
                    {selected.type === "newEventType" ? "Fill in the details to create a new event type." : "Definitions of event types for your environment."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {(selected.type === "newEventType" || selected.eventTypeName) ? (
                    <>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <div className="flex gap-2">
                                    <Tag className="h-4 w-4 mt-3 opacity-50 shrink-0" />
                                    <input
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={eventTypeForm.name}
                                        onChange={(e) => setEventTypeForm((s: any) => ({ ...s, name: e.target.value }))}
                                        placeholder="user.signup"
                                        readOnly={selected.type === "event-type"}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={eventTypeForm.description}
                                    onChange={(e) => setEventTypeForm((s: any) => ({ ...s, description: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Feature flag</Label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={eventTypeForm.featureFlag}
                                    onChange={(e) => setEventTypeForm((s: any) => ({ ...s, featureFlag: e.target.value }))}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center justify-between flex-1 rounded-xl border px-3 py-2">
                                    <Label>Archived</Label>
                                    <Switch
                                        checked={eventTypeForm.archived}
                                        onCheckedChange={(v) => setEventTypeForm((s: any) => ({ ...s, archived: v }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between flex-1 rounded-xl border px-3 py-2">
                                    <Label>Deprecated</Label>
                                    <Switch
                                        checked={eventTypeForm.deprecated}
                                        onCheckedChange={(v) => setEventTypeForm((s: any) => ({ ...s, deprecated: v }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <JsonField
                            label="JSON Schemas"
                            value={eventTypeForm.schemas}
                            onChange={(v) => setEventTypeForm((s: any) => ({ ...s, schemas: v }))}
                            rows={12}
                            placeholder="{}"
                        />
                        <div className="flex flex-wrap gap-2">
                            {selected.type === "newEventType" ? (
                                <Button onClick={createEventType} disabled={isBusy || !eventTypeForm.name}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => selected.eventTypeName && patchEventType(selected.eventTypeName)}
                                        disabled={isBusy || !selected.eventTypeName}
                                    >
                                        <Edit3 className="mr-2 h-4 w-4" />
                                        Patch
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => selected.eventTypeName && deleteEventType(selected.eventTypeName)}
                                        disabled={isBusy || !selected.eventTypeName}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-sm text-muted-foreground py-8 text-center border-2 border-dashed rounded-xl">
                        Select an event type from the tree to see its details.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
