import { forwardRef } from "react";

export const Cohere = forwardRef<
    SVGSVGElement,
    React.ComponentPropsWithoutRef<"svg">
>((props, ref) => (
    <svg
        ref={ref}
        style={{ color: "currentcolor" }}
        {...props}
        strokeLinejoin="round"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g clipPath="url(#clip0_2_2)">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.184 9.536C5.61067 9.536 6.464 9.51467 7.65867 9.024C9.04533 8.448 11.776 7.424 13.76 6.35733C15.1467 5.61067 15.744 4.62933 15.744 3.30667C15.744 1.49333 14.272 0 12.4373 0H4.75733C2.13333 0 0 2.13333 0 4.75733C0 7.38133 2.00533 9.536 5.184 9.536Z"
                fill="currentColor"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.48532 12.8C6.48532 11.52 7.25332 10.3467 8.44799 9.856L10.8587 8.85333C13.312 7.85066 16 9.64266 16 12.288C16 14.336 14.336 16 12.288 16H9.66399C7.91465 16 6.48532 14.5707 6.48532 12.8Z"
                fill="currentColor"
            />
            <path
                d="M2.752 10.1547C1.23733 10.1547 0 11.392 0 12.9067V13.2693C0 14.7627 1.23733 16 2.752 16C4.26667 16 5.504 14.7627 5.504 13.248V12.8853C5.48267 11.392 4.26667 10.1547 2.752 10.1547Z"
                fill="currentColor"
            />
        </g>
        <defs>
            <clipPath id="clip0_2_2">
                <rect width="16" height="16" fill="white" />
            </clipPath>
        </defs>
    </svg>
));

Cohere.displayName = "Cohere";
