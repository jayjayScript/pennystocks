"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import DepositModal from "@/components/modals/DepositModal";
import WithdrawModal from "@/components/modals/WithdrawModal";

export default function OverviewScreen() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  return (
    <Card variant="glass-gradient" padding="lg" className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className="text-sm text-penny-text-muted">Total Assets</p>
        <Badge variant="accent" icon="mdi:trending-up">
          +22.8%
        </Badge>
      </div>
      <p className="text-[56px] md:text-[67px] font-extrabold text-white my-4 leading-none">
        $200,000
      </p>
      <p className="text-sm text-penny-text-muted mb-4">
        Portfolio value as of today
      </p>
      <div className="flex gap-4 w-full mt-auto">
        <Button
          variant="secondary"
          fullWidth
          icon="mdi:arrow-down"
          onClick={() => setDepositOpen(true)}
        >
          Deposit
        </Button>
        <Button
          variant="ghost"
          className="bg-[#0b121d]"
          fullWidth
          icon="mdi:arrow-up"
          onClick={() => setWithdrawOpen(true)}
        >
          Withdraw
        </Button>
      </div>

      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
      <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
    </Card>
  );
}