import { useEffect, useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SelectedItem } from "@/types/svix";

export function useSvixRouter() {
    const navigate = useNavigate();
    const location = useLocation();

    const [selected, setSelectedState] = useState<SelectedItem>({ type: "root" });

    // Parse URL to SelectedItem
    useEffect(() => {
        const path = location.pathname;
        const parts = path.split("/").filter(Boolean);

        let next: SelectedItem = { type: "root" };

        if (parts.length === 0) {
            next = { type: "newApp" };
        } else if (parts[0] === "about") {
            next = { type: "about" };
        } else if (parts[0] === "resources") {
            next = { type: "resources" };
        } else if (parts[0] === "apps") {
            if (parts.length === 1) {
                next = { type: "newApp" };
            } else if (parts[1] === "overview") {
                next = { type: "root" };
            } else if (parts[1] === "new") {
                next = { type: "newApp" };
            }
        } else if (parts[0] === "event-types") {
            if (parts.length === 1) {
                next = { type: "newEventType" };
            } else if (parts[1] === "overview") {
                next = { type: "event-type-folder" };
            } else {
                next = { type: "event-type", eventTypeName: parts[1] };
            }
        } else if (parts[0] === "app") {
            const appId = parts[1];
            if (parts.length === 2) {
                next = { type: "app", appId };
            } else if (parts[2] === "msg") {
                const msgId = parts[3];
                if (parts.length === 4) {
                    next = { type: "message", appId, msgId };
                } else if (parts[4] === "attempts") {
                    next = { type: "message-attempts", appId, msgId };
                } else if (parts[4] === "payload") {
                    next = { type: "message", appId, msgId };
                }
            } else if (parts[2] === "endpoint") {
                const endpointId = parts[3];
                if (parts.length === 3) {
                    next = { type: "newEndpoint", appId };
                } else if (parts.length === 4) {
                    next = { type: "endpoint", appId, endpointId };
                } else if (parts[4] === "attempts") {
                    next = { type: "endpoint-attempts", appId, endpointId };
                } else if (parts[4] === "settings") {
                    next = { type: "endpoint", appId, endpointId };
                }
            } else if (parts[2] === "endpoints") {
                if (parts.length === 3) {
                    next = { type: "newEndpoint", appId };
                } else if (parts[3] === "overview") {
                    next = { type: "endpoint-folder", appId };
                }
            } else if (parts[2] === "messages") {
                next = { type: "message-folder", appId };
            }
        }
        
        // Only update if actually different to avoid cycles
        setSelectedState(prev => {
            // Preservation of 'item' property if it's there and IDs match
            const nextWithItem = { ...next };
            if (prev.type === next.type) {
                if (next.type === "app" && next.appId === prev.appId) {
                    nextWithItem.item = prev.item;
                } else if (next.type === "message" && next.appId === prev.appId && next.msgId === prev.msgId) {
                    nextWithItem.item = prev.item;
                } else if (next.type === "endpoint" && next.appId === prev.appId && next.endpointId === prev.endpointId) {
                    nextWithItem.item = prev.item;
                } else if (next.type === "event-type" && next.eventTypeName === prev.eventTypeName) {
                    nextWithItem.item = prev.item;
                }
            }

            if (JSON.stringify(nextWithItem) !== JSON.stringify(prev)) {
                return nextWithItem;
            }
            return prev;
        });
    }, [location.pathname]); 

    // Update URL when SelectedItem changes (if not already there)
    const setSelected = useCallback((state: SelectedItem) => {
        let newPath = "/";
        if (state.type === "newApp") {
            newPath = "/apps";
        } else if (state.type === "root") {
            newPath = "/apps/overview";
        } else if (state.type === "newEventType") {
            newPath = "/event-types";
        } else if (state.type === "event-type-folder") {
            newPath = "/event-types/overview";
        } else if (state.type === "newEndpoint") {
            newPath = `/app/${state.appId}/endpoints`;
        } else if (state.type === "about") {
            newPath = "/about";
        } else if (state.type === "resources") {
            newPath = "/resources";
        } else if (state.type === "event-type") {
            newPath = `/event-types/${state.eventTypeName}`;
        } else if (state.type === "app") {
            newPath = `/app/${state.appId}`;
        } else if (state.type === "message-folder") {
            newPath = `/app/${state.appId}/messages`;
        } else if (state.type === "endpoint-folder") {
            newPath = `/app/${state.appId}/endpoints`;
        } else if (state.type === "message") {
            newPath = `/app/${state.appId}/msg/${state.msgId}`;
        } else if (state.type === "message-attempts") {
            newPath = `/app/${state.appId}/msg/${state.msgId}/attempts`;
        } else if (state.type === "endpoint") {
            newPath = `/app/${state.appId}/endpoint/${state.endpointId}`;
        } else if (state.type === "endpoint-attempts") {
            newPath = `/app/${state.appId}/endpoint/${state.endpointId}/attempts`;
        }

        if (location.pathname !== newPath) {
            navigate(newPath);
        }
        // Always update state to ensure 'item' property is updated even if path is same
        setSelectedState(state);
    }, [location.pathname, navigate]);

    return { selected, setSelected };
}
