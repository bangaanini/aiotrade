"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { navItems } from "@/components/landing/data";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    setIsScrolled(value > 32);
  });

  return (
    <motion.header
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      className={cn(
        "sticky top-0 z-40 w-full border-b border-white/8 bg-[rgba(11,19,34,0.92)] backdrop-blur-xl transition duration-300",
        isScrolled && "bg-[rgba(9,16,30,0.98)] shadow-[0_14px_40px_rgba(0,0,0,0.34)]",
      )}
      initial={prefersReducedMotion ? false : { opacity: 0, y: -18 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex min-h-[60px] w-full max-w-7xl items-center justify-center px-4 sm:min-h-[68px] sm:px-8 lg:px-10">
        <nav className="no-scrollbar flex max-w-full items-center justify-center gap-2 overflow-x-auto px-0 text-[0.8rem] text-white/78 sm:gap-6 sm:px-4 sm:text-[1rem]">
          {navItems.map((item, index) => (
            <div className="flex items-center gap-2 sm:gap-6" key={item.href}>
              {index > 0 ? <span className="text-white/28">|</span> : null}
              <motion.div
                whileHover={prefersReducedMotion ? undefined : { y: -1.5 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              >
                <Link
                  className="group relative inline-flex whitespace-nowrap py-2 transition duration-300 hover:text-white"
                  href={item.href}
                >
                  <span>{item.label}</span>
                  <span className="absolute inset-x-0 bottom-0 h-px origin-center scale-x-0 bg-[#10a7ff] transition duration-300 group-hover:scale-x-100" />
                </Link>
              </motion.div>
            </div>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}
