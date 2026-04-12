import { ExternalLink, Globe, FileJson } from "lucide-react";

function SvixIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 208.72 208.72"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="104.36" cy="104.36" r="104.36" fill="#ffffff" />
            <g>
                <path
                    fill="#2c70ff"
                    d="M165.95,89.06c-17.29-.82-33.49-10.36-41.03-27.09-3.33-7.39-10.72-12.29-18.82-12.51-17.17-.46-28.06,21.09-17.28,34.67,3.7,4.67,9.27,7.26,16.53,7.73v.04c14.04,1,26.15,7.07,34.15,17.12,14.69,18.48,12.55,46.37-4.47,62.56-20.53,19.52-54.76,15.53-70.41-7.94-1.39-2.09-2.61-4.29-3.64-6.57-3.33-7.39-10.72-12.29-18.82-12.50-8.39-.23-16.24,2.97-21.22,8.32,16.42,28.18,46.73,47.34,81.72,47.94,53.28.93,97.23-41.5,98.16-94.78.16-8.98-.95-17.68-3.1-25.96.45,1.72-13.4,6.53-14.94,6.98-5.56,1.6-11.26,2.25-16.84,1.98Z"
                />
                <path
                    fill="#2c70ff"
                    d="M42.79,119.52c17.66.45,33.76,11.13,41.02,27.25,3.33,7.39,10.72,12.29,18.82,12.50,5.63.16,11.04-1.93,15.13-5.83,7.67-7.3,8.73-20.53,2.13-28.84-3.7-4.67-9.27-7.26-16.53-7.73v-.04c-14.04-1-26.16-7.07-34.15-17.12-17.78-22.36-10.23-55.64,14.26-69.38,7.06-3.96,15.14-6.11,23.25-5.9,17.66.45,33.76,11.13,41.02,27.25,3.33,7.39,10.72,12.29,18.82,12.51,8.41.23,16.26-2.97,21.22-8.32-16.42-28.19-46.75-47.35-81.74-47.98C52.78,6.98,8.84,49.41,7.89,102.69c-.16,8.98.95,17.68,3.09,25.96,8.96-6.08,20.05-9.39,31.81-9.12Z"
                />
            </g>
        </svg>
    );
}

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

function JunieIcon({ className }: { className?: string }) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M25 15H35V16.75C35 29 30.5001 35 16.5001 35H15V25H16.5001C22.6251 25 25 22.875 25 16.75V15Z"
                fill="#48E054"
            />
            <rect x="5" y="15" width="10" height="10" fill="#48E054" />
            <rect x="15" y="5" width="10" height="10" fill="#48E054" />
        </svg>
    );
}

export function ResourcesPanel() {
    return (
        <div className="flex-1 space-y-6 w-full text-foreground">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-2xl ring-1 ring-primary/20">
                    <Globe className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
                    <p className="text-muted-foreground mt-1">Useful links and resources related to the project.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a 
                    href="https://github.com/cz-jcode/svix-ui" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border/40 transition-all hover:scale-[1.02] group"
                >
                    <div className="p-2 bg-blue-600/20 rounded-lg mr-4 ring-1 ring-blue-600/40">
                        <GithubIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <div className="font-medium flex items-center gap-2 text-foreground">
                            SVIX UI Admin
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">This dashboard repository</div>
                    </div>
                </a>

                <a 
                    href="https://github.com/sopak" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border/40 transition-all hover:scale-[1.02] group"
                >
                    <div className="p-2 bg-black rounded-lg mr-4 text-white">
                        <GithubIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <div className="font-medium flex items-center gap-2 text-foreground">
                            Kamil Sopko
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">Creator's GitHub profile</div>
                    </div>
                </a>

                <a 
                    href="https://github.com/cz-jcode" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border/40 transition-all hover:scale-[1.02] group"
                >
                    <div className="p-2 bg-primary/20 rounded-lg mr-4 ring-1 ring-primary/40">
                        <GithubIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="font-medium flex items-center gap-2 text-foreground">
                            J-CODE
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 italic">cz-jcode organization</div>
                    </div>
                </a>

                <a 
                    href="https://www.svix.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border/40 transition-all hover:scale-[1.02] group"
                >
                    <div className="p-2 bg-primary/20 rounded-lg mr-4 ring-1 ring-primary/30">
                        <SvixIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                            Svix.com
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">Official platform for Webhooks</div>
                    </div>
                </a>

                <a 
                    href="/openapi-svix.json" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border/40 transition-all hover:scale-[1.02] group"
                >
                    <div className="p-2 bg-blue-500/20 rounded-lg mr-4">
                        <FileJson className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                            OpenAPI Spec
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">Svix API v1.1.1 definition</div>
                    </div>
                </a>

                <a 
                    href="https://www.jetbrains.com/junie/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border/40 transition-all hover:scale-[1.02] group"
                >
                    <div className="p-2 bg-[#48E054]/10 rounded-lg mr-4 ring-1 ring-[#48E054]/20">
                        <JunieIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                            JetBrains Junie
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">Professional AI Assistant</div>
                    </div>
                </a>
            </div>
        </div>
    );
}
