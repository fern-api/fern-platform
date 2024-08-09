import type { ReactElement, SVGProps } from "react";
const SvgLoaderCircle = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g stroke="#fff" strokeWidth={1.5} clipPath="url(#loader-circle_svg__a)">
            <path d="M8 0v4" />
            <path d="M8 16v-4" opacity={0.5} />
            <path d="m3.298 1.528 2.35 3.236" opacity={0.9} />
            <path d="m12.702 1.528-2.35 3.236" opacity={0.1} />
            <path d="m12.702 14.472-2.35-3.236" opacity={0.4} />
            <path d="m3.298 14.472 2.35-3.236" opacity={0.6} />
            <path d="m15.608 5.528-3.804 1.236" opacity={0.2} />
            <path d="m.392 10.472 3.804-1.236" opacity={0.7} />
            <path d="m15.608 10.472-3.804-1.236" opacity={0.3} />
            <path d="m.392 5.528 3.804 1.236" opacity={0.8} />
        </g>
        <defs>
            <clipPath id="loader-circle_svg__a">
                <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </svg>
);
export default SvgLoaderCircle;
