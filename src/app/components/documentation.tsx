import type { ReactNode } from "react";
import NextLink from "next/link";

interface HeadingProps {
  children: ReactNode;
  level?: number;
  className?: string;
}

export function Heading({ children, level = 1, className = "" }: HeadingProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return <Tag className={className}>{children}</Tag>;
}

interface LinkProps {
  href: string;
  children: ReactNode;
  ariaLabel?: string;
}

export function Link({ href, children, ariaLabel }: LinkProps) {
  return (
    <NextLink href={href} aria-label={ariaLabel} className="text-blue-600 hover:underline">
      {children}
    </NextLink>
  );
}

interface ParagraphProps {
  children: ReactNode;
  smallMarginTop?: boolean;
}

export function Paragraph({ children, smallMarginTop = false }: ParagraphProps) {
  return (
    <p className={smallMarginTop ? "mt-2" : "mt-4"}>
      {children}
    </p>
  );
}
