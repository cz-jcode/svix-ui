import { useEffect } from "react";
import { SvixMessage } from "@/types/svix";

export function useMessagePolling(
    baseUrl: string,
    token: string,
    selected: any,
    msgSearch: string,
    apiHeaders: Record<string, string>,
    buildQuery: (params: Record<string, any>) => string,
    setMessagesByApp: (fn: (prev: Record<string, SvixMessage[]>) => Record<string, SvixMessage[]>) => void,
    enabled: boolean = true
) {
    useEffect(() => {
        if (!enabled || !baseUrl || !token) return;
        const appId = selected.appId;
        if (!appId) return;

        const isMessageContext = selected.type === "message-folder" || selected.type === "message" || selected.type === "message-attempts";
        if (!isMessageContext) return;

        const interval = setInterval(async () => {
            try {
                const query: any = { limit: 10 };
                if (msgSearch.trim()) query.event_types = [msgSearch.trim()];
                
                const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/app/${encodeURIComponent(appId)}/msg${buildQuery(query)}`, {
                    headers: apiHeaders
                });
                if (!res.ok) return;
                const body = await res.json();
                const newData: SvixMessage[] = body?.data ?? [];
                
                setMessagesByApp((s) => {
                    const existing = s[appId] || [];
                    const existingIds = new Set(existing.map((m: SvixMessage) => m.id));
                    const newOnes = newData.filter((m: SvixMessage) => !existingIds.has(m.id));
                    if (newOnes.length === 0) return s;
                    return { ...s, [appId]: [...newOnes, ...existing] };
                });
            } catch (e) {
                // silent background error
            }
        }, 3000); // every 3s

        return () => clearInterval(interval);
    }, [enabled, baseUrl, token, selected.type, selected.appId, msgSearch, apiHeaders, buildQuery, setMessagesByApp]);
}
