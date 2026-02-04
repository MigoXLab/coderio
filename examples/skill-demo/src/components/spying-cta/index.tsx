import { FC } from 'react';
import styles from './index.module.less';
import ArrowIcon from '@/assets/span-after-728-17940.svg';

const SpyingCTA: FC = () => {
  return (
    <section 
      id="728:17931" 
      className={`w-full flex justify-center py-[84px] px-[20px] md:px-[345px] ${styles.container}`}
    >
      <div id="728:17932" className="flex flex-col items-center w-full max-w-[750px]">
        {/* Text Group */}
        <div id="728:17933" className="flex flex-col items-center text-center w-full max-w-[720px] mb-[60px]">
          <h2 
            id="728:17934" 
            className="text-white font-[Inter] font-extrabold text-[34px] leading-[45px] tracking-[-0.72px] mb-[50px]"
          >
            Is someone spying on your phone?
          </h2>
          <p 
            id="728:17935" 
            className="text-white font-[Inter] font-normal text-[18px] leading-[30px]"
          >
            Find out with Certo
          </p>
        </div>

        {/* Buttons Group */}
        <div id="728:17936" className="flex flex-row gap-[24px] justify-center items-center flex-wrap">
          {/* iPhone Button */}
          <a 
            id="728:17937" 
            href="#"
            className="flex items-center bg-[#FFC247] rounded-[42px] pl-[20px] pr-[52px] pt-[16px] pb-[15.5px] overflow-hidden hover:opacity-90 transition-opacity"
          >
            <span id="728:17938" className="flex items-center gap-[16px] pr-[4.6px]">
              <span 
                id="728:17939" 
                className="font-[Inter] font-extrabold text-[19px] leading-[22.5px] text-[#02033B]"
              >
                Get Certo for iPhone
              </span>
              <img 
                id="728:17940" 
                src={ArrowIcon} 
                alt="" 
                className="w-[20px] h-[14px]" 
              />
            </span>
          </a>

          {/* Android Button */}
          <a 
            id="728:17943" 
            href="#"
            className={`flex items-center bg-transparent rounded-[42px] pl-[20px] pr-[25.6px] pt-[16px] pb-[15.5px] overflow-hidden hover:bg-white/10 transition-colors ${styles.androidBtn}`}
          >
            <span 
              id="728:17944" 
              className="font-[Inter] font-extrabold text-[19px] leading-[22.5px] text-white"
            >
              Get Certo for Android
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default SpyingCTA;
