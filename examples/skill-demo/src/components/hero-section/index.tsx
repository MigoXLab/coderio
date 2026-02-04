import { FC } from 'react';
import BgCircle from '@/assets/bg-circle-svg-728-17676.svg';
import HeroDecoration from '@/assets/div-728-17679.png';
import HeroFigure from '@/assets/figure-728-17698.png';
import ArrowIcon from '@/assets/span-after-728-17693.svg';
import styles from './index.module.less';

const HeroSection: FC = () => {
  return (
    <section
      id="728:17675"
      className="relative w-[1440px] h-[708px] bg-[#F3F8FF] overflow-hidden font-['Inter'] mx-auto"
    >
      {/* Background Circle */}
      <img
        id="728:17676"
        src={BgCircle}
        alt=""
        className="absolute top-0 left-0 w-[1440px] h-[708px] object-cover pointer-events-none"
      />

      {/* Decoration Blob */}
      <img
        id="728:17679"
        src={HeroDecoration}
        alt=""
        className="absolute left-[792px] top-[94px] w-[720px] h-[720px] object-cover max-w-none pointer-events-none"
      />

      {/* Main Content Wrapper */}
      <div
        id="728:17682"
        className="absolute left-[177px] top-[123px] flex flex-row items-start gap-[15px] w-[1086px] h-[461px] pr-[196px]"
      >
        {/* Left Text Column */}
        <div
          id="728:17683"
          className="flex flex-col w-[633.5px] h-[461.25px]"
        >
          {/* H1 Wrapper */}
          <div
            id="728:17684"
            className="flex items-center w-[603.5px] h-[150px] overflow-hidden shrink-0"
          >
            <h1
              id="728:17685"
              className="text-[#02033B] font-[800] text-[60px] leading-[75px] -tracking-[1.2px]"
            >
              Your mobile privacy is our mission
            </h1>
          </div>

          {/* Subtext Wrapper */}
          <div
            id="728:17686"
            className="flex items-center w-[603.5px] h-[90px] mt-[48px] overflow-hidden shrink-0"
          >
            <p
              id="728:17687"
              className="text-[#02033B] font-[400] text-[20px] leading-[30px]"
            >
              Think your phone has been hacked? Our trusted apps make it easy for you to scan, detect and remove threats from your iPhone and Android devices.
            </p>
          </div>

          {/* Buttons Section Wrapper */}
          <div
            id="728:17688"
            className="w-[612.25px] h-[78.5px] mt-[96px] shrink-0"
          >
            <div
              id="728:17689"
              className="flex flex-row gap-[48px]"
            >
              {/* iPhone Button */}
              <a
                id="728:17690"
                href="#"
                className="flex flex-row items-center bg-[#FFC247] rounded-[42px] px-[20px] pt-[16px] pb-[15.5px] gap-[10px] h-[54.5px] box-border hover:opacity-90 transition-opacity"
              >
                <span
                  id="728:17691"
                  className="flex items-center gap-[4.6px]"
                >
                  <span
                    id="728:17692"
                    className="text-[#02033B] font-[800] text-[19px] leading-[22.5px]"
                  >
                    Get Certo for iPhone
                  </span>
                  <img
                    id="728:17693"
                    src={ArrowIcon}
                    alt=""
                    className="w-[20px] h-[14px]"
                  />
                </span>
              </a>

              {/* Android Button */}
              <a
                id="728:17696"
                href="#"
                className={`flex flex-row items-center rounded-[42px] px-[20px] pt-[16px] pb-[15.5px] h-[54.5px] box-border hover:bg-[#02033B] hover:text-white transition-colors group ${styles.androidButton}`}
              >
                <span
                  id="728:17697"
                  className="text-[#02033B] font-[800] text-[19px] leading-[22.5px] group-hover:text-white"
                >
                  Get Certo for Android
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Figure */}
        <img
          id="728:17698"
          src={HeroFigure}
          alt=""
          className="w-[241.5px] h-[461.25px] object-cover shrink-0"
        />
      </div>
    </section>
  );
};

export default HeroSection;
