import type { ReactElement, SVGProps } from "react";
const SvgLogoAngularColor = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path fill="#DD0031" d="M8 0 .5 2.656l1.144 9.848L8 16l6.356-3.496L15.5 2.656z" />
        <path fill="#C3002F" d="M8 0v1.776-.008V16l6.356-3.496L15.5 2.656z" />
        <path fill="#fff" d="m8 1.768-4.688 10.44H5.06l.942-2.336h3.98l.942 2.336h1.748zm1.37 6.664H6.63L8 5.16z" />
    </svg>
);
export default SvgLogoAngularColor;
