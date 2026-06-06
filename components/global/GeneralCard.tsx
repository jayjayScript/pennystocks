const GeneralCard = ({ content, bgColor }: GeneralCardProps) => {
  return (
    <>
      <div
        className={`w-full p-4 rounded-2xl ${bgColor} py-[23px] px-5 rounded-[20px]`}
      >
        {content}
      </div>
    </>
  );
};

export default GeneralCard;
