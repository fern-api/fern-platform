import type { ReactElement, SVGProps } from "react";
const SvgLifebuoy = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M14.5 8a6.5 6.5 0 0 1-.765 3.063l-2.39-1.366c.259-.51.405-1.086.405-1.697 0-.61-.146-1.188-.405-1.697l2.39-1.366A6.5 6.5 0 0 1 14.5 8m-3.437-5.735A6.5 6.5 0 0 0 8 1.5a6.5 6.5 0 0 0-3.063.765l1.366 2.39A3.7 3.7 0 0 1 8 4.25c.61 0 1.188.146 1.697.405zm-1.366 9.08 1.366 2.39A6.5 6.5 0 0 1 8 14.5a6.5 6.5 0 0 1-3.063-.765l1.366-2.39c.51.259 1.086.405 1.697.405.61 0 1.188-.146 1.697-.405M4.655 9.697A3.7 3.7 0 0 1 4.25 8c0-.61.146-1.188.405-1.697l-2.39-1.366A6.5 6.5 0 0 0 1.5 8c0 1.107.277 2.15.765 3.063zM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-5.5 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgLifebuoy;
