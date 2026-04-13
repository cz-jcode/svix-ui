import { useEffect, useRef } from "react";
import { SvixMessage } from "@/types/svix";

export function useMessagePolling(
    baseUrl: string,
    token: string,
    selected: any,
    msgSearch: string,
    apiCall: (method: string, path: string, body?: any, extraHeaders?: Record<string, string>) => Promise<any>,
    buildQuery: (params: Record<string, any>) => string,
    setMessagesByApp: (fn: (prev: Record<string, SvixMessage[]>) => Record<string, SvixMessage[]>) => void,
    enabled: boolean = true
) {
    const apiCallRef = useRef(apiCall);
    apiCallRef.current = apiCall;
    const buildQueryRef = useRef(buildQuery);
    buildQueryRef.current = buildQuery;
    const setMessagesByAppRef = useRef(setMessagesByApp);
    setMessagesByAppRef.current = setMessagesByApp;

    useEffect(() => {
        if (!enabled || !baseUrl || !token) return;
        const appId = selected.appId;
        if (!appId) return;

        let timeoutId: any;
        let isCancelled = false;
        const DEFAULT_INTERVAL = 3000;
        const ERROR_INTERVAL = 10000;

        const poll = async () => {
            if (isCancelled || !enabled || !baseUrl || !token) return;
            const appId = selected.appId;
            if (!appId) return;

            let nextInterval = DEFAULT_INTERVAL;
            try {
                const now = Date.now();
                const lastError = (window as any)._svix_last_error_time || 0;
                if (now - lastError < 2000) {
                   if (!isCancelled) timeoutId = setTimeout(poll, 2000);
                   return;
                }
                const query: any = { limit: 50 };
                if (msgSearch.trim()) query.event_types = [msgSearch.trim()];
                
                const path = `/api/v1/app/${encodeURIComponent(appId)}/msg${buildQueryRef.current(query)}`;
                console.log(`[POLLING] Fetching: ${path}`);
                const res = await apiCallRef.current("GET", path);
                
                if (isCancelled) return;

                if (!res.ok) {
                    console.error(`[POLLING] Request failed: ${res.status}`);
                    (window as any)._svix_last_error_time = Date.now();
                    nextInterval = ERROR_INTERVAL;
                } else {
                    const body = res.body;
                    const newData: SvixMessage[] = body?.data ?? [];
                    
                    if (newData.length > 0 && !isCancelled) {
                        setMessagesByAppRef.current((s: any) => {
                            const existing = s[appId] || [];
                            const existingIds = new Set(existing.map((m: SvixMessage) => m.id));
                            const newOnes = newData.filter((m: SvixMessage) => !existingIds.has(m.id));
                            if (newOnes.length === 0) return s;
                            console.log(`[POLLING] Found ${newOnes.length} new messages for app ${appId}`);
                            return { ...s, [appId]: [...newOnes, ...existing] };
                        });
                    }
                }
            } catch (e) {
                if (!isCancelled) {
                    console.error("[POLLING] Network error:", e);
                    (window as any)._svix_last_error_time = Date.now();
                    nextInterval = ERROR_INTERVAL;
                }
            } finally {
                if (!isCancelled) {
                    timeoutId = setTimeout(poll, nextInterval);
                }
            }
        };

        timeoutId = setTimeout(poll, 100); 

        return () => {
            isCancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [enabled, baseUrl, token, selected.appId, msgSearch]);
}
