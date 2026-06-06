"use client";

import Logo from "@/components/logo/Logo";
import { navLinks } from "@/constants/data";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DesktopSideNav = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-[97vh] fixed left-0 top-0 z-40 m-3 ps-4 py-6 rounded-xl bg-penny-bg-mid border-r border-penny-border-subtle">
      {/* Logo */}
      <div className="mb-15 px-2">
        <Logo />
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-3">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/dashboard/overview" &&
              pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              target={link.page === "News" ? "_blank" : "_self"}
              className={`flex items-center gap-2 px-3 py-3 rounded-[60px] transition-all duration-200 group relative -right-5 ${
                isActive
                  ? "bg-penny-bg-base text-penny-accent"
                  : "bg-transparent text-penny-text-muted"
              }`}
            >
              <Icon
                icon={link.icon}
                width={24}
                height={24}
                className={`shrink-0 transition-colors duration-200 ${
                  isActive ? "text-penny-accent" : "text-penny-text-muted"
                }`}
              />
              <span
                className={`text-[16px] font-semibold transition-colors duration-200 ${
                  isActive ? "text-penny-accent" : "text-penny-text-muted"
                }`}
              >
                {link.page}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom user section */}
      <div className="mt-auto pt-4 mx-2 border-t border-penny-border-subtle">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#00d4a126]">
            <Icon
              icon="iconamoon:profile-circle-fill"
              width={18}
              className="text-penny-accent"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">
              UserID24
            </p>
            <p className="text-[10px] text-penny-text-muted">Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSideNav;
