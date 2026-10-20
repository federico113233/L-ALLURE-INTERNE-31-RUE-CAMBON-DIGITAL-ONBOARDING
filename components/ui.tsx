"use client";

import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Monogram({ className = "h-6 w-10", color = "currentColor" }: { className?: string; color?: string }) {
  // Two interlocking Cs, drawn geometrically.
  return (
    <svg viewBox="0 0 100 60" className={className} aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="6.5" strokeLinecap="butt">
        <path d="M53.76 42.31 A20 20 0 1 1 53.76 17.69" />
        <path d="M46.24 17.69 A20 20 0 1 1 46.24 42.31" />
      </g>
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Monogram className="h-5 w-8" />
      <span className="label-strong text-[0.8rem] tracking-[0.42em]">Chanel</span>
    </span>
  );
}

type Variant = "primary" | "ghost" | "inverse" | "link";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  const base =
    "label inline-flex items-center justify-center gap-3 transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:cursor-not-allowed disabled:opacity-35";
  const styles: Record<Variant, string> = {
    primary: "h-12 bg-noir px-8 text-blanc hover:bg-or hover:text-noir",
    ghost: "h-12 border border-noir px-8 text-noir hover:bg-noir hover:text-blanc",
    inverse: "h-12 border border-blanc/40 px-8 text-blanc hover:border-or hover:text-or",
    link: "h-auto px-0 text-noir underline-offset-[6px] hover:text-or hover:underline",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="h-px w-8 bg-or" />
      <span className="label text-graphite">{children}</span>
    </div>
  );
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SpeakerIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <path d="M2 6h3l4-3v10l-4-3H2z" />
      <path d="M11.5 5.5a3.5 3.5 0 0 1 0 5M13.5 3.5a6.3 6.3 0 0 1 0 9" />
    </svg>
  );
}

export function MicIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" />
      <path d="M3 8a5 5 0 0 0 10 0M8 13v2" />
    </svg>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-3">
      <motion.span
        className="block h-px w-8 origin-left bg-or"
        animate={{ scaleX: [0.1, 1, 0.1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="label text-graphite">{label}</span>
    </span>
  );
}
