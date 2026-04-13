import { 
    SelectedItem,
    SvixApplication, 
    SvixEventType, 
    SvixEndpoint, 
    SvixMessage, 
    SvixAttempt 
} from "@/types/svix";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppPanel } from "./AppPanel";
import { EventTypePanel } from "./EventTypePanel";
import { EndpointPanel } from "./EndpointPanel";
import { MessagePanel } from "./MessagePanel";
import { AboutPanel } from "./AboutPanel";
import { ResourcesPanel } from "./ResourcesPanel";
import { ProducerPanel } from "./ProducerPanel";

interface DetailViewProps {
    selected: SelectedItem;
    apps: SvixApplication[];
    eventTypes: SvixEventType[];
    endpointsByApp: Record<string, SvixEndpoint[]>;
    messagesByApp: Record<string, SvixMessage[]>;
    hasMoreMessagesByApp: Record<string, boolean>;
    destinationsByMessage: Record<string, SvixEndpoint[]>;
    attemptsByEndpoint: Record<string, SvixAttempt[]>;
    attemptsByMessage: Record<string, SvixAttempt[]>;
    
    appForm: any;
    setAppForm: (f: any) => void;
    eventTypeForm: any;
    setEventTypeForm: (f: any) => void;
    endpointForm: any;
    setEndpointForm: (f: any) => void;
    messageForm: any;
    setMessageForm: (f: any) => void;
    producerForm: any;
    setProducerForm: (f: any) => void;
    attemptFilter: any;
    setAttemptFilter: (f: any) => void;
    
    createApplication: () => Promise<void>;
    patchApplication: (appId: string) => Promise<void>;
    deleteApplication: (appId: string) => Promise<void>;
    createEventType: () => Promise<void>;
    patchEventType: (name: string) => Promise<void>;
    deleteEventType: (name: string) => Promise<void>;
    createEndpoint: (appId: string) => Promise<void>;
    patchEndpoint: (appId: string, endpointId: string) => Promise<void>;
    deleteEndpoint: (appId: string, endpointId: string) => Promise<void>;
    createMessage: (appId: string) => Promise<void>;
    createProducerMessage: (appId: string) => Promise<void>;
    stopEmission?: () => void;
    isEmitting?: boolean;
    emissionProgress?: { current: number; total: number };
    resendToEndpoint: any;
    deleteMessageContent: any;
    
    loadAttemptsForEndpoint: any;
    loadAttemptsForMessage: any;
    loadMoreMessages: any;
    selectMessage: any;
    
    isBusy: boolean;
    isLoadingMoreMessages: boolean;
    readMessageIds: Set<string>;
    msgSearch: string;
    onSearchChange: (s: string) => void;
    onRefreshMessages: (appId: string) => void;
    attemptQuery: () => string;
    onTabChange?: (tab: string) => void;
}

export function DetailView({
    selected,
    apps,
    eventTypes,
    endpointsByApp,
    messagesByApp,
    hasMoreMessagesByApp,
    destinationsByMessage,
    attemptsByEndpoint,
    attemptsByMessage,
    appForm,
    setAppForm,
    eventTypeForm,
    setEventTypeForm,
    endpointForm,
    setEndpointForm,
    messageForm,
    setMessageForm,
    producerForm,
    setProducerForm,
    attemptFilter,
    setAttemptFilter,
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
    createProducerMessage,
    stopEmission,
    isEmitting,
    emissionProgress,
    resendToEndpoint,
    deleteMessageContent,
    loadAttemptsForEndpoint,
    loadAttemptsForMessage,
    loadMoreMessages,
    selectMessage,
    isBusy,
    isLoadingMoreMessages,
    readMessageIds,
    msgSearch,
    onSearchChange,
    onRefreshMessages,
    attemptQuery,
    onTabChange,
}: DetailViewProps) {
    const selectedApp = selected.appId ? apps.find((x) => x.id === selected.appId) || null : (selected.type === "app" || selected.type === "producer" ? selected.item as SvixApplication : null);
    const selectedEndpoints = selected.appId ? endpointsByApp[selected.appId] || [] : [];
    const selectedMessages = selected.appId ? messagesByApp[selected.appId] || [] : [];
    const hasMore = selected.appId ? hasMoreMessagesByApp[selected.appId] || false : false;
    const selectedMessageDestinations = selected.appId && selected.msgId ? destinationsByMessage[`${selected.appId}:${selected.msgId}`] || [] : [];
    const selectedEndpointAttempts = selected.appId && selected.endpointId ? attemptsByEndpoint[`${selected.appId}:${selected.endpointId}`] || [] : [];
    const selectedMessageAttempts = selected.appId && selected.msgId ? attemptsByMessage[`${selected.appId}:${selected.msgId}`] || [] : [];

    if (selected.type === "event-type" || selected.type === "event-type-folder" || selected.type === "newEventType") {
        return (
            <div className="h-full w-full p-6 pb-20">
                <ScrollArea className="h-full w-full">
                    <div className="p-1 pb-10">
                        <EventTypePanel
                            selected={selected}
                            eventTypeForm={eventTypeForm}
                            setEventTypeForm={setEventTypeForm}
                            createEventType={createEventType}
                            patchEventType={patchEventType}
                            deleteEventType={deleteEventType}
                            isBusy={isBusy}
                        />
                    </div>
                </ScrollArea>
            </div>
        );
    }
    
    if (selected.type === "endpoint" || selected.type === "endpoint-folder" || selected.type === "endpoint-attempts" || selected.type === "newEndpoint") {
        return (
            <div className="h-full w-full overflow-hidden">
                <EndpointPanel
                    selected={selected}
                    endpointForm={endpointForm}
                    setEndpointForm={setEndpointForm}
                    eventTypes={eventTypes}
                    endpoints={selectedEndpoints}
                    createEndpoint={createEndpoint}
                    patchEndpoint={patchEndpoint}
                    deleteEndpoint={deleteEndpoint}
                    isBusy={isBusy}
                    onTabChange={onTabChange}
                    attempts={selectedEndpointAttempts}
                    attemptFilter={attemptFilter}
                    setAttemptFilter={setAttemptFilter}
                    loadAttempts={loadAttemptsForEndpoint}
                    attemptQuery={attemptQuery}
                />
            </div>
        );
    }
    
    if (selected.type === "message-folder" || selected.type === "message" || selected.type === "message-create" || selected.type === "message-attempts") {
        return (
            <div className="h-full w-full overflow-hidden">
                <MessagePanel
                    selected={selected}
                    messages={selectedMessages}
                    destinations={selectedMessageDestinations}
                    isBusy={isBusy}
                    isLoadingMore={isLoadingMoreMessages}
                    readIds={readMessageIds}
                    onSelect={selectMessage}
                    onLoadMore={loadMoreMessages}
                    onResend={resendToEndpoint}
                    onDeleteContent={deleteMessageContent}
                    msgSearch={msgSearch}
                    onSearchChange={onSearchChange}
                    onRefresh={onRefreshMessages}
                    messageForm={messageForm}
                    setMessageForm={setMessageForm}
                    createMessage={createMessage}
                    eventTypes={eventTypes}
                    attemptQuery={attemptQuery}
                    loadAttemptsForMessage={loadAttemptsForMessage}
                    selectedMessageAttempts={selectedMessageAttempts}
                    onTabChange={onTabChange}
                />
            </div>
        );
    }

    if (selected.type === "about") {
        return (
            <div className="h-full w-full p-6 pb-20">
                <ScrollArea className="h-full w-full">
                    <div className="p-1 pb-10">
                        <AboutPanel />
                    </div>
                </ScrollArea>
            </div>
        );
    }


    if (selected.type === "resources") {
        return (
            <div className="h-full w-full p-6 pb-20">
                <ScrollArea className="h-full w-full">
                    <div className="p-1 pb-10">
                        <ResourcesPanel />
                    </div>
                </ScrollArea>
            </div>
        );
    }
    
    if (selected.type === "producer") {
        return (
            <div className="h-full w-full p-6 pb-20">
                <ScrollArea className="h-full w-full">
                    <div className="p-1 pb-10">
                        <ProducerPanel
                            selected={selected}
                            apps={apps}
                            eventTypes={eventTypes}
                            producerForm={producerForm}
                            setProducerForm={setProducerForm}
                            createProducerMessage={createProducerMessage}
                            stopEmission={stopEmission}
                            isEmitting={isEmitting}
                            emissionProgress={emissionProgress}
                            isBusy={isBusy}
                        />
                    </div>
                </ScrollArea>
            </div>
        );
    }
    
    return (
        <div className="h-full w-full p-6 pb-20">
            <ScrollArea className="h-full w-full">
                <div className="p-1 pb-10">
                    <AppPanel
                        selectedApp={selectedApp}
                        appForm={appForm}
                        setAppForm={setAppForm}
                        createApplication={createApplication}
                        patchApplication={patchApplication}
                        deleteApplication={deleteApplication}
                        isBusy={isBusy}
                        selected={selected}
                        stats={{
                            appsCount: apps.length,
                            eventTypesCount: eventTypes.length,
                            endpointsCount: selectedEndpoints.length,
                            messagesCount: hasMore ? `${selectedMessages.length}+` : selectedMessages.length
                        }}
                    />
                </div>
            </ScrollArea>
        </div>
    );
}
