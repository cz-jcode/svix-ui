import { Tag, FolderTree, Boxes, Send, Activity, Mail, Info, Globe, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TreeRow } from "./TreeRow";
import { classNames } from "@/utils/admin";
import { SvixApplication, SvixEventType, SelectedItem, SvixEndpoint, SvixMessage } from "@/types/svix";

interface ResourceTreeProps {
    selected: SelectedItem;
    setSelected: (s: SelectedItem) => void;
    expanded: Record<string, boolean>;
    toggle: (key: string) => void;
    eventTypes: SvixEventType[];
    apps: SvixApplication[];
    endpointsByApp: Record<string, SvixEndpoint[]>;
    messagesByApp: Record<string, SvixMessage[]>;
    loadEventTypes: () => Promise<void>;
    loadEndpoints: (appId: string) => Promise<void>;
    loadMessages: (appId: string) => Promise<void>;
    loadAttemptsForEndpoint: (appId: string, endpointId: string, query: string) => Promise<void>;
    selectEventType: (et: SvixEventType) => void;
    selectApp: (app: SvixApplication) => Promise<void>;
    selectEndpoint: (appId: string, ep: SvixEndpoint) => void;
    attemptQuery: () => string;
}

export function ResourceTree({
    selected,
    setSelected,
    expanded,
    toggle,
    eventTypes,
    apps,
    endpointsByApp,
    messagesByApp,
    loadEventTypes,
    loadEndpoints,
    loadMessages,
    loadAttemptsForEndpoint,
    selectEventType,
    selectApp,
    selectEndpoint,
    attemptQuery,
}: ResourceTreeProps) {
    return (
        <div className="space-y-1">
            <TreeRow
                depth={0}
                selected={selected.type === "about"}
                onClick={() => setSelected({ type: "about" })}
                icon={<Info className="h-4 w-4" />}
                label="About"
            />
            <TreeRow
                depth={0}
                selected={selected.type === "resources"}
                onClick={() => setSelected({ type: "resources" })}
                icon={<Globe className="h-4 w-4" />}
                label="Resources"
            />
            <Separator className="my-2" />
            <TreeRow
                depth={0}
                selected={selected.type === "newEventType"}
                expandable
                expanded={expanded.eventTypes}
                onClick={async () => {
                    toggle("eventTypes");
                    setSelected({ type: "newEventType" });
                    if (eventTypes.length === 0) await loadEventTypes();
                }}
                icon={<Tag className="h-4 w-4" />}
                label="Event Types"
                right={<Badge variant="secondary">{eventTypes.length}</Badge>}
            />
            {expanded.eventTypes && eventTypes.map((et) => (
                <TreeRow
                    key={et.name}
                    depth={1}
                    selected={selected.type === "event-type" && selected.eventTypeName === et.name}
                    onClick={() => selectEventType(et)}
                    icon={<Tag className="h-4 w-4" />}
                    label={et.name.length > 20 ? et.name.substring(0, 20) + "..." : et.name}
                    title={et.name}
                    right={et.deprecated ? <Badge variant="destructive">dep</Badge> : (et.archived ? <Badge variant="outline">arch</Badge> : null)}
                />
            ))}

            <Separator className="my-2" />

            <TreeRow
                depth={0}
                selected={selected.type === "newApp"}
                expandable
                expanded={expanded.apps}
                onClick={() => {
                    toggle("apps");
                    setSelected({ type: "newApp" });
                }}
                icon={<FolderTree className="h-4 w-4" />}
                label="Applications"
                right={<Badge variant="secondary">{apps.length}</Badge>}
            />
            {expanded.apps && apps.map((app) => {
                const appKey = `app:${app.id}`;
                const endpointsKey = `app:${app.id}:endpoints`;
                const appEndpoints = endpointsByApp[app.id] || [];
                return (
                    <div key={app.id}>
                        <TreeRow
                            depth={1}
                            expandable
                            expanded={expanded[appKey]}
                            selected={selected.type === "app" && selected.appId === app.id}
                            onClick={async () => {
                                toggle(appKey);
                                await selectApp(app);
                            }}
                            icon={<Boxes className="h-4 w-4" />}
                            label={(app.name || app.id).length > 20 ? (app.name || app.id).substring(0, 20) + "..." : (app.name || app.id)}
                            title={app.name || app.id}
                            right={app.uid ? <Badge variant="outline">uid</Badge> : null}
                        />
                        {expanded[appKey] && (
                            <>
                                <TreeRow
                                    depth={2}
                                    expandable
                                    expanded={expanded[endpointsKey]}
                                    selected={selected.type === "newEndpoint" && selected.appId === app.id}
                                    onClick={async () => {
                                        toggle(endpointsKey);
                                        setSelected({ type: "newEndpoint", appId: app.id });
                                        if (!endpointsByApp[app.id]) await loadEndpoints(app.id);
                                    }}
                                    icon={<Boxes className="h-4 w-4" />}
                                    label="Endpoints"
                                    right={<Badge variant="secondary">{appEndpoints.length}</Badge>}
                                />
                                {expanded[endpointsKey] && appEndpoints.map((ep) => (
                                    <div key={ep.id}>
                                        <TreeRow
                                            depth={3}
                                            selected={selected.type === "endpoint" && selected.endpointId === ep.id}
                                            onClick={() => selectEndpoint(app.id, ep)}
                                            icon={<Send className="h-4 w-4" />}
                                            label={(ep.description || ep.url || ep.id).length > 20 ? (ep.description || ep.url || ep.id).substring(0, 20) + "..." : (ep.description || ep.url || ep.id)}
                                            title={ep.description || ep.url || ep.id}
                                            right={<Badge className={classNames("rounded-full px-2 py-0.5", ep.disabled ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300")}>{ep.disabled ? "off" : "on"}</Badge>}
                                        />
                                        <TreeRow
                                            depth={4}
                                            selected={selected.type === "endpoint-attempts" && selected.endpointId === ep.id}
                                            onClick={async () => {
                                                setSelected({ type: "endpoint-attempts", appId: app.id, endpointId: ep.id, item: ep });
                                                await loadAttemptsForEndpoint(app.id, ep.id, attemptQuery());
                                            }}
                                            icon={<Activity className="h-4 w-4" />}
                                            label="Attempts"
                                            right={null}
                                        />
                                    </div>
                                ))}

                                <TreeRow
                                    depth={2}
                                    selected={selected.type === "producer" && selected.appId === app.id}
                                    onClick={() => {
                                        setSelected({ type: "producer", appId: app.id });
                                    }}
                                    icon={<Zap className="h-4 w-4 text-amber-500" />}
                                    label="Producer"
                                />

                                <TreeRow
                                    depth={2}
                                    selected={selected.type === "message-folder" && selected.appId === app.id}
                                    onClick={async () => {
                                        setSelected({ type: "message-folder", appId: app.id });
                                        if (!messagesByApp[app.id]) await loadMessages(app.id);
                                    }}
                                    icon={<Mail className="h-4 w-4" />}
                                    label="Messages"
                                    right={<Badge variant="secondary">{messagesByApp[app.id]?.length || 0}</Badge>}
                                />
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
