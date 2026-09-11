"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import DepositModal from "@/components/modals/DepositModal";
import WithdrawModal from "@/components/modals/WithdrawModal";
import { useUserProfile } from "@/hooks/queries";
import { formatUSD } from "@/context/PortfolioContext";

export default function OverviewScreen() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositKey, setDepositKey] = useState(0);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawKey, setWithdrawKey] = useState(0);

  const { data: profile, isLoading } = useUserProfile();
  const balance = profile?.balance ?? 0;

  const openDepositModal = () => {
    setDepositKey((k) => k + 1);
    setDepositOpen(true);
  };

  const openWithdrawModal = () => {
    setWithdrawKey((k) => k + 1);
    setWithdrawOpen(true);
  };

  return (
    <Card
      variant="glass-gradient"
      padding="lg"
      className="h-full flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-penny-text-muted">Total Assets</p>
        <Badge variant="accent" icon="mdi:trending-up">
          {isLoading ? "..." : `${(profile?.totalDeposit ?? 0) > 0 ? "+" : "0%"}`}
        </Badge>
      </div>

      {isLoading ? (
        <div className="h-[56px] my-4 flex items-end">
          <div className="h-8 w-40 animate-pulse rounded bg-white/10" />
        </div>
      ) : (
        <p className="text-[56px] md:text-[67px] font-extrabold text-white my-4 leading-none">
          {formatUSD(balance)}
        </p>
      )}

      <p className="text-sm text-penny-text-muted mb-4">
        Portfolio value as of today
      </p>
      <div className="flex gap-4 w-full mt-auto">
        <Button
          variant="secondary"
          fullWidth
          icon="mdi:arrow-down"
          onClick={openDepositModal}
        >
          Deposit
        </Button>
        <Button
          variant="ghost"
          className="bg-[#0b121d]"
          fullWidth
          icon="mdi:arrow-up"
          onClick={openWithdrawModal}
        >
          Withdraw
        </Button>
      </div>

      {depositOpen && (
        <DepositModal
          key={depositKey}
          isOpen={depositOpen}
          onClose={() => setDepositOpen(false)}
        />
      )}
      {withdrawOpen && (
        <WithdrawModal
          key={withdrawKey}
          isOpen={withdrawOpen}
          onClose={() => setWithdrawOpen(false)}
        />
      )}
    </Card>
  );
}
