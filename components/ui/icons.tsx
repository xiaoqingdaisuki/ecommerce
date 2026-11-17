import type { SVGProps } from 'react';

export function Icon({
  name,
  width = 22,
  height = width,
  ...props
}: SVGProps<SVGSVGElement> & {
  name:
    | 'search'
    | 'bag'
    | 'arrow'
    | 'close'
    | 'user'
    | 'menu'
    | 'globe'
    | 'truck'
    | 'shield'
    | 'return'
    | 'check'
    | 'plus'
    | 'pause'
    | 'play'
    | 'filter'
    | 'chevron'
    | 'grid'
    | 'mountain'
    | 'lock';
}) {
  const paths = {
    pause: <path d="M9 5v14M15 5v14" />,
    play: <path d="m9 5 10 7-10 7V5Z" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z" />
      </>
    ),
    truck: (
      <>
        <path d="M2 5h12v12H2zM14 9h4l4 4v4h-8" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    return: (
      <>
        <path d="M7 7h8a6 6 0 1 1 0 12h-4M7 3 3 7l4 4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    filter: (
      <>
        <path d="M4 7h16M4 17h16" />
        <circle cx="8" cy="7" r="2" />
        <circle cx="16" cy="17" r="2" />
      </>
    ),
    chevron: <path d="m8 4 8 8-8 8" />,
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </>
    ),
    mountain: (
      <>
        <path d="m2 20 8-15 5 8 3-4 5 11H2Z" />
        <path d="m7 11 3 2 2-3" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    bag: (
      <>
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),
    arrow: (
      <>
        <path d="M4 12h16m-6-6 6 6-6 6" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
