import type { ReactElement, SVGProps } from "react";
const SvgMonorepo = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M3.25 3.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-1 2.25c.411 0 .797-.11 1.128-.303l4.238 3.296.384.299.384-.299 4.238-3.296a2.25 2.25 0 1 0-.868-.908L8 7.209l-3.754-2.92A2.25 2.25 0 1 0 2.25 5.5m1 7.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-1 2.25a2.25 2.25 0 0 0 .625-4.412V7h-1.25v3.588A2.251 2.251 0 0 0 2.25 15m11.5-10.75a1 1 0 1 0 0-2 1 1 0 0 0 0 2m1 8.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-1 2.25a2.25 2.25 0 0 0 .625-4.412V7h-1.25v3.588A2.251 2.251 0 0 0 13.75 15"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgMonorepo;
