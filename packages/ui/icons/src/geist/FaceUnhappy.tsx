import type { ReactElement, SVGProps } from "react";
const SvgFaceUnhappy = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M14.5 8a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.75 7.75a1 1 0 1 0 0-2 1 1 0 0 0 0 2m5.5-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0m.275 4.512.348.52-1.039.695-.348-.52a2.99 2.99 0 0 0-2.485-1.327 2.99 2.99 0 0 0-2.482 1.323l-.35.519-1.036-.698.348-.518a4.24 4.24 0 0 1 3.52-1.876c1.47 0 2.764.748 3.524 1.882"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgFaceUnhappy;
