"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { NAV_LINKS } from "@/lib/data/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--mil-border)] bg-[#121612]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <BrandLogo size="sm" showTagline />
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-2.5 py-1.5 text-[13px] rounded-lg transition-colors whitespace-nowrap",
                pathname === link.href
                  ? "text-white bg-[var(--mil-blue)]"
                  : "text-[var(--mil-muted)] hover:text-white hover:bg-[var(--mil-elevated)]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/contact">
            <Button size="sm">Request Demo</Button>
          </Link>
        </div>

        <button className="lg:hidden text-[var(--mil-muted)] hover:text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-[var(--mil-border)] bg-[var(--mil-panel)]"
          >
            <nav className="flex flex-col p-4 gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-lg text-sm",
                    pathname === link.href
                      ? "text-white bg-[var(--mil-blue)]"
                      : "text-[var(--mil-muted)]"
                  )}
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ))}
              <Link href="/contact" onClick={() => setOpen(false)} className="mt-2">
                <Button className="w-full">Request Demo</Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
