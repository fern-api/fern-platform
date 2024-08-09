import type { ReactElement, SVGProps } from "react";
const SvgPhoneDevice = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M5.25 0A2.75 2.75 0 0 0 2.5 2.75v10.5A2.75 2.75 0 0 0 5.25 16h5.5a2.75 2.75 0 0 0 2.75-2.75V2.75A2.75 2.75 0 0 0 10.75 0zM4 2.75c0-.69.56-1.25 1.25-1.25h5.5c.69 0 1.25.56 1.25 1.25v10.5c0 .69-.56 1.25-1.25 1.25h-5.5c-.69 0-1.25-.56-1.25-1.25zm2.25 2a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgPhoneDevice;
