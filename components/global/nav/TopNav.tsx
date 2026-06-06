"use client";

import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function TopNav() {
  const pathname = usePathname();

  if (pathname === "/dashboard/marketplace/copy-trading") {
    return null;
  }

  // Helper to determine active page configurations
  const getNavConfig = () => {
    switch (true) {
      case pathname === "/dashboard/overview":
        return {
          subtitle: "",
          title: "Godian",
          rightSlot: (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-9 h-9 p-0! rounded-full"
              >
                <Icon icon="mdi:bell-notification" width={18} />
              </Button>
              <div className="bg-[#D9D9D9] w-7 h-7 rounded-full flex items-center justify-center">
                <Icon
                  icon="iconamoon:profile-fill"
                  width={20}
                  className="text-black/30"
                />
              </div>
            </div>
          ),
        };
      case pathname.startsWith("/dashboard/marketplace"):
        return {
          subtitle: "Explore assets",
          title: "Market Place",
          rightSlot: (
            <Button
              variant="surface"
              size="sm"
              className="w-9 h-9 !p-0 rounded-full border-0 bg-penny-surface-2"
            >
              <Icon
                icon="mdi:filter-outline"
                width={18}
                className="text-penny-text-muted"
              />
            </Button>
          ),
        };
      case pathname.startsWith("/dashboard/my-stocks"):
        return {
          subtitle: "Your holdings",
          title: "My Stocks",
          rightSlot: (
            <Badge variant="accent" icon="mdi:trending-up" size="md">
              Portfolio Up
            </Badge>
          ),
        };
      case pathname.startsWith("/dashboard/news"):
        return {
          subtitle: "Stay informed",
          title: "News",
          rightSlot: (
            <Button variant="surface" size="sm" icon="mdi:filter-outline">
              Filter
            </Button>
          ),
        };
      case pathname.startsWith("/dashboard/faq"):
        return {
          subtitle: "Have questions?",
          title: "FAQ",
          rightSlot: null,
        };
      case pathname.startsWith("/dashboard/profile"):
        return {
          subtitle: "Account settings",
          title: "Profile",
          rightSlot: (
            <Button variant="surface" size="md" icon="mdi:pencil-outline">
              Edit
            </Button>
          ),
        };
      default:
        return {
          subtitle: "PennyStocks",
          title: "Dashboard",
          rightSlot: null,
        };
    }
  };

  const config = getNavConfig();

  return (
    <header className="w-full sticky top-0 left-0 right-0 z-30 px-4 md:px-8 py-4 backdrop-blur-xl transition-all duration-200 bg-penny-bg-base/80 border-b border-penny-border-subtle/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[24px] transition-colors duration-200 text-penny-text-muted">
            {config.subtitle}
          </p>
          <h1 className="text-2xl font-bold text-white mt-0.5 transition-all duration-200">
            {config.title}
          </h1>
        </div>
        <div>{config.rightSlot}</div>
      </div>
    </header>
  );
}
