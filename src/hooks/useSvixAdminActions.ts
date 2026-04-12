import { useCallback } from "react";
import { parseJsonSafe, pretty } from "@/utils/admin";
import { SelectedItem, SvixApplication, SvixEndpoint, SvixMessage, SvixEventType } from "@/types/svix";

export function useSvixAdminActions(
    apiCall: any,
    guarded: any,
    loadApps: (force?: boolean) => Promise<void>,
    loadEventTypes: (force?: boolean) => Promise<void>,
    loadEndpoints: (appId: string, force?: boolean) => Promise<void>,
    loadMessages: (appId: string, iterator?: string | null, force?: boolean) => Promise<void>,
    setSelected: (state: SelectedItem) => void,
    setAppForm: (form: any) => void,
    setEndpointForm: (form: any) => void,
    setEventTypeForm: (form: any) => void,
    setExpanded: (fn: (prev: any) => any) => void,
    setReadMessageIds: (fn: (prev: Set<string>) => Set<string>) => void,
    appForm: any,
    eventTypeForm: any,
    endpointForm: any,
    messageForm: any,
    apps: SvixApplication[],
    eventTypes: SvixEventType[],
    endpointsByApp: Record<string, SvixEndpoint[]>,
    messagesByApp: Record<string, SvixMessage[]>,
    toast: any
) {
    const selectApp = useCallback(async (app: SvixApplication) => {
        setSelected({ type: "app", appId: app.id, item: app } as any);
        setAppForm({
            name: app.name || "",
            uid: (app as any).uid || "",
            throttleRate: (app as any).throttleRate ?? "",
            metadata: pretty(app.metadata || {}),
        });
        setExpanded((s) => ({ ...s, [`app:${app.id}`]: true }));
        if (!endpointsByApp[app.id]) await loadEndpoints(app.id);
        if (!messagesByApp[app.id]) await loadMessages(app.id);
    }, [setSelected, setAppForm, setExpanded, endpointsByApp, messagesByApp, loadEndpoints, loadMessages]);

    const selectEndpoint = useCallback((appId: string, endpoint: SvixEndpoint) => {
        setSelected({ type: "endpoint", appId, endpointId: endpoint.id, item: endpoint });
        setEndpointForm({
            url: endpoint.url || "",
            description: endpoint.description || "",
            uid: endpoint.uid || "",
            secret: "",
            throttleRate: endpoint.throttleRate?.toString() ?? "",
            disabled: Boolean(endpoint.disabled),
            filterTypes: pretty(endpoint.filterTypes || []),
            channels: pretty(endpoint.channels || []),
            metadata: pretty(endpoint.metadata || {}),
        });
    }, [setSelected, setEndpointForm]);

    const selectMessage = useCallback(async (appId: string, msg: SvixMessage) => {
        setSelected({ type: "message", appId, msgId: msg.id, item: msg });
        setReadMessageIds(prev => {
            if (prev.has(msg.id)) return prev;
            const next = new Set(prev);
            next.add(msg.id);
            if (next.size > 1000) {
                const arr = Array.from(next);
                return new Set(arr.slice(arr.length - 1000));
            }
            return next;
        });
    }, [setSelected, setReadMessageIds]);

    const selectEventType = useCallback((eventType: SvixEventType) => {
        setSelected({ type: "event-type", eventTypeName: eventType.name, item: eventType });
        setEventTypeForm({
            name: eventType.name || "",
            description: eventType.description || "",
            featureFlag: eventType.featureFlag || "",
            archived: Boolean(eventType.archived),
            deprecated: Boolean(eventType.deprecated),
            schemas: pretty(eventType.schemas || {}),
        });
    }, [setSelected, setEventTypeForm]);

    const selectEventTypeByName = useCallback((name: string) => {
        const et = eventTypes.find((e) => e.name === name);
        if (et) {
            selectEventType(et);
        } else {
            toast.push("error", `Event type ${name} not found in loaded list.`);
        }
    }, [eventTypes, selectEventType, toast]);

    const createApplication = useCallback(async () => {
        await guarded(async () => {
            const metadata = parseJsonSafe(appForm.metadata, {});
            const payload = {
                name: appForm.name,
                ...(appForm.uid.trim() ? { uid: appForm.uid.trim() } : {}),
                ...(appForm.throttleRate !== "" ? { throttleRate: Number(appForm.throttleRate) } : {}),
                ...(Object.keys(metadata).length ? { metadata } : {}),
            };
            const res = await apiCall("POST", "/api/v1/app", payload, { "idempotency-key": String(Date.now()) });
            if (!res.ok) throw new Error(pretty(res.body) || `HTTP ${res.status}`);
            await loadApps(true);
        }, "Application created.");
    }, [guarded, apiCall, loadApps, appForm]);

    const patchApplication = useCallback(async (appId: string) => {
        await guarded(async () => {
            const metadata = parseJsonSafe(appForm.metadata, {});
            const payload = {
                name: appForm.name,
                uid: appForm.uid || null,
                throttleRate: appForm.throttleRate === "" ? null : Number(appForm.throttleRate),
                ...(Object.keys(metadata).length ? { metadata } : { metadata: null }),
            };
            const res = await apiCall("PATCH", `/api/v1/app/${encodeURIComponent(appId)}`, payload);
            if (!res.ok) throw new Error(pretty(res.body) || `HTTP ${res.status}`);
            await loadApps(true);
            const freshRes = await apiCall("GET", `/api/v1/app/${encodeURIComponent(appId)}`);
            if (freshRes.ok) setSelected({ type: "app", appId, item: freshRes.body });
        }, "Application updated.");
    }, [guarded, apiCall, loadApps, setSelected, appForm]);

    const deleteApplication = useCallback(async (appId: string) => {
        if (!window.confirm(`Delete application ${appId}?`)) return;
        await guarded(async () => {
            const res = await apiCall("DELETE", `/api/v1/app/${encodeURIComponent(appId)}`);
            if (!res.ok && res.status !== 204) throw new Error(pretty(res.body) || `HTTP ${res.status}`);
            await loadApps(true);
        }, "Application deleted.");
    }, [guarded, apiCall, loadApps]);

    const createEventType = useCallback(async () => {
        await guarded(async () => {
            const schemas = parseJsonSafe(eventTypeForm.schemas, {});
            const payload = {
                name: eventTypeForm.name,
                description: eventTypeForm.description,
                featureFlag: eventTypeForm.featureFlag || null,
                archived: eventTypeForm.archived,
                deprecated: eventTypeForm.deprecated,
                ...(Object.keys(schemas).length ? { schemas } : {}),
            };
            const res = await apiCall("POST", "/api/v1/event-type", payload, { "idempotency-key": String(Date.now()) });
            if (!res.ok) throw new Error(pretty(res.body) || `HTTP ${res.status}`);
            await loadEventTypes(true);
        }, "Event type created.");
    }, [guarded, apiCall, loadEventTypes, eventTypeForm]);

    const patchEventType = useCallback(async (name: string) => {
        await guarded(async () => {
            const schemas = parseJsonSafe(eventTypeForm.schemas, {});
            const payload = {
                description: eventTypeForm.description,
                featureFlag: eventTypeForm.featureFlag || null,
                archived: eventTypeForm.archived,
                deprecated: eventTypeForm.deprecated,
                ...(Object.keys(schemas).length ? { schemas } : { schemas: null }),
            };
            const res = await apiCall("PATCH", `/api/v1/event-type/${encodeURIComponent(name)}`, payload);
            if (!res.ok) throw new Error(pretty(res.body) || `HTTP ${res.status}`);
            await loadEventTypes(true);
        }, "Event type patched.");
    }, [guarded, apiCall, loadEventTypes, eventTypeForm]);

    const deleteEventType = useCallback(async (name: string) => {
        if (!window.confirm(`Delete event type ${name}?`)) return;
        await guarded(async () => {
            const res = await apiCall("DELETE", `/api/v1/event-type/${encodeURIComponent(name)}`);
            if (!res.ok && res.status !== 204) throw new Error(pretty(res.body) || `HTTP ${res.status}`);
            await loadEventTypes(true);
        }, "Event type deleted.");
    }, [guarded, apiCall, loadEventTypes]);

    const createEndpoint = useCallback(async (appId: string) => {
        await guarded(async () => {
            const filterTypes = parseJsonSafe(endpointForm.filterTypes, []);
            const channels = parseJsonSafe(endpointForm.channels, []);
            const metadata = parseJsonSafe(endpointForm.metadata, {});
            const payload = {
                url: endpointForm.url,
                description: endpointForm.description,
                disabled: endpointForm.disabled,
                ...(endpointForm.uid.trim() ? { uid: endpointForm.uid.trim() } : {}),
                ...(endpointForm.secret.trim() ? { secret: endpointForm.secret.trim() } : {}),
                ...(endpointForm.throttleRate !== "" ? { throttleRate: Number(endpointForm.throttleRate) } : {}),
                ...(filterTypes.length ? { filterTypes } : {}),
                ...(channels.length ? { channels } : {}),
                ...(Object.keys(metadata).length ? { metadata } : {}),
            };
            const res = await apiCall("POST", `/api/v1/app/${encodeURIComponent(appId)}/endpoint`, payload, { "idempotency-key": String(Date.now()) });
            if (!res.ok) throw new Error(pretty(res.body) || `HTTP ${res.status}`);
            await loadEndpoints(appId, true);
        }, "Endpoint created.");
    }, [guarded, apiCall, loadEndpoints, endpointForm]);

    const patchEndpoint = useCallback(async (appId: string, endpointId: string) => {
        await guarded(async () => {
            const filterTypes = parseJsonSafe(endpointForm.filterTypes, []);
            const channels = parseJsonSafe(endpointForm.channels, []);
            const metadata = parseJsonSafe(endpointForm.metadata, {});
            const payload = {
                url: endpointForm.url,
                description: endpointForm.description,
                uid: endpointForm.uid || null,
                disabled: endpointForm.disabled,
                throttleRate: endpointForm.throttleRate === "" ? null : Number(endpointForm.throttleRate),
                ...(filterTypes.length ? { filterTypes } : { filterTypes: null }),
                ...(channels.length ? { channels } : { channels: null }),
                ...(Object.keys(metadata).length ? { metadata } : { metadata: null }),
            };
            const res = await apiCall("PATCH", `/api/v1/app/${encodeURIComponent(appId)}/endpoint/${encodeURIComponent(endpointId)}`, payload);
            if (!res.ok) throw new Error(pretty(res.body) || `HTTP ${res.status}`);
            await loadEndpoints(appId, true);
        }, "Endpoint updated.");
    }, [guarded, apiCall, loadEndpoints, endpointForm]);

    const deleteEndpoint = useCallback(async (appId: string, endpointId: string) => {
        if (!window.confirm(`Delete endpoint ${endpointId}?`)) return;
        await guarded(async () => {
            const res = await apiCall("DELETE", `/api/v1/app/${encodeURIComponent(appId)}/endpoint/${encodeURIComponent(endpointId)}`);
            if (!res.ok && res.status !== 204) throw new Error(pretty(res.body) || `HTTP ${res.status}`);
            await loadEndpoints(appId, true);
        }, "Endpoint deleted.");
    }, [guarded, apiCall, loadEndpoints, setSelected]);

    const createMessage = useCallback(async (appId: string) => {
        await guarded(async () => {
            const channels = parseJsonSafe(messageForm.channels, []);
            const payloadData = parseJsonSafe(messageForm.payload, {});
            const payload = {
                eventType: messageForm.eventType,
                ...(messageForm.eventId.trim() ? { eventId: messageForm.eventId.trim() } : {}),
                ...(channels.length ? { channels } : {}),
                payloadRetentionPeriod: Number(messageForm.payloadRetentionPeriod || 90),
                ...(Object.keys(payloadData).length ? { payload: payloadData } : {}),
            };
            const res = await apiCall("POST", `/api/v1/app/${encodeURIComponent(appId)}/msg`, payload, { "idempotency-key": String(Date.now()) });
            if (!res.ok) throw new Error(pretty(res.body) || `HTTP ${res.status}`);
            await loadMessages(appId, null, true);
        }, "Message created.");
    }, [guarded, apiCall, loadMessages, messageForm]);

    const resendToEndpoint = useCallback(async (appId: string, msgId: string, endpointId: string) => {
        await guarded(async () => {
            const res = await apiCall("POST", `/api/v1/app/${encodeURIComponent(appId)}/msg/${encodeURIComponent(msgId)}/endpoint/${encodeURIComponent(endpointId)}/resend`, {}, { "idempotency-key": String(Date.now()) });
            if (!res.ok && res.status !== 202) throw new Error(pretty(res.body) || `HTTP ${res.status}`);
        }, "Resend requested.");
    }, [guarded, apiCall]);

    const deleteMessageContent = useCallback(async (appId: string, msgId: string) => {
        if (!window.confirm(`Delete payload content for message ${msgId}?`)) return;
        await guarded(async () => {
            const res = await apiCall("DELETE", `/api/v1/app/${encodeURIComponent(appId)}/msg/${encodeURIComponent(msgId)}/content`);
            if (!res.ok && res.status !== 204) throw new Error(pretty(res.body) || `HTTP ${res.status}`);
            await loadMessages(appId);
        }, "Message content deleted.");
    }, [guarded, apiCall, loadMessages]);

    return {
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
    };
}
