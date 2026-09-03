import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      {children}
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </Svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12l5 5L20 7" />
    </Svg>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M8 8h2M8 12h2M8 16h2M17 13h1M17 17h1" />
    </Svg>
  );
}

export function IconBox(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </Svg>
  );
}

export function IconChip(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4" />
    </Svg>
  );
}

export function IconFabric(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16v10H4z" />
      <path d="M4 11h16M8 7v10M16 7v10" />
    </Svg>
  );
}

export function IconCog(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" />
    </Svg>
  );
}

export function IconLeaf(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 19c8-1 13-8 14-15-7 1-14 6-14 15z" />
      <path d="M9 15c2-2 4-5 5-8" />
    </Svg>
  );
}

export function IconFlask(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 3h6M10 3v6L5 19h14L14 9V3" />
    </Svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 11l8-7 8 7v9H4v-9z" />
      <path d="M10 20v-6h4v6" />
    </Svg>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 4h4l1 4-2 2a12 12 0 0 0 5 5l2-2 4 1v4a2 2 0 0 1-2 2C10 20 4 14 4 6a2 2 0 0 1 2-2z" />
    </Svg>
  );
}

export function IconMail(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 7 9-7" />
    </Svg>
  );
}

export function IconMapPin(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  );
}

export function IconWhatsApp(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 11.5A8.5 8.5 0 1 1 11.2 4.2 8.5 8.5 0 0 1 20 11.5z" />
      <path d="M8.2 17.6 7 20l2.5-1.2" />
      <path d="M9.2 9.4c.2-.5.3-.5.6-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .4-.1.6l-.4.5c-.1.1-.1.3 0 .4a7 7 0 0 0 3.2 3.2c.2.1.3.1.4 0l.5-.4c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .4-.5.6A5.5 5.5 0 0 1 9.2 9.4z" />
    </Svg>
  );
}

export function categoryIcon(name: string) {
  const key = name.toLowerCase();
  if (key.includes("electron")) return IconChip;
  if (key.includes("textile") || key.includes("fabric")) return IconFabric;
  if (key.includes("machine")) return IconCog;
  if (key.includes("pack")) return IconBox;
  if (key.includes("construct") || key.includes("build")) return IconHome;
  if (key.includes("chem")) return IconFlask;
  if (key.includes("agri")) return IconLeaf;
  return IconBuilding;
}
