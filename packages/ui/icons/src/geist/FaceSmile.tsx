import type { ReactElement, SVGProps } from "react";
const SvgFaceSmile = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M14.5 8a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-11.5.975h-.625V9.6c0 1.875 1.935 3.264 4.123 3.264 2.19 0 4.127-1.38 4.127-3.264v-.625zm3.498 2.639c-1.404 0-2.36-.666-2.717-1.389h5.44c-.357.725-1.313 1.389-2.723 1.389"
            clipRule="evenodd"
        />
        <path
            fill="var(--ds-amber-800)"
            fillRule="evenodd"
            d="M6.153 4.92 5.375 3.5l-.778 1.42L3 5.22l1.116 1.176L3.907 8l1.468-.694L6.843 8l-.21-1.605L7.75 5.219zm5.25 0-.778-1.42-.778 1.42-1.597.299 1.116 1.176L9.157 8l1.468-.694L12.093 8l-.21-1.605L13 5.219l-1.597-.298z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgFaceSmile;
