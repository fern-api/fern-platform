import type { ReactElement, SVGProps } from "react";
const SvgAcronymPage = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 28 16" {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.5 2.25h23c.69 0 1.25.56 1.25 1.25v9c0 .69-.56 1.25-1.25 1.25h-23c-.69 0-1.25-.56-1.25-1.25v-9c0-.69.56-1.25 1.25-1.25M0 3.5A2.5 2.5 0 0 1 2.5 1h23A2.5 2.5 0 0 1 28 3.5v9a2.5 2.5 0 0 1-2.5 2.5h-23A2.5 2.5 0 0 1 0 12.5zm10.5 3.25V8h1V6.75a.25.25 0 0 0-.25-.25h-.5a.25.25 0 0 0-.25.25m0 4.25V9.5h1V11H13V6.75A1.75 1.75 0 0 0 11.25 5h-.5A1.75 1.75 0 0 0 9 6.75V11zm-5 0V9h.75A1.75 1.75 0 0 0 8 7.25v-.5A1.75 1.75 0 0 0 6.25 5H4v6zm.75-3.5H5.5v-1h.75a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25M14 7.25A2.25 2.25 0 0 1 16.25 5h.5a2 2 0 0 1 2 2h-1.5a.5.5 0 0 0-.5-.5h-.5a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h.5V8h.75c.69 0 1.25.56 1.25 1.25v.5c0 .69-.56 1.25-1.25 1.25h-1.25A2.25 2.25 0 0 1 14 8.75zM21.75 5A1.75 1.75 0 0 0 20 6.75v2.5c0 .966.784 1.75 1.75 1.75H24V9.5h-2.25a.25.25 0 0 1-.25-.25v-.515H24v-1.5h-2.5V6.75a.25.25 0 0 1 .25-.25H24V5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgAcronymPage;
