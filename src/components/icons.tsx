import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

function createIcon(paths: React.ReactNode) {
  return function Icon({ className, ...props }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
        {...props}
      >
        {paths}
      </svg>
    );
  };
}

export const ClockIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </>,
);

export const ChefHatIcon = createIcon(
  <>
    <path d="M6 13a4.5 4.5 0 0 1 1.2-8.7A4 4 0 0 1 12 3a4 4 0 0 1 4.8 1.3A4.5 4.5 0 0 1 18 13" />
    <path d="M6 13h12v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z" />
    <path d="M9 20h6" />
    <path d="M8 17v3M16 17v3" />
  </>,
);

export const LeafIcon = createIcon(
  <>
    <path d="M5 20c8 0 14-6 14-14V5c-8 0-14 6-14 14z" />
    <path d="M5 20c0-5 3-9 8-11" />
  </>,
);

export const SparklesIcon = createIcon(
  <>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
  </>,
);

export const BookIcon = createIcon(
  <>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
    <path d="M4 20.5V5.5" />
    <path d="M20 18H6.5A2.5 2.5 0 0 0 4 20.5" />
  </>,
);

export const ScreenIcon = createIcon(
  <>
    <rect x="3" y="4" width="18" height="12" rx="1.5" />
    <path d="M8 20h8M12 16v4" />
  </>,
);

export const HeartIcon = createIcon(
  <path d="M12 20s-7-4.35-9.5-8.8C.7 8 2.2 4.5 5.6 4c2-.3 3.7.7 4.4 2 .7-1.3 2.4-2.3 4.4-2 3.4.5 4.9 4 3.1 7.2C19 15.65 12 20 12 20z" />,
);

export const UsersIcon = createIcon(
  <>
    <circle cx="9" cy="8" r="3.25" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M16 4.3a3.25 3.25 0 0 1 0 6.4" />
    <path d="M15.5 14.2c2.6.5 4.5 2.7 4.5 5.8" />
  </>,
);

export const MessageCircleIcon = createIcon(
  <path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.6-.8L3 21l1.9-5.1a8.3 8.3 0 0 1-.9-3.8A8.4 8.4 0 0 1 12.6 3a8.5 8.5 0 0 1 8.4 8.5z" />,
);

export const CheckCircleIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.3 2.3L16 10" />
  </>,
);

export const ChevronLeftIcon = createIcon(<path d="M15 5l-7 7 7 7" />);

export const ChevronRightIcon = createIcon(<path d="M9 5l7 7-7 7" />);
