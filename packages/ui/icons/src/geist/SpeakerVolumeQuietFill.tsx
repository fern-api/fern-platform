import type { ReactElement, SVGProps } from "react";
const SvgSpeakerVolumeQuietFill = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M0 5v6a1 1 0 0 0 1 1h2l7 4V0L3 4H1a1 1 0 0 0-1 1m13.912.647-.354-.662-1.323.707.354.661c.261.49.41 1.05.41 1.647s-.149 1.157-.41 1.647l-.354.661 1.323.707.354-.662A5 5 0 0 0 14.498 8c0-.85-.212-1.651-.588-2.353z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSpeakerVolumeQuietFill;
