
export function Logo({ className = "h-8 w-8", textClassName = "" }: { className?: string, textClassName?: string }) {
    return (
        <div className="flex items-center gap-2 group">
            <svg
                viewBox="0 0 100 100"
                className={className}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Background Shape */}
                <rect width="100" height="100" rx="20" fill="#0ea5e9" fillOpacity="0.1" />

                {/* Webhook Connection Lines */}
                <path
                    d="M30 50H70M50 30V70"
                    stroke="#0ea5e9"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeOpacity="0.4"
                    className="group-hover:stroke-opacity-60 transition-opacity"
                />

                {/* Central Node */}
                <circle
                    cx="50"
                    cy="50"
                    r="15"
                    fill="#0ea5e9"
                    className="animate-pulse"
                />

                {/* Smaller Outer Nodes */}
                <circle cx="30" cy="50" r="6" fill="#0ea5e9" fillOpacity="0.8" />
                <circle cx="70" cy="50" r="6" fill="#0ea5e9" fillOpacity="0.8" />
                <circle cx="50" cy="30" r="6" fill="#0ea5e9" fillOpacity="0.8" />
                <circle cx="50" cy="70" r="6" fill="#0ea5e9" fillOpacity="0.8" />

                {/* Orbit Effect */}
                <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="#0ea5e9"
                    strokeWidth="2"
                    strokeDasharray="4 8"
                    strokeOpacity="0.3"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 50 50"
                        to="360 50 50"
                        dur="10s"
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>
            <span className={`font-bold text-xl tracking-tight hidden sm:block ${textClassName}`}>
                SVIX<span className="text-[#0ea5e9]">.UI</span>
            </span>
        </div>
    );
}
