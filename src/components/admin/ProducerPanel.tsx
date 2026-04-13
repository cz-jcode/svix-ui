import { useEffect, useState } from "react";
import { SvixApplication, SvixEventType, SelectedItem } from "@/types/svix";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Play, RotateCcw, StopCircle, Loader2, Clock, Copy, Check } from "lucide-react";

interface ProducerPanelProps {
    selected: SelectedItem;
    apps: SvixApplication[];
    eventTypes: SvixEventType[];
    producerForm: any;
    setProducerForm: (f: any) => void;
    createProducerMessage: (appId: string) => Promise<void>;
    isBusy: boolean;
    isEmitting?: boolean;
    emissionProgress?: { 
        current: number; 
        total: number; 
        currentPayload?: any;
        nextPayload?: any;
        lastEmittedAt?: number | null;
        nextEmissionAt?: number | null;
    };
    stopEmission?: () => void;
}

export function ProducerPanel({
    selected,
    apps,
    eventTypes,
    producerForm,
    setProducerForm,
    createProducerMessage,
    isBusy,
    isEmitting = false,
    emissionProgress = { current: 0, total: 0, currentPayload: null },
    stopEmission,
}: ProducerPanelProps) {
    const [copiedLast, setCopiedLast] = useState(false);
    const [copiedNext, setCopiedNext] = useState(false);
    const [msLeft, setMsLeft] = useState<number | null>(null);

    const copyToClipboard = async (text: string, type: 'last' | 'next') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'last') {
                setCopiedLast(true);
                setTimeout(() => setCopiedLast(false), 2000);
            } else {
                setCopiedNext(true);
                setTimeout(() => setCopiedNext(false), 2000);
            }
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    useEffect(() => {
        if (!isEmitting || !emissionProgress.nextEmissionAt) {
            setMsLeft(null);
            return;
        }

        const interval = setInterval(() => {
            const left = Math.max(0, emissionProgress.nextEmissionAt! - Date.now());
            setMsLeft(left);
        }, 100);

        return () => clearInterval(interval);
    }, [isEmitting, emissionProgress.nextEmissionAt]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!producerForm?.appId) return;
        await createProducerMessage(producerForm.appId);
    };

    if (!producerForm) return null;

    return (
        <div className="flex-1 space-y-6 w-full text-foreground">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-500/10 rounded-2xl ring-1 ring-amber-500/20">
                    <Zap className="h-8 w-8 text-amber-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Message Producer</h1>
                    <p className="text-muted-foreground mt-1">Emit messages to your applications. Support for repeated emission with field incrementing.</p>
                </div>
            </div>

            <Card className="relative overflow-hidden">
                {isEmitting && (
                    <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
                        <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                        <div className="text-center w-full max-w-2xl px-6">
                            <h3 className="text-xl font-bold italic tracking-tighter">Emitting Messages...</h3>
                            <div className="flex items-center justify-center gap-4 mt-2 mb-4">
                                <div className="text-center">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Progress</p>
                                    <p className="font-mono text-lg">{emissionProgress.current} / {emissionProgress.total}</p>
                                </div>
                                {msLeft !== null && msLeft > 0 && (
                                    <div className="text-center border-l pl-4">
                                        <p className="text-[10px] uppercase font-bold text-amber-500 tracking-widest flex items-center gap-1 justify-center">
                                            <Clock className="h-2 w-2" /> Next in
                                        </p>
                                        <p className="font-mono text-lg text-amber-500">{(msLeft / 1000).toFixed(1)}s</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left w-full">
                                <div className="bg-muted/50 rounded-lg p-3 border border-border/50 relative group">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Last Emitted</p>
                                        <button 
                                            onClick={() => emissionProgress.currentPayload && copyToClipboard(JSON.stringify(emissionProgress.currentPayload, null, 2), 'last')}
                                            className="p-1 hover:bg-background rounded-md transition-colors text-muted-foreground hover:text-foreground"
                                            title="Copy to clipboard"
                                        >
                                            {copiedLast ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                        </button>
                                    </div>
                                    <pre className="text-xs font-mono text-muted-foreground/80 overflow-y-auto max-h-[150px] custom-scrollbar">
                                        {emissionProgress.currentPayload ? JSON.stringify(emissionProgress.currentPayload, null, 2) : "None"}
                                    </pre>
                                </div>
                                <div className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/20 relative group">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-amber-500">Next to Emit</p>
                                        <button 
                                            onClick={() => emissionProgress.nextPayload && copyToClipboard(JSON.stringify(emissionProgress.nextPayload, null, 2), 'next')}
                                            className="p-1 hover:bg-amber-500/10 rounded-md transition-colors text-amber-500/70 hover:text-amber-500"
                                            title="Copy to clipboard"
                                        >
                                            {copiedNext ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                        </button>
                                    </div>
                                    <pre className="text-xs font-mono text-amber-500/80 overflow-y-auto max-h-[150px] custom-scrollbar">
                                        {emissionProgress.nextPayload ? JSON.stringify(emissionProgress.nextPayload, null, 2) : "Finalizing..."}
                                    </pre>
                                </div>
                            </div>
                        </div>
                        <Button 
                            variant="destructive" 
                            size="lg"
                            className="font-bold uppercase tracking-widest shadow-lg shadow-destructive/20"
                            onClick={stopEmission}
                        >
                            <StopCircle className="mr-2 h-5 w-5" />
                            Stop
                        </Button>
                    </div>
                )}
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="eventType">Event Type</Label>
                                <Select
                                    value={producerForm?.eventType || ""}
                                    onValueChange={(v) => setProducerForm({ ...producerForm, eventType: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an event type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {eventTypes.map((et) => (
                                            <SelectItem key={et.name} value={et.name}>
                                                {et.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payload">JSON Payload</Label>
                            <Textarea
                                id="payload"
                                className="font-mono text-xs h-40"
                                value={producerForm.payload}
                                onChange={(e) => setProducerForm({ ...producerForm, payload: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="repeatCount">Repeat Count</Label>
                                <Input
                                    id="repeatCount"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={producerForm.repeatCount}
                                    onChange={(e) => setProducerForm({ ...producerForm, repeatCount: parseInt(e.target.value, 10) || 1 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="repeatDelay">Delay (ms)</Label>
                                <Input
                                    id="repeatDelay"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={producerForm.repeatDelay}
                                    onChange={(e) => setProducerForm({ ...producerForm, repeatDelay: parseInt(e.target.value, 10) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="incrementField">Increment Field</Label>
                                <Input
                                    id="incrementField"
                                    placeholder="e.g. id"
                                    value={producerForm.incrementField}
                                    onChange={(e) => setProducerForm({ ...producerForm, incrementField: e.target.value })}
                                />
                                <p className="text-[10px] text-muted-foreground">Increments numeric or string-numeric field in payload.</p>
                            </div>
                        </div>

                        <div className="flex justify-start gap-2 pt-4">
                            <Button type="submit" disabled={isBusy || !producerForm.appId || !producerForm.eventType || producerForm.eventType === "none"}>
                                <Play className="mr-2 h-4 w-4" />
                                Emit {producerForm.repeatCount > 1 ? `${producerForm.repeatCount} Messages` : "Message"}
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setProducerForm({ ...producerForm, payload: '{\n  "id": 1,\n  "status": "pending",\n  "data": "example"\n}' })}
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reset Payload
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
