import type { ReactElement, SVGProps } from "react";
const SvgAcronymGif = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 20 16" {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.5 2.25h15c.69 0 1.25.56 1.25 1.25v9c0 .69-.56 1.25-1.25 1.25h-15c-.69 0-1.25-.56-1.25-1.25v-9c0-.69.56-1.25 1.25-1.25M0 3.5A2.5 2.5 0 0 1 2.5 1h15A2.5 2.5 0 0 1 20 3.5v9a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 0 12.5zM6 5a2.25 2.25 0 0 0-2.25 2.25v1.5A2.25 2.25 0 0 0 6 11h1.25c.69 0 1.25-.56 1.25-1.25v-.5C8.5 8.56 7.94 8 7.25 8H6.5v1.5H6a.75.75 0 0 1-.75-.75v-1.5A.75.75 0 0 1 6 6.5h.5A.5.5 0 0 1 7 7h1.5a2 2 0 0 0-2-2zm5.25 6h-1.5V5h1.5zm2-6h-.75v6H14V9h2.5V7.5H14v-1h2.5V5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgAcronymGif;
