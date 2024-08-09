import type { ReactElement, SVGProps } from "react";
const SvgStore = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.75 1.9a2.5 2.5 0 0 0-1.92-.9H4.17a2.5 2.5 0 0 0-1.92.9L1.08 3.305a2.5 2.5 0 0 0-.58 1.6V15h15V4.905a2.5 2.5 0 0 0-.58-1.6zM14 5v-.095a1 1 0 0 0-.232-.64l1.152-.96-1.152.96-1.17-1.405a1 1 0 0 0-.769-.36H4.171a1 1 0 0 0-.768.36L2.232 4.265a1 1 0 0 0-.232.64V5a1.5 1.5 0 1 0 3 0h1.5a1.5 1.5 0 1 0 3 0H11a1.5 1.5 0 0 0 3 0m0 2.599A3 3 0 0 1 12.5 8c-.896 0-1.7-.393-2.25-1.016A3 3 0 0 1 8 8c-.896 0-1.7-.393-2.25-1.016A3 3 0 0 1 3.5 8 3 3 0 0 1 2 7.599V13.5h4V12a2 2 0 1 1 4 0v1.5h4zM8.5 12v1.5h-1V12a.5.5 0 0 1 1 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgStore;
