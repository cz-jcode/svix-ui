import { useState, useCallback } from "react";
import { 
    SvixApplication, 
    SvixEventType, 
    SvixEndpoint, 
    SvixMessage, 
    SvixAttempt 
} from "@/types/svix";

export function useSvixAdminState(
    apiCall: any, 
    guarded: any, 
    msgSearch: string, 
    selected: any, 
    selectMessage: any
) {
    const [apps, setApps] = useState<SvixApplication[]>([]);
    const [eventTypes, setEventTypes] = useState<SvixEventType[]>([]);
    const [endpointsByApp, setEndpointsByApp] = useState<Record<string, SvixEndpoint[]>>({});
    const [messagesByApp, setMessagesByApp] = useState<Record<string, SvixMessage[]>>({});
    const [attemptsByEndpoint, setAttemptsByEndpoint] = useState<Record<string, SvixAttempt[]>>({});
    const [attemptsByMessage, setAttemptsByMessage] = useState<Record<string, SvixAttempt[]>>({});
    const [destinationsByMessage, setDestinationsByMessage] = useState<Record<string, SvixEndpoint[]>>({});
    
    const [msgIterator, setMsgIterator] = useState<string | null>(null);
    const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);

    const buildQuery = useCallback((params: Record<string, any>): string => {
        const search = new URLSearchParams();
        Object.entries(params || {}).forEach(([key, value]) => {
            if (value == null || value === "") return;
            if (Array.isArray(value)) {
                value.filter(Boolean).forEach((v) => search.append(key, String(v)));
            } else {
                search.set(key, String(value));
            }
        });
        const q = search.toString();
        return q ? `?${q}` : "";
    }, []);

    const loadApps = useCallback(async (force = false) => {
        if (!force && apps.length > 0) return;
        return guarded(async () => {
            const res = await apiCall("GET", `/api/v1/app${buildQuery({ limit: 100, order: "descending" })}`);
            if (!res.ok) throw new Error(`Failed to load apps: ${res.status}`);
            setApps(res.body.data ?? []);
        }, "Applications loaded.");
    }, [apiCall, guarded, buildQuery, apps.length]);

    const loadEventTypes = useCallback(async (force = false) => {
        if (!force && eventTypes.length > 0) return;
        return guarded(async () => {
            const res = await apiCall("GET", `/api/v1/event-type${buildQuery({ limit: 100, with_content: true })}`);
            if (!res.ok) throw new Error(`Failed to load event types: ${res.status}`);
            setEventTypes(res.body.data ?? []);
        }, "Event types loaded.");
    }, [apiCall, guarded, buildQuery, eventTypes.length]);

    const loadEndpoints = useCallback(async (appId: string, force = false) => {
        if (!force && endpointsByApp[appId]?.length > 0) return;
        return guarded(async () => {
            const res = await apiCall("GET", `/api/v1/app/${encodeURIComponent(appId)}/endpoint${buildQuery({ limit: 100, order: "descending" })}`);
            if (!res.ok) throw new Error(`Failed to load endpoints: ${res.status}`);
            setEndpointsByApp(prev => ({ ...prev, [appId]: res.body.data ?? [] }));
        }, `Endpoints for ${appId} loaded.`);
    }, [apiCall, guarded, buildQuery, endpointsByApp]);

    const loadMessages = useCallback(async (appId: string, iterator: string | null = null, force = false) => {
        if (!force && !iterator && messagesByApp[appId]?.length > 0 && !msgSearch.trim()) return;
        return guarded(async () => {
            const query: any = { limit: 50 };
            if (iterator) query.iterator = iterator;
            if (msgSearch.trim()) query.event_types = [msgSearch.trim()];
            
            const res = await apiCall("GET", `/api/v1/app/${encodeURIComponent(appId)}/msg${buildQuery(query)}`);
            if (!res.ok) throw new Error(`Failed to load messages: ${res.status}`);
            
            const newData: SvixMessage[] = res.body.data ?? [];
            let updatedMsgs: SvixMessage[] = [];
            if (iterator) {
                setMessagesByApp(prev => {
                    const existing = prev[appId] || [];
                    updatedMsgs = [...existing, ...newData];
                    return { ...prev, [appId]: updatedMsgs };
                });
            } else {
                updatedMsgs = newData;
                setMessagesByApp(prev => ({ ...prev, [appId]: updatedMsgs }));
            }
            setMsgIterator(res.body.iterator || null);

            // Auto-select last message if none selected
            if (updatedMsgs.length > 0 && selected.type === "message-folder" && selected.appId === appId && !selected.msgId) {
                selectMessage(appId, updatedMsgs[0]);
            }
        }, iterator ? "More messages loaded." : "Messages loaded.");
    }, [apiCall, guarded, msgSearch, buildQuery, selected, selectMessage, messagesByApp]);

    const loadMoreMessages = useCallback(async (appId: string) => {
        if (!msgIterator || isLoadingMoreMessages) return;
        setIsLoadingMoreMessages(true);
        try {
            await loadMessages(appId, msgIterator);
        } finally {
            setIsLoadingMoreMessages(false);
        }
    }, [msgIterator, isLoadingMoreMessages, loadMessages]);

    const loadAttemptsForEndpoint = useCallback(async (appId: string, endpointId: string, queryStr: string) => {
        return guarded(async () => {
            const res = await apiCall("GET", `/api/v1/app/${encodeURIComponent(appId)}/attempt/endpoint/${encodeURIComponent(endpointId)}${queryStr}`);
            if (!res.ok) throw new Error(`Failed to load endpoint attempts: ${res.status}`);
            setAttemptsByEndpoint((s) => ({ ...s, [`${appId}:${endpointId}`]: res.body.data ?? [] }));
        }, "Endpoint attempts loaded.");
    }, [apiCall, guarded]);

    const loadAttemptsForMessage = useCallback(async (appId: string, msgId: string, queryStr: string) => {
        return guarded(async () => {
            const res = await apiCall("GET", `/api/v1/app/${encodeURIComponent(appId)}/attempt/msg/${encodeURIComponent(msgId)}${queryStr}`);
            if (!res.ok) throw new Error(`Failed to load message attempts: ${res.status}`);
            setAttemptsByMessage((s) => ({ ...s, [`${appId}:${msgId}`]: res.body.data ?? [] }));
        }, "Message attempts loaded.");
    }, [apiCall, guarded]);

    const loadDestinationsForMessage = useCallback(async (appId: string, msgId: string) => {
        return guarded(async () => {
            const res = await apiCall("GET", `/api/v1/app/${encodeURIComponent(appId)}/msg/${encodeURIComponent(msgId)}/endpoint${buildQuery({ limit: 100 })}`);
            if (!res.ok) throw new Error(`Failed to load message destinations: ${res.status}`);
            setDestinationsByMessage((s) => ({ ...s, [`${appId}:${msgId}`]: res.body.data ?? [] }));
        }, "Message destinations loaded.");
    }, [apiCall, guarded, buildQuery]);

    return {
        apps, setApps,
        eventTypes, setEventTypes,
        endpointsByApp, setEndpointsByApp,
        messagesByApp, setMessagesByApp,
        attemptsByEndpoint, setAttemptsByEndpoint,
        attemptsByMessage, setAttemptsByMessage,
        destinationsByMessage, setDestinationsByMessage,
        msgIterator, setMsgIterator,
        isLoadingMoreMessages,
        loadApps,
        loadEventTypes,
        loadEndpoints,
        loadMessages,
        loadMoreMessages,
        loadAttemptsForEndpoint,
        loadAttemptsForMessage,
        loadDestinationsForMessage,
        buildQuery
    };
}
