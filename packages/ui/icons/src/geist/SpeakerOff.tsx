import type { ReactElement, SVGProps } from "react";
const SvgSpeakerOff = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M14 1.25V.055l-1.076.52L5.828 4H2.677l-1.342-.67-.67-.336-.671 1.341.67.336 14 7 .671.335.671-1.341-.67-.336L14 9.661zm-1.5 7.661V2.445L6.378 5.4a1 1 0 0 1-.435.099h-.266zM3.5 8v-.75H2V11a1 1 0 0 0 1 1h2.828l7.096 3.425 1.076.52V12.75h-1.5v.805L6.378 10.6a1 1 0 0 0-.435-.1H3.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSpeakerOff;
