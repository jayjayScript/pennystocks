"use client";

import { navLinks } from "@/constants/data";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GeneralCard from "../GeneralCard";

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-sm md:hidden">
      <GeneralCard
        content={
          <div className="flex items-center justify-between">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard/overview" &&
                  pathname.startsWith(link.href));

              const marketPlaceButtonStyle = link.page === "Market place";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.page === "News" ? "_blank" : "_self"}
                  className="flex flex-col items-center gap-1 min-w-[48px] group relative"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 transition-all duration-200 ${
                      isActive
                        ? "bg-penny-surface-3"
                        : marketPlaceButtonStyle
                          ? "bg-penny-accent"
                          : "transparent"
                    } ${
                      marketPlaceButtonStyle
                        ? "rounded-full absolute top-[-20px] left-1/2 -translate-x-1/2 scale-190 inset-shadow-2xs"
                        : "rounded-xl"
                    }`}
                  >
                    <Icon
                      icon={link.icon}
                      width={22}
                      height={22}
                      className={`transition-colors duration-200 ${
                        isActive
                          ? "text-penny-accent"
                          : marketPlaceButtonStyle
                            ? "text-penny-bg-base"
                            : "text-penny-text-muted"
                      } ${marketPlaceButtonStyle ? "scale-65" : ""}`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-semibold leading-none transition-colors duration-200 ${
                      marketPlaceButtonStyle ? "mt-12" : ""
                    } ${isActive ? "text-penny-accent" : "text-penny-text-muted"}`}
                  >
                    {link.page === "Market place" ? "Market" : link.page}
                  </span>
                </Link>
              );
            })}
          </div>
        }
        bgColor="bg-penny-surface-3/80 backdrop-blur-md"
      />
    </nav>
  );
};

export default MobileNav;
