import type { ReactElement, SVGProps } from "react";
const SvgAcronymIsr = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 20 16" {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.5 2.25h15c.69 0 1.25.56 1.25 1.25v9c0 .69-.56 1.25-1.25 1.25h-15c-.69 0-1.25-.56-1.25-1.25v-9c0-.69.56-1.25 1.25-1.25M0 3.5A2.5 2.5 0 0 1 2.5 1h15A2.5 2.5 0 0 1 20 3.5v9a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 0 12.5zM13.5 11V9.168c.591.281 1 .884 1 1.582V11H16v-.25c0-.786-.279-1.507-.743-2.068.45-.317.743-.84.743-1.432v-.5A1.75 1.75 0 0 0 14.25 5H12v6zm.75-3.5h-.75v-1h.75a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25M5.5 5v6H4V5zm3 1.875c0-.207.168-.375.375-.375h1.375V5H8.875a1.875 1.875 0 0 0 0 3.75.375.375 0 1 1 0 .75H7.25V11h1.625a1.875 1.875 0 0 0 0-3.75.375.375 0 0 1-.375-.375"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgAcronymIsr;
