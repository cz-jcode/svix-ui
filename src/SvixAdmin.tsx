import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { 
    SvixMessage, 
    ApiHistoryEntry,
} from "@/types/svix";
import { useToastState } from "@/hooks/useToastState";
import { useSvixApi } from "@/hooks/useSvixApi";
import { useSvixAdminState } from "@/hooks/useSvixAdminState";
import { useSvixAdminActions } from "@/hooks/useSvixAdminActions";
import { useSvixAdminConfig } from "@/hooks/useSvixAdminConfig";
import { useSvixRouter } from "@/hooks/useSvixRouter";
import { useMessagePolling } from "@/hooks/useMessagePolling";
import { ResourceTree } from "@/components/admin/ResourceTree";
import { DetailView } from "@/components/admin/DetailView";
import { ConsolePanel } from "@/components/admin/ConsolePanel";
import { Header } from "@/components/admin/Header";
import { ScrollArea } from "@/components/ui/scroll-area";

declare global {
    interface Window {
        _env_?: Record<string, string>;
    }
}

const defaultBaseUrl = (window._env_ && window._env_.SVIX_BASE_URL) || import.meta.env.VITE_SVIX_BASE_URL || "http://localhost:9001";
const defaultToken = (window._env_ && window._env_.SVIX_TOKEN) || import.meta.env.VITE_SVIX_TOKEN || "";
const defaultSaveToken = (window._env_ && window._env_.SVIX_SAVE_TOKEN === "true") || import.meta.env.VITE_SVIX_SAVE_TOKEN === "true" || false;
const LS_READ_MSGS_KEY = "svix-admin-ui-read-messages";


const DEFAULT_APP_FORM = { name: "", uid: "", throttleRate: "", metadata: "{}" };
const DEFAULT_EVENT_TYPE_FORM = {
    name: "",
    description: "",
    featureFlag: "",
    archived: false,
    deprecated: false,
    schemas: "{}",
};
const DEFAULT_ENDPOINT_FORM = {
    url: "",
    description: "",
    uid: "",
    secret: "",
    throttleRate: "",
    disabled: false,
    filterTypes: "[]",
    channels: "[]",
    metadata: "{}",
};
const DEFAULT_MESSAGE_FORM = {
    eventType: "user.signup",
    eventId: "",
    channels: "[]",
    payloadRetentionPeriod: "90",
    payload: '{\n  "hello": "world"\n}',
};

export default function SvixAdmin() {
    const {
        baseUrl, setBaseUrl,
        token, setToken,
        saveToken, setSaveToken,
        layout, setLayout
    } = useSvixAdminConfig({ defaultBaseUrl, defaultToken, defaultSaveToken });

    const { selected, setSelected } = useSvixRouter();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ root: true, apps: true });
    const [isBusy, setIsBusy] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);
    const [apiHistory, setApiHistory] = useState<ApiHistoryEntry[]>([]);
    const lastErrorTimeRef = useRef<number>(0);
    const toast = useToastState(setApiHistory);

    const { apiCall, headers: apiHeaders } = useSvixApi(baseUrl, token, setApiHistory);

    const guarded = useCallback(async <T,>(fn: () => Promise<T>, successMessage?: string): Promise<T> => {
        setIsBusy(true);
        try {
            const now = Date.now();
            const timeSinceLastError = now - lastErrorTimeRef.current;
            if (timeSinceLastError < 2000) {
                // Debounce/delay when errors are happening rapidly
                await new Promise(resolve => setTimeout(resolve, 2000 - timeSinceLastError));
            }

            const result = await fn();
            if (successMessage) toast.push("success", successMessage);
            return result;
        } catch (err: any) {
            const now = Date.now();
            lastErrorTimeRef.current = now;
            (window as any)._svix_last_error_time = now;
            toast.push("error", err.message || "Request failed.");
            throw err;
        } finally {
            setIsBusy(false);
        }
    }, [toast]);

    const [msgSearch, setMsgSearch] = useState("");
    
    const {
        apps,
        eventTypes,
        endpointsByApp,
        messagesByApp,
        attemptsByEndpoint,
        attemptsByMessage,
        destinationsByMessage,
        isLoadingMoreMessages,
        loadApps,
        loadEventTypes,
        loadEndpoints,
        loadMessages,
        loadMoreMessages,
        loadAttemptsForEndpoint,
        loadAttemptsForMessage,
        loadDestinationsForMessage,
        setMessagesByApp,
        buildQuery
    } = useSvixAdminState(apiCall, guarded, msgSearch, selected, (appId: string, msg: SvixMessage) => selectMessage(appId, msg));

    useMessagePolling(
        baseUrl, 
        token, 
        selected, 
        msgSearch, 
        apiHeaders, 
        buildQuery, 
        setMessagesByApp,
        selected.type === "message-folder" || selected.type === "message" || selected.type === "message-attempts"
    );

    const [appForm, setAppForm] = useState(DEFAULT_APP_FORM);
    const [eventTypeForm, setEventTypeForm] = useState(DEFAULT_EVENT_TYPE_FORM);
    const [endpointForm, setEndpointForm] = useState(DEFAULT_ENDPOINT_FORM);

    const [readMessageIds, setReadMessageIds] = useState<Set<string>>(() => {
        try {
            const saved = window.localStorage.getItem(LS_READ_MSGS_KEY);
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });

    const [loadedContext, setLoadedContext] = useState<string>("");

    const [messageForm, setMessageForm] = useState(DEFAULT_MESSAGE_FORM);

    useEffect(() => {
        if (selected.type === "root" || selected.type === "newApp") {
            setAppForm(DEFAULT_APP_FORM);
        } else if (selected.type === "event-type-folder" || selected.type === "newEventType") {
            setEventTypeForm(DEFAULT_EVENT_TYPE_FORM);
        } else if (selected.type === "endpoint-folder" || selected.type === "newEndpoint") {
            setEndpointForm(DEFAULT_ENDPOINT_FORM);
        } else if (selected.type === "message-folder") {
            setMessageForm(DEFAULT_MESSAGE_FORM);
        }
    }, [selected.type]);

    const {
        selectApp,
        selectEndpoint,
        selectMessage,
        selectEventType,
        createApplication,
        patchApplication,
        deleteApplication,
        createEventType,
        patchEventType,
        deleteEventType,
        createEndpoint,
        patchEndpoint,
        deleteEndpoint,
        createMessage,
        resendToEndpoint,
        deleteMessageContent,
    } = useSvixAdminActions(
        apiCall,
        guarded,
        loadApps,
        loadEventTypes,
        loadEndpoints,
        loadMessages,
        setSelected,
        setAppForm,
        setEndpointForm,
        setEventTypeForm,
        setExpanded,
        setReadMessageIds,
        appForm,
        eventTypeForm,
        endpointForm,
        messageForm,
        apps,
        eventTypes,
        endpointsByApp,
        messagesByApp,
        toast
    );
    const [attemptFilter, setAttemptFilter] = useState({
        limit: "20",
        status: "",
        statusCodeClass: "",
        channel: "",
        eventTypes: "",
        before: "",
        after: "",
        withContent: true,
    });

    const scrollRef = useRef(null);

    useEffect(() => {
        window.localStorage.setItem(LS_READ_MSGS_KEY, JSON.stringify(Array.from(readMessageIds)));
    }, [readMessageIds]);

    const headers: Record<string, string> = useMemo(() => {
        const h: Record<string, string> = { Accept: "application/json" };
        if (token) h["Authorization"] = `Bearer ${token}`;
        return h;
    }, [token]);

    useEffect(() => {
        if (baseUrl && token) {
            loadApps(true);
            loadEventTypes(true);
        }
    }, [baseUrl, token]);

    useEffect(() => {
        if (!baseUrl || !token) return;
        
        const contextKey = `${selected.type}:${selected.appId}:${selected.msgId}:${selected.endpointId}:${JSON.stringify(attemptFilter)}`;
        if (contextKey === loadedContext) return;

        // Auto-load endpoints and messages for application if not present
        if (selected.appId) {
            if (!endpointsByApp[selected.appId]) loadEndpoints(selected.appId);
            if (!messagesByApp[selected.appId]) loadMessages(selected.appId);
            setExpanded(prev => {
                const key = `app:${selected.appId}`;
                if (prev[key]) return prev;
                return { ...prev, [key]: true };
            });
        }

        if (selected.type === "message" && selected.appId && selected.msgId) {
            loadDestinationsForMessage(selected.appId, selected.msgId);
            loadAttemptsForMessage(selected.appId, selected.msgId, attemptQuery());
            setLoadedContext(contextKey);
        } else if (selected.type === "endpoint-attempts" && selected.appId && selected.endpointId) {
            loadAttemptsForEndpoint(selected.appId, selected.endpointId, attemptQuery());
            setLoadedContext(contextKey);
        } else if (selected.type === "message-attempts" && selected.appId && selected.msgId) {
            loadAttemptsForMessage(selected.appId, selected.msgId, attemptQuery());
            setLoadedContext(contextKey);
        }
    }, [selected.type, selected.appId, selected.msgId, selected.endpointId, attemptFilter, loadDestinationsForMessage, loadAttemptsForMessage, loadAttemptsForEndpoint, loadEndpoints, loadMessages, endpointsByApp, messagesByApp, baseUrl, token, loadedContext]);



    function attemptQuery(): string {
        return buildQuery({
            limit: attemptFilter.limit || 20,
            status: attemptFilter.status || undefined,
            status_code_class: attemptFilter.statusCodeClass || undefined,
            channel: attemptFilter.channel || undefined,
            event_types: attemptFilter.eventTypes ? attemptFilter.eventTypes.split(",").map((x: string) => x.trim()).filter(Boolean) : undefined,
            before: attemptFilter.before || undefined,
            after: attemptFilter.after || undefined,
            with_content: attemptFilter.withContent,
        });
    }



    async function copyToken() {
        await navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    }

    function toggle(key: string) {
        setExpanded((s) => ({ ...s, [key]: !s[key] }));
    }

    const selectedApp = selected.appId ? apps.find((x) => x.id === selected.appId) || null : null;
    const selectedEndpoints = selected.appId ? endpointsByApp[selected.appId] || [] : [];
    const selectedMessages = selected.appId ? messagesByApp[selected.appId] || [] : [];

    // Correct selected.item if it's missing but exists in state
    if (selected.type === "message" && selected.appId && selected.msgId && !selected.item) {
        const found = selectedMessages.find(m => m.id === selected.msgId);
        if (found) selected.item = found;
    } else if (selected.type === "endpoint" && selected.appId && selected.endpointId && !selected.item) {
        const found = selectedEndpoints.find(e => e.id === selected.endpointId);
        if (found) selected.item = found;
    } else if (selected.type === "app" && selected.appId && !selected.item) {
        if (selectedApp) selected.item = selectedApp;
    } else if (selected.type === "event-type" && selected.eventTypeName && !selected.item) {
        const found = eventTypes.find(et => et.name === selected.eventTypeName);
        if (found) selected.item = found;
    }

    const handleTabChange = useCallback((tab: string) => {
        if (selected.type === "message" || selected.type === "message-attempts") {
            if (tab === "attempts") {
                setSelected({ ...selected, type: "message-attempts" });
            } else {
                setSelected({ ...selected, type: "message" });
            }
        } else if (selected.type === "endpoint" || selected.type === "endpoint-attempts") {
            if (tab === "attempts") {
                setSelected({ ...selected, type: "endpoint-attempts" });
            } else {
                setSelected({ ...selected, type: "endpoint" });
            }
        }
    }, [selected, setSelected]);

    return (
        <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
            <Header 
                baseUrl={baseUrl}
                setBaseUrl={setBaseUrl}
                token={token}
                setToken={setToken}
                saveToken={saveToken}
                setSaveToken={setSaveToken}
                copied={copied}
                copyToken={copyToken}
                isBusy={isBusy}
                setSelected={setSelected}
            />

            <main className="flex-1 flex min-h-0 relative">
                {/* Tree Column */}
                <div 
                    className="shrink-0 border-r flex flex-col bg-muted/20"
                    style={{ width: `${layout.treeWidth}px` }}
                >
                    <ScrollArea className="flex-1">
                        <div className="p-2">
                            <ResourceTree
                                selected={selected}
                                setSelected={setSelected}
                                expanded={expanded}
                                toggle={toggle}
                                eventTypes={eventTypes}
                                apps={apps}
                                endpointsByApp={endpointsByApp}
                                messagesByApp={messagesByApp}
                                loadEventTypes={loadEventTypes}
                                loadEndpoints={loadEndpoints}
                                loadMessages={loadMessages}
                                loadAttemptsForEndpoint={loadAttemptsForEndpoint}
                                selectEventType={selectEventType}
                                selectApp={selectApp}
                                selectEndpoint={selectEndpoint}
                                attemptQuery={attemptQuery}
                            />
                        </div>
                    </ScrollArea>
                    <div 
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/30 transition-colors"
                        onMouseDown={(e) => {
                            const startX = e.pageX;
                            const startWidth = layout.treeWidth;
                            const onMouseMove = (moveEvent: MouseEvent) => {
                                const nextWidth = startWidth + (moveEvent.pageX - startX);
                                setLayout(prev => ({ ...prev, treeWidth: Math.max(200, Math.min(600, nextWidth)) }));
                            };
                            const onMouseUp = () => {
                                document.removeEventListener("mousemove", onMouseMove);
                                document.removeEventListener("mouseup", onMouseUp);
                            };
                            document.addEventListener("mousemove", onMouseMove);
                            document.addEventListener("mouseup", onMouseUp);
                        }}
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex min-w-0 bg-background overflow-hidden relative">
                    <div className="flex flex-col overflow-hidden w-full h-full">
                        <div className="flex-1 min-h-0 w-full h-full">
                            <DetailView
                                selected={selected}
                                apps={apps}
                                eventTypes={eventTypes}
                                endpointsByApp={endpointsByApp}
                                messagesByApp={messagesByApp}
                                destinationsByMessage={destinationsByMessage}
                                attemptsByEndpoint={attemptsByEndpoint}
                                attemptsByMessage={attemptsByMessage}
                                appForm={appForm}
                                setAppForm={setAppForm}
                                eventTypeForm={eventTypeForm}
                                setEventTypeForm={setEventTypeForm}
                                endpointForm={endpointForm}
                                setEndpointForm={setEndpointForm}
                                messageForm={messageForm}
                                setMessageForm={setMessageForm}
                                attemptFilter={attemptFilter}
                                setAttemptFilter={setAttemptFilter}
                                createApplication={createApplication}
                                patchApplication={patchApplication}
                                deleteApplication={deleteApplication}
                                createEventType={createEventType}
                                patchEventType={patchEventType}
                                deleteEventType={deleteEventType}
                                createEndpoint={createEndpoint}
                                patchEndpoint={patchEndpoint}
                                deleteEndpoint={deleteEndpoint}
                                createMessage={createMessage}
                                resendToEndpoint={resendToEndpoint}
                                deleteMessageContent={deleteMessageContent}
                                loadAttemptsForEndpoint={loadAttemptsForEndpoint}
                                loadAttemptsForMessage={loadAttemptsForMessage}
                                loadMoreMessages={loadMoreMessages}
                                selectMessage={selectMessage}
                                isBusy={isBusy}
                                isLoadingMoreMessages={isLoadingMoreMessages}
                                readMessageIds={readMessageIds}
                                msgSearch={msgSearch}
                                onSearchChange={setMsgSearch}
                                onRefreshMessages={(appId) => loadMessages(appId, null, true)}
                                attemptQuery={attemptQuery}
                                onTabChange={handleTabChange}
                            />
                        </div>
                    </div>

                    {/* Right Detail Panel (for Message Detail) */}
                    {(selected.type === "message-folder" || selected.type === "message" || selected.type === "message-create") && (
                        <div 
                            className="hidden"
                        >
                            {/* Handled inside MessagePanel */}
                        </div>
                    )}
                </div>
            </main>

            <ConsolePanel
                history={apiHistory}
                isOpen={layout.isConsoleOpen}
                onToggle={() => setLayout(prev => ({ ...prev, isConsoleOpen: !prev.isConsoleOpen }))}
                height={layout.consoleHeight}
                setHeight={(h) => setLayout(prev => ({ ...prev, consoleHeight: h }))}
            />
        </div>
    );
}
