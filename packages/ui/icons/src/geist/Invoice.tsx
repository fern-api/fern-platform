import type { ReactElement, SVGProps } from "react";
const SvgInvoice = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m13 15.1-1-.6-1.848 1.386a.254.254 0 0 1-.304 0L8 14.5l-1.856 1.392a.25.25 0 0 1-.294.008l-2.1-1.4L3 15l-.167.112-.997.664-.15.1a.12.12 0 0 1-.186-.1V0h7.586a1 1 0 0 1 .707.293l4.414 4.414a1 1 0 0 1 .293.707v10.374a.12.12 0 0 1-.182.103l-.171-.103-1.01-.606zM12.379 5 9.5 2.121V5zM8 1.5v5h5v6.85l-.228-.136-.865-.52-.807.606-1.1.825-1.1-.825-.9-.675-.9.675-1.151.863-1.367-.911-.832-.555-.75.5V1.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgInvoice;
