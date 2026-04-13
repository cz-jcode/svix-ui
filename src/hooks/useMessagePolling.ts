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

        let timeoutId: any;
        const DEFAULT_INTERVAL = 3000;
        const ERROR_INTERVAL = 10000;

        const poll = async () => {
            let nextInterval = DEFAULT_INTERVAL;
            try {
                const now = Date.now();
                if (now - ((window as any)._svix_last_error_time || 0) < 2000) {
                   // Global debounce for polling too
                   nextInterval = ERROR_INTERVAL;
                   return;
                }
                const query: any = { limit: 10 };
                if (msgSearch.trim()) query.event_types = [msgSearch.trim()];
                
                const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/app/${encodeURIComponent(appId)}/msg${buildQuery(query)}`, {
                    headers: apiHeaders
                });
                
                if (!res.ok) {
                    const now = Date.now();
                    (window as any)._svix_last_error_time = now;
                    nextInterval = ERROR_INTERVAL;
                } else {
                    const body = await res.json();
                    const newData: SvixMessage[] = body?.data ?? [];
                    
                    setMessagesByApp((s) => {
                        const existing = s[appId] || [];
                        const existingIds = new Set(existing.map((m: SvixMessage) => m.id));
                        const newOnes = newData.filter((m: SvixMessage) => !existingIds.has(m.id));
                        if (newOnes.length === 0) return s;
                        return { ...s, [appId]: [...newOnes, ...existing] };
                    });
                }
            } catch (e) {
                // silent background error
                (window as any)._svix_last_error_time = Date.now();
                nextInterval = ERROR_INTERVAL;
            } finally {
                timeoutId = setTimeout(poll, nextInterval);
            }
        };

        timeoutId = setTimeout(poll, DEFAULT_INTERVAL);

        return () => clearTimeout(timeoutId);
    }, [enabled, baseUrl, token, selected.type, selected.appId, msgSearch, apiHeaders, buildQuery, setMessagesByApp]);
}
