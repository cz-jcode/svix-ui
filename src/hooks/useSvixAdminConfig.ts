import { useState, useEffect } from "react";
import { LayoutState } from "@/types/svix";

const LS_KEY = "svix-admin-ui-tree-config";
const LS_LAYOUT_KEY = "svix-admin-ui-layout";
const LS_SAVE_TOKEN_KEY = "svix-admin-ui-save-token";

export interface ConfigOptions {
    defaultBaseUrl: string;
    defaultToken: string;
    defaultSaveToken: boolean;
}

export function useSvixAdminConfig(options: ConfigOptions) {
    const [baseUrl, setBaseUrl] = useState<string>(() => {
        try {
            const configRaw = window.localStorage.getItem(LS_KEY);
            if (configRaw) {
                const saved = JSON.parse(configRaw);
                if (saved.baseUrl) return saved.baseUrl;
            }
        } catch { /* ignore */ }
        return options.defaultBaseUrl;
    });
    const [token, setToken] = useState<string>(() => {
        try {
            const configRaw = window.localStorage.getItem(LS_KEY);
            if (configRaw) {
                const saved = JSON.parse(configRaw);
                if (saved.token) return saved.token;
            }
        } catch { /* ignore */ }
        return options.defaultToken;
    });
    const [saveToken, setSaveToken] = useState<boolean>(() => {
        try {
            const saved = window.localStorage.getItem(LS_SAVE_TOKEN_KEY);
            if (saved !== null) return saved === "true";
            return options.defaultSaveToken;
        } catch {
            return options.defaultSaveToken;
        }
    });

    const [layout, setLayout] = useState<LayoutState>({
        treeWidth: 320,
        messagesWidth: 300,
        detailWidth: 600,
        consoleHeight: 300,
        isConsoleOpen: false,
    });

    // Load initial layout
    useEffect(() => {
        const layoutRaw = window.localStorage.getItem(LS_LAYOUT_KEY);
        if (layoutRaw) {
            try {
                const saved = JSON.parse(layoutRaw);
                setLayout((prev) => ({ ...prev, ...saved }));
            } catch (e) {
                console.error("Failed to parse layout from localStorage", e);
            }
        }
    }, []);

    // Persist layout
    useEffect(() => {
        window.localStorage.setItem(LS_LAYOUT_KEY, JSON.stringify({
            treeWidth: layout.treeWidth,
            messagesWidth: layout.messagesWidth,
            detailWidth: layout.detailWidth,
            consoleHeight: layout.consoleHeight,
            isConsoleOpen: layout.isConsoleOpen,
        }));
    }, [layout.treeWidth, layout.messagesWidth, layout.detailWidth, layout.consoleHeight, layout.isConsoleOpen]);

    // Persist saveToken preference
    useEffect(() => {
        window.localStorage.setItem(LS_SAVE_TOKEN_KEY, String(saveToken));
    }, [saveToken]);

    // Persist general config (baseUrl, token)
    useEffect(() => {
        const config: any = { baseUrl };
        if (saveToken) {
            config.token = token;
        }
        window.localStorage.setItem(LS_KEY, JSON.stringify(config));
    }, [baseUrl, token, saveToken]);

    const updateSaveToken = (v: boolean) => {
        setSaveToken(v);
        if (!v) {
            // Remove token from LS immediately when disabled
            const raw = window.localStorage.getItem(LS_KEY);
            if (raw) {
                try {
                    const saved = JSON.parse(raw);
                    delete saved.token;
                    window.localStorage.setItem(LS_KEY, JSON.stringify(saved));
                } catch { /* ignore */ }
            }
        }
    };

    return {
        baseUrl, setBaseUrl,
        token, setToken,
        saveToken, setSaveToken: updateSaveToken,
        layout, setLayout
    };
}
