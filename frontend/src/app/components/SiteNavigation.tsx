"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteNavigation() {
  const pathname = usePathname();

  function openChat() {
    window.dispatchEvent(new Event("sarvam:open-chat"));
  }

  return (
    <nav className="site-navigation" aria-label="Main navigation">
      <Link
        className="site-nav-button"
        href="/"
        aria-label="Home"
        aria-current={pathname === "/" ? "page" : undefined}
        title="Home"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1Z" />
        </svg>
      </Link>
      <Link
        className={`site-nav-button${pathname === "/map" || pathname.startsWith("/districts/") ? " is-active" : ""}`}
        href="/map"
        aria-label="Karnataka district map"
        aria-current={pathname === "/map" || pathname.startsWith("/districts/") ? "page" : undefined}
        title="District map"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" />
          <path d="M9 3v15m6-12v15" />
        </svg>
      </Link>
      <Link
        className={`site-nav-button${pathname === "/search" ? " is-active" : ""}`}
        href="/search"
        aria-label="Search Karnataka districts"
        aria-current={pathname === "/search" ? "page" : undefined}
        title="Search districts"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 5 5" />
        </svg>
      </Link>
      <button
        className="site-nav-button"
        type="button"
        onClick={openChat}
        aria-label="Open chat"
        title="Chat"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.6-.9L4 20l1.3-4.1A7.5 7.5 0 1 1 20 11.5Z" />
          <path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" />
        </svg>
      </button>
    </nav>
  );
}
