import type { ReactElement, SVGProps } from "react";
const SvgPlay = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m13.455 7.227-.132-.066L2.5 1.75l-.042-.02-.649-.325-.447-.224A.25.25 0 0 0 1 1.405v13.191a.25.25 0 0 0 .362.223l.447-.224.65-.324.041-.021 10.823-5.411.132-.066.8-.4.298-.15a.25.25 0 0 0 0-.447l-.298-.149zM11.645 8 2.5 3.427v9.146L11.646 8z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgPlay;
