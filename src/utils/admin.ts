export function pretty(value: any): string {
    if (value == null) return "";
    if (typeof value === "string") {
        try {
            return JSON.stringify(JSON.parse(value), null, 2);
        } catch {
            return value;
        }
    }
    return JSON.stringify(value, null, 2);
}

export function parseJsonSafe(text: string | null | undefined, fallback: any = undefined): any {
    if (!text?.trim()) return fallback;
    try {
        return JSON.parse(text);
    } catch {
        throw new Error("Invalid JSON");
    }
}

export function classNames(...parts: (string | boolean | undefined | null)[]): string {
    return parts.filter(Boolean).join(" ");
}

export function statusTone(status: number | string): string {
    switch (Number(status)) {
        case 0:
            return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
        case 1:
            return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
        case 2:
            return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
        case 3:
            return "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300";
        default:
            return "bg-muted text-foreground";
    }
}

export function statusLabel(status: number | string | null | undefined): string {
    switch (Number(status)) {
        case 0:
            return "success";
        case 1:
            return "pending";
        case 2:
            return "fail";
        case 3:
            return "sending";
        default:
            return String(status ?? "-");
    }
}

export async function readJson(response: Response): Promise<any> {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}
