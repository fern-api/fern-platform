import type { ReactElement, SVGProps } from "react";
const SvgPencilEdit = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m11.75.19.53.53 3 3 .53.53-.53.53L5.16 14.902A3.75 3.75 0 0 1 2.507 16H0v-2.507a3.75 3.75 0 0 1 1.098-2.652L11.22.72zm0 2.12L9.81 4.25l1.94 1.94 1.94-1.94zm-9.591 9.592L8.75 5.31l1.94 1.939-6.592 6.591a2.25 2.25 0 0 1-1.59.659H1.5v-1.007c0-.597.237-1.17.659-1.591zM9 16h7v-1.5H9z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgPencilEdit;
