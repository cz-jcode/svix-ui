import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Copy, CheckCircle2 } from "lucide-react";
import { Logo } from "./Logo";

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

interface HeaderProps {
    baseUrl: string;
    setBaseUrl: (v: string) => void;
    token: string;
    setToken: (v: string) => void;
    saveToken: boolean;
    setSaveToken: (v: boolean) => void;
    copied: boolean;
    copyToken: () => void;
    isBusy: boolean;
    setSelected: (s: any) => void;
}

export function Header({
    baseUrl,
    setBaseUrl,
    token,
    setToken,
    saveToken,
    setSaveToken,
    copied,
    copyToken,
    isBusy,
    setSelected,
}: HeaderProps) {
    return (
        <header className="shrink-0 border-b p-4 bg-card/50 backdrop-blur flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 relative">
                        <button 
                            onClick={() => setSelected({ type: "about" })}
                            className="transition-transform active:scale-95 outline-none"
                            title="J-CODE SVIX UI - About Project"
                        >
                            <Logo className="h-10 w-10" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <a 
                            href="https://github.com/cz-jcode/svix-ui" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
                            title="View on GitHub"
                        >
                            <GithubIcon className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Save Token</Label>
                    <Switch 
                        checked={saveToken} 
                        onCheckedChange={setSaveToken} 
                    />
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                    <Label className="text-xs">Base URL</Label>
                    <Input className="h-8 w-48 text-xs font-mono" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <Label className="text-xs">Token</Label>
                    <Input className="h-8 w-32 text-xs font-mono" value={token} onChange={(e) => setToken(e.target.value)} type="password" />
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToken} title="Copy Token">
                        {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </header>
    );
}

