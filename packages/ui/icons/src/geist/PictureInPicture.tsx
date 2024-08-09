import type { ReactElement, SVGProps } from "react";
const SvgPictureInPicture = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M6.75 13.5H1.5v-11h13v5H16V2a1 1 0 0 0-1-1H1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6.5v-1.5zm3.75-3h4v3h-4zM9 9h7v6H9z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgPictureInPicture;
