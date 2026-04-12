import { useState, Dispatch, SetStateAction, useCallback } from "react";
import { ToastMessage, ApiHistoryEntry } from "@/types/svix";

/**
 * Hook for managing system toast messages that are also stored in API history.
 * @param {Dispatch<SetStateAction<ApiHistoryEntry[]>>} setApiHistory - State setter for API history.
 */
export function useToastState(setApiHistory: Dispatch<SetStateAction<ApiHistoryEntry[]>>) {
    const [message, setMessage] = useState<ToastMessage | null>(null);

    /**
     * Pushes a new message to the history and sets current toast.
     * @param {ToastMessage["kind"]} kind - 'success' or 'error'
     * @param {string} text - Message content
     */
    const push = useCallback((kind: ToastMessage["kind"], text: string) => {
        const entry: ApiHistoryEntry = {
            id: Date.now() + Math.random(),
            type: "system",
            kind,
            text,
            timestamp: new Date().toLocaleTimeString(),
        };
        setApiHistory((prev) => [entry, ...prev].slice(0, 100));
        setMessage({ kind, text, id: entry.id });
    }, [setApiHistory]);

    return { message, push, clear: useCallback(() => setMessage(null), []) };
}
