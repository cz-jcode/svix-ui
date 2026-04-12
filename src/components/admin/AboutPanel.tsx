import { Info, Cpu, ShieldCheck, Globe, ExternalLink, Mail } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
    );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AboutPanel() {
    return (
        <div className="flex-1 space-y-6 w-full text-foreground">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-2xl ring-1 ring-primary/20">
                    <Info className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">About J-CODE SVIX UI</h1>
                    <p className="text-muted-foreground mt-1">Modern administrative interface for managing Svix Webhooks.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card/40 border-border/60 backdrop-blur-sm overflow-hidden group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Cpu className="h-5 w-5 text-primary" />
                            AI-Driven Experiment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed relative z-10">
                        This project was developed as an experimental AI-driven dashboard. Almost all code, 
                        architecture, and UI elements were generated and iterated using advanced AI models under human supervision. 
                        The goal was to create a highly efficient and "human-readable" tool for debugging webhooks.
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border/60 backdrop-blur-sm overflow-hidden group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            Human Readable & Fast
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed relative z-10">
                        The focus is on clarity. No unnecessary animations or deeply nested menus. 
                        You see everything important on one screen with the ability to drill down into the details 
                        of individual messages, payloads, and delivery attempts.
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border/60 backdrop-blur-sm overflow-hidden group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Globe className="h-5 w-5 text-blue-500" />
                            Core Functionality
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2 relative z-10">
                        <p>Manage the entire Svix lifecycle in one place:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong>Applications:</strong> Create and manage message namespaces.</li>
                            <li><strong>Endpoints:</strong> Configure URLs and event filters for delivery.</li>
                            <li><strong>Messages:</strong> Send, view, and inspect webhook payloads.</li>
                            <li><strong>Attempts:</strong> Track delivery status and resend failed webhooks.</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border/60 backdrop-blur-sm overflow-hidden group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <GithubIcon className="h-5 w-5 text-purple-500" />
                            The Creator
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3 relative z-10">
                        <p>
                            Build by <a href="https://github.com/sopak" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 font-bold text-foreground transition-all hover:scale-105">Kamil Sopko <ExternalLink className="h-3 w-3" /></a>
                        </p>
                        <p className="flex items-center gap-2">
                            Organization: <a href="https://github.com/cz-jcode" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 font-medium italic opacity-90 hover:opacity-100 transition-opacity">J-CODE (cz-jcode) <ExternalLink className="h-3 w-3" /></a>
                        </p>
                        <p className="flex items-center gap-2 pt-1 border-t border-border/40">
                            Email: <a href="mailto:kamil.sopko@jcode.cz" className="text-primary hover:underline inline-flex items-center gap-1 font-medium"><Mail className="h-3.5 w-3.5" /> kamil.sopko@jcode.cz</a>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
