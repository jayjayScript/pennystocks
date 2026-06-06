"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function OverviewScreen() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Total Assets Hero Card */}
      <Card variant="glass-gradient" padding="lg">
        <div className="flex items-center justify-between">
          <p className="text-sm text-penny-text-muted">Total Assets</p>
          <Badge variant="accent" icon="mdi:trending-up">
            +22.8%
          </Badge>
        </div>
        <p className="text-[67px] font-extrabold text-white mb-1">$200,000</p>
        <div className="flex gap-4 w-full mt-4">
          <Button variant="secondary" fullWidth icon="mdi:arrow-down">
            Deposit
          </Button>
          <Button
            variant="ghost"
            className="bg-[#0b121d]"
            fullWidth
            icon="mdi:arrow-up"
          >
            Withdraw
          </Button>
        </div>
      </Card>
    </div>
  );
}
