import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface JsonFieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    rows?: number;
    placeholder?: string;
}

export function JsonField({ label, value, onChange, rows = 8, placeholder }: JsonFieldProps) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Textarea 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                rows={rows} 
                placeholder={placeholder} 
                className="font-mono text-xs" 
            />
        </div>
    );
}
