import type { ReactElement, SVGProps } from "react";
const SvgAcronymApi = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 20 16" {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M17.5 2.25h-15c-.69 0-1.25.56-1.25 1.25v9c0 .69.56 1.25 1.25 1.25h15c.69 0 1.25-.56 1.25-1.25v-9c0-.69-.56-1.25-1.25-1.25M2.5 1A2.5 2.5 0 0 0 0 3.5v9A2.5 2.5 0 0 0 2.5 15h15a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 17.5 1zm3 7V6.75a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25V8zm0 1.5V11H4V6.75C4 5.784 4.784 5 5.75 5h.5C7.216 5 8 5.784 8 6.75V11H6.5V9.5zm5.25-.5v2h-1.5V5h2.25c.966 0 1.75.784 1.75 1.75v.5A1.75 1.75 0 0 1 11.5 9zm0-1.5h.75a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25h-.75zM14.5 11H16V5h-1.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgAcronymApi;
