import type { ReactElement, SVGProps } from "react";
const SvgKv = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m10.679 2.054-.862 3.509 3.508.862.863-3.51-3.51-.861zM10.383.436a.827.827 0 0 0-1 .606L8.199 5.859a.827.827 0 0 0 .606 1l4.816 1.183a.827.827 0 0 0 1-.605l1.184-4.817a.827.827 0 0 0-.606-1zM9.5 14.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4m0 1.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M2.931 5.148l2.685 2.365L2.257 8.66zm-2.463 4.88a.526.526 0 0 0 .686.596L7.69 8.389a.526.526 0 0 0 .178-.892L2.644 2.896a.526.526 0 0 0-.864.295L.468 10.027z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgKv;
