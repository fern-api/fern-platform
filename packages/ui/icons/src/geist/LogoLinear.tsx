import type { ReactElement, SVGProps } from "react";
const SvgLogoLinear = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#5E6AD2"
            d="M1.172 9.613c-.032-.133.127-.216.223-.12l5.112 5.112c.096.096.013.255-.12.223a7.02 7.02 0 0 1-5.215-5.215M1 7.564a.14.14 0 0 0 .04.107l7.289 7.288a.14.14 0 0 0 .107.04q.497-.03.974-.129a.136.136 0 0 0 .067-.23L1.361 6.522a.136.136 0 0 0-.231.067 7 7 0 0 0-.13.974zm.59-2.405a.14.14 0 0 0 .029.154l9.068 9.068a.14.14 0 0 0 .154.03q.376-.168.726-.376a.137.137 0 0 0 .026-.216L2.18 4.407a.137.137 0 0 0-.216.026 7 7 0 0 0-.375.726zM2.772 3.53a.14.14 0 0 1-.006-.19 7.007 7.007 0 1 1 9.893 9.893.14.14 0 0 1-.19-.005z"
        />
    </svg>
);
export default SvgLogoLinear;
