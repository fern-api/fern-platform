import type { ReactElement, SVGProps } from "react";
const SvgArrowDownRight = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M12.5 11.44V5H14v8a1 1 0 0 1-1 1H5v-1.5h6.438L2.219 3.28l-.53-.53 1.06-1.06.53.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgArrowDownRight;
