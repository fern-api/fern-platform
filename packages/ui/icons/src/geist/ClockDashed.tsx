import type { ReactElement, SVGProps } from "react";
const SvgClockDashed = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M5.35 2.062a6.5 6.5 0 0 1 1.974-.527L7.169.043a8 8 0 0 0-2.43.65l.612 1.37zm3.327-.527a6.501 6.501 0 1 1-7.142 7.142l-1.492.154A8.001 8.001 0 1 0 8.83.043zM2.74 4.18a6.5 6.5 0 0 1 1.44-1.44l-.882-1.214a8 8 0 0 0-1.771 1.771zM1.535 7.323c.072-.696.254-1.36.527-1.972L.693 4.739a8 8 0 0 0-.65 2.43zM8.75 4.75V4h-1.5v3.875a1 1 0 0 0 .4.8l1.9 1.425.6.45.9-1.2-.6-.45-1.7-1.275z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgClockDashed;
