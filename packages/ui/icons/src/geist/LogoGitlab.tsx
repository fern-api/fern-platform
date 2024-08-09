import type { ReactElement, SVGProps } from "react";
const SvgLogoGitlab = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#logo-gitlab_svg__a)">
            <path
                fill="#E24329"
                d="m15.527 6.687-.021-.056-2.12-5.532a.55.55 0 0 0-.548-.347.57.57 0 0 0-.319.119.57.57 0 0 0-.188.285L10.9 5.536H5.104l-1.43-4.38a.556.556 0 0 0-1.056-.058L.495 6.628l-.022.055a3.936 3.936 0 0 0 1.306 4.55l.007.005.02.014 3.229 2.418 1.597 1.209.973.735a.654.654 0 0 0 .792 0l.973-.735 1.597-1.21 3.248-2.432.008-.006a3.94 3.94 0 0 0 1.304-4.544"
            />
            <path
                fill="#FC6D26"
                d="m15.527 6.687-.021-.056a7.2 7.2 0 0 0-2.85 1.28L8 11.432c1.585 1.2 2.965 2.242 2.965 2.242l3.249-2.432.008-.007a3.94 3.94 0 0 0 1.305-4.547z"
            />
            <path
                fill="#FCA326"
                d="m5.035 13.673 1.597 1.21.973.734a.654.654 0 0 0 .791 0l.974-.735 1.597-1.209L8 11.432c-1.585 1.196-2.965 2.241-2.965 2.241"
            />
            <path
                fill="#FC6D26"
                d="M3.344 7.912a7.15 7.15 0 0 0-2.85-1.285l-.02.056a3.936 3.936 0 0 0 1.305 4.55l.007.005.02.014 3.229 2.418L8 11.429z"
            />
        </g>
        <defs>
            <clipPath id="logo-gitlab_svg__a">
                <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </svg>
);
export default SvgLogoGitlab;
