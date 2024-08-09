import type { ReactElement, SVGProps } from "react";
const SvgNetworkDevice = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M0 5.251V4.25l.463-.192 7.25-3L8 .938l.287.119 7.25 3 .463.192V5.25l-.463.192-7.25 3-.287.12-.287-.119-7.25-3zm0 3.207V6.835l.537.222L8 10.145l7.463-3.088.537-.222v1.623L8.287 11.65 8 11.769l-.287-.12L0 8.46zm0 3.25v-1.623l.537.222L8 13.395l7.463-3.088.537-.222v1.623L8.287 14.9 8 15.019l-.287-.12L0 11.71zm8-4.77L2.712 4.75 8 2.562l5.289 2.188z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgNetworkDevice;
