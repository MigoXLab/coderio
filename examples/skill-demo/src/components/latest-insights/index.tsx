import InsightCard from '@/components/insight-card';
import spanAfter72817953 from '@/assets/span-after-728-17953.svg';
import image1 from '@/assets/a-728-17958.png';
import image2 from '@/assets/a-728-17972.png';
import image3 from '@/assets/a-728-17965.png';
import styles from './index.module.less';

const insightCardsData = [
  {
    imageSrc: image1,
    tag: "Guides",
    title: "The 6 Best Apps to Track Your Children (And Why)",
    date: "August 20, 2024",
    description: "These are the top apps for tracking your children. We also discuss why you should, or shouldn't track your kids."
  },
  {
    imageSrc: image2,
    tag: "Expertise",
    title: "How to Hack a Phone: It’s Easier Than You Think",
    date: "August 20, 2024",
    description: "Phone hacking is a real threat and it can happen to anyone. Here's how it works and how to protect yourself."
  },
  {
    imageSrc: image3,
    tag: "Guides",
    title: "5 Ways to Find Hidden Spy Apps on Your Phone",
    date: "August 20, 2024",
    description: "Think someone is spying on you? Here are 5 simple ways to find hidden spy apps on your iPhone or Android."
  }
];

export default function LatestInsights() {
  return (
    <aside id="728:17945" className="w-full flex justify-center py-[84px] px-[192px] bg-[#F3F8FF] overflow-hidden relative">
      <div id="728:17946" className="flex flex-col items-center gap-[72px] w-[1056px]">
        <h2 id="728:17947" className="font-['Inter'] font-extrabold text-[56px] leading-[75px] text-center tracking-[-1.2px] text-[#02033B]">
          Latest insights
        </h2>

        <div id="728:17956" className="flex flex-row gap-[48px]">
          {insightCardsData.map((item, index) => (
            <InsightCard key={index} {...item} />
          ))}
        </div>

        <div id="728:17949">
          <a id="728:17950" href="#" className="flex flex-row items-center bg-[#FFC247] rounded-[42px] pl-[20px] pr-[51px] pt-[16px] pb-[15.5px] overflow-hidden relative">
            <span id="728:17951" className="flex flex-row items-center gap-[12px] relative">
              <span id="728:17952" className="font-['Inter'] font-extrabold text-[19px] leading-[22.5px] text-center text-[#02033B]">
                View all insights
              </span>
              <img src={spanAfter72817953} alt="" className="w-[20px] h-[14px]" />
            </span>
          </a>
        </div>
      </div>
    </aside>
  );
}
