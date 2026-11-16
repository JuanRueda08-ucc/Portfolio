import { ViewTransition, type ReactNode } from "react";

/**
 * Wraps a page so navigations tagged with `transitionTypes={["page-card"]}`
 * play the card transition (styles in globals.css, inspired by andreas.vision).
 * Must live in each page.tsx, not in the layout (layouts don't unmount).
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{ "page-card": "page-card", default: "none" }}
      exit={{ "page-card": "page-card", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
