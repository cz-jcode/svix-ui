import { useMemo } from "react";
import { readJson } from "@/utils/admin";
import { ApiHistoryEntry } from "@/types/svix";

export interface ApiCallParams {
    method: string;
    path: string;
    body?: any;
    extraHeaders?: Record<string, string>;
}

export function useSvixApi(baseUrl: string, token: string, setApiHistory: (fn: (prev: ApiHistoryEntry[]) => ApiHistoryEntry[]) => void) {
    const headers = useMemo(() => {
        const h: Record<string, string> = { Accept: "application/json" };
        if (token) h["Authorization"] = `Bearer ${token}`;
        return h;
    }, [token]);

    const apiCall = async (method: string, path: string, body?: any, extraHeaders: Record<string, string> = {}): Promise<any> => {
        const url = `${baseUrl.replace(/\/$/, "")}${path}`;
        const started = performance.now();
        let response: Response | undefined;
        let responseBody: any;
        let error: string | null = null;
        
        try {
            response = await fetch(url, {
                method,
                headers: {
                    ...headers,
                    ...extraHeaders,
                    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
                },
                body: body !== undefined ? JSON.stringify(body) : undefined,
            });
            responseBody = await readJson(response);
        } catch (e: any) {
            error = e.message;
        }
        
        const durationMs = Math.round(performance.now() - started);
        const entry: any = {
            id: Date.now() + Math.random(),
            type: "api",
            method,
            path,
            requestBody: body,
            status: response?.status,
            ok: response?.ok,
            body: responseBody,
            durationMs,
            timestamp: new Date().toLocaleTimeString(),
            error,
        };
        
        setApiHistory((prev) => [entry, ...prev].slice(0, 100));
        
        if (response && !response.ok) {
            return { ok: false, status: response.status, body: responseBody };
        }
        
        return { ok: true, status: response?.status, body: responseBody };
    };

    return { apiCall, headers };
}
