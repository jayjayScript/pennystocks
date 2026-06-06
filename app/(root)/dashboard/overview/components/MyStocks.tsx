import GeneralCard from "@/components/global/GeneralCard";
import { Icon } from "@iconify/react";

const MyStocks = () => {
  return (
    <>
      <div className="p-4">
        <GeneralCard 
        content={
            <div>
                <header className="flex items-center justify-between">
                    <p className="text-[18px] font-medium">My Stocks</p>
                    <Icon icon="system-uicons:arrow-top-right" width={34} height={34} className="border-[0.81px] border-[#B4BCC5CC] text-[#FFFFFFCC] p-1 rounded-full" />
                </header>
            </div>
        }
        bgColor="bg-[#141D35]"
        />
      </div>
    </>
  );
};

export default MyStocks;
