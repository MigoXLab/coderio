import { FC } from 'react';

interface InsightCardProps {
  imageSrc: string;
  tag: string;
  title: string;
  date: string;
  description: string;
}

const InsightCard: FC<InsightCardProps> = ({
  imageSrc,
  tag,
  title,
  date,
  description,
}) => {
  return (
    <div className="relative w-[320px] h-[534px] rounded-[48px] overflow-hidden group cursor-pointer">
      {/* Background Image */}
      <img
        id="728:17958"
        src={imageSrc}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
        {/* Tag */}
        <div className="absolute top-8 left-8 bg-white text-black text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide">
          {tag}
        </div>

        {/* Date */}
        <div className="text-sm font-medium mb-2 opacity-90">
          {date}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold leading-tight mb-3 font-inter">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed opacity-80 font-inter line-clamp-3">
          {description}
        </p>
      </div>
    </div>
  );
};

export default InsightCard;
