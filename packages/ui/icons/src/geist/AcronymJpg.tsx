import type { ReactElement, SVGProps } from "react";
const SvgAcronymJpg = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 20 16" {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.5 2.25h15c.69 0 1.25.56 1.25 1.25v9c0 .69-.56 1.25-1.25 1.25h-15c-.69 0-1.25-.56-1.25-1.25v-9c0-.69.56-1.25 1.25-1.25M0 3.5A2.5 2.5 0 0 1 2.5 1h15A2.5 2.5 0 0 1 20 3.5v9a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 0 12.5zm5 5.625V5h1.5v4.125a1.875 1.875 0 0 1-3.75 0V8.75h1.5v.375a.375.375 0 1 0 .75 0M9.25 9v2h-1.5V5H10c.966 0 1.75.784 1.75 1.75v.5A1.75 1.75 0 0 1 10 9zm0-1.5H10a.25.25 0 0 0 .25-.25v-.5A.25.25 0 0 0 10 6.5h-.75zm5.5-2.5a2.25 2.25 0 0 0-2.25 2.25v1.5A2.25 2.25 0 0 0 14.75 11H16c.69 0 1.25-.56 1.25-1.25v-.5C17.25 8.56 16.69 8 16 8h-.75v1.5h-.5a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75h.5a.5.5 0 0 1 .5.5h1.5a2 2 0 0 0-2-2z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgAcronymJpg;
