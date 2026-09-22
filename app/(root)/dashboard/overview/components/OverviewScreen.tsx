"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import DepositModal from "@/components/modals/DepositModal";
import WithdrawModal from "@/components/modals/WithdrawModal";
import { usePortfolio } from "@/context/PortfolioContext";
import { useUserProfile } from "@/hooks/queries";

export default function OverviewScreen() {
  const { accountBalance } = usePortfolio();
  const { data: profile } = useUserProfile();
  const totalDeposit = profile?.totalDeposit ?? 0;

  // Growth of the current balance relative to everything the user has deposited.
  const growthPct =
    totalDeposit > 0 ? ((accountBalance - totalDeposit) / totalDeposit) * 100 : 0;
  const growthLabel = `${growthPct >= 0 ? "+" : ""}${growthPct.toFixed(1)}%`;
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositKey, setDepositKey] = useState(0);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawKey, setWithdrawKey] = useState(0);

  const formatUSD = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

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
          {totalDeposit > 0 ? growthLabel : "0%"}
        </Badge>
      </div>

      <p className="text-[56px] md:text-[67px] font-extrabold text-white my-4 leading-none">
        {formatUSD(accountBalance)}
      </p>

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
