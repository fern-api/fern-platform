import type { ReactElement, SVGProps } from "react";
const SvgLambdaRectangle = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.5 1.5h-11v12a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1zM2.5 0H1v13.5A2.5 2.5 0 0 0 3.5 16h9a2.5 2.5 0 0 0 2.5-2.5V0zm2.357 3.452h.75c.927 0 1.771.532 2.171 1.367l2.867 5.991.218-.338 1.26.812-.405.63a1.306 1.306 0 0 1-2.276-.143l-1.508-3.15-1.65 3.47-.322.678-1.354-.644.322-.678 2.03-4.269.141-.298-.676-1.413a.91.91 0 0 0-.818-.515h-.75z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgLambdaRectangle;
