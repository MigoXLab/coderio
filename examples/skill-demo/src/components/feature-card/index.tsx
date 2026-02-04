import { FC } from 'react';

interface FeatureCardProps {
  iconSrc: string;
  title: string;
  description: string;
}

const FeatureCard: FC<FeatureCardProps> = ({ iconSrc, title, description }) => {
  return (
    <div
      id="728:17869"
      className="flex flex-col items-center w-[200px]"
    >
      <img
        id="728:17870"
        src={iconSrc}
        alt={title}
        className="w-[77px] h-[72px] object-contain"
      />
      <div
        id="728:17872"
        className="mt-6 font-inter font-extrabold text-[19px] leading-[25px] tracking-[-0.4px] text-[#02033B] text-center"
      >
        {title}
      </div>
      <div
        id="728:17873"
        className="mt-6 font-inter font-normal text-[16px] leading-[24px] text-[#02033B] text-center"
      >
        {description}
      </div>
    </div>
  );
};

export default FeatureCard;
