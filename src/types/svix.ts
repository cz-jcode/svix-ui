export interface SvixApplication {
    id: string;
    name: string;
    uid?: string;
    throttleRate?: number;
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, any>;
}

export interface SvixEventType {
    name: string;
    description: string;
    featureFlag?: string;
    archived?: boolean;
    deprecated?: boolean;
    createdAt: string;
    updatedAt: string;
    schemas?: Record<string, any>;
}

export interface SvixEndpoint {
    id: string;
    url: string;
    version: number;
    description: string;
    uid?: string;
    disabled: boolean;
    filterTypes?: string[];
    channels?: string[];
    throttleRate?: number;
    rateLimit?: number;
    status?: number;
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, any>;
}

export interface SvixMessage {
    id: string;
    eventId: string;
    eventType: string;
    payload: any;
    channels?: string[];
    createdAt: string;
    timestamp?: string;
    tags?: string[];
}

export interface SvixAttempt {
    id: string;
    msgId: string;
    endpointId: string;
    status: number;
    statusText?: string;
    responseStatusCode: number;
    response: string;
    responseDurationMs?: number;
    url?: string;
    createdAt: string;
    timestamp?: string;
    triggerType: number;
}

export interface ApiHistoryEntry {
    id: number;
    type: "api" | "system";
    kind: "success" | "error" | "info";
    text: string;
    timestamp: string;
    method?: string;
    url?: string;
    path?: string;
    status?: number;
    ok?: boolean;
    duration?: number;
    durationMs?: number;
    requestBody?: any;
    response?: any;
    body?: any;
}

export interface ToastMessage {
    kind: "success" | "error" | "info";
    text: string;
    id: number;
}

export interface LayoutState {
    treeWidth: number;
    messagesWidth: number;
    detailWidth: number;
    consoleHeight: number;
    isConsoleOpen: boolean;
}

export type SelectedType = "root" | "apps" | "app" | "eventTypes" | "event-type" | "event-type-folder" | "endpoints" | "endpoint" | "endpoint-folder" | "messages" | "message" | "message-folder" | "endpoint-attempts" | "message-attempts" | "message-create" | "newApp" | "newEventType" | "newEndpoint" | "newMessage" | "about" | "resources";

export interface SelectedItem {
    type: SelectedType;
    id?: string;
    appId?: string;
    endpointId?: string;
    eventTypeName?: string;
    item?: any;
    msgId?: string;
}
