import type { ReactElement, SVGProps } from "react";
const SvgFaceSad = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path fill="var(--ds-blue-700)" fillRule="evenodd" d="M4 9v7h1.5V9zm8 0v7h-1.5V9z" clipRule="evenodd" />
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1.5 8A6.5 6.5 0 1 1 13 12.154v2.091a8 8 0 1 0-10 0v-2.091A6.47 6.47 0 0 1 1.5 8M8 14.5a6.5 6.5 0 0 0 1.5-.174v1.534a8 8 0 0 1-3 0v-1.534A6.5 6.5 0 0 0 8 14.5M3.786 8.365c.373-.38.89-.615 1.464-.615s1.091.235 1.464.615l1.072-1.05A3.54 3.54 0 0 0 5.25 6.25c-.993 0-1.892.409-2.536 1.065zm6.964-.615c-.574 0-1.091.235-1.464.615l-1.072-1.05A3.54 3.54 0 0 1 10.75 6.25c.993 0 1.892.409 2.536 1.065l-1.072 1.05a2.04 2.04 0 0 0-1.464-.615M6.25 12h3.5a1.75 1.75 0 1 0-3.5 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgFaceSad;
