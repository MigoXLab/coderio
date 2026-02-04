import ArrowIcon from '@/assets/span-after-728-17919.svg';
import styles from './index.module.less';

const ResourcesSection = () => {
  return (
    <section
      id="728:17908"
      className="relative w-full bg-[#FFF] px-[264px] py-[84px] flex flex-col items-start gap-0"
    >
      <div
        id="728:17909"
        className={`flex flex-row items-start gap-[72px] px-[36px] ${styles.container}`}
      >
        {/* Card 1: Read our story */}
        <div
          id="728:17910"
          className="relative flex flex-col items-start overflow-hidden rounded-[48px] w-[460px] h-[296px] shrink-0"
          style={{
            background: 'linear-gradient(180deg, #F7C95F 0%, #FDB235 100%)',
          }}
        >
          {/* Title */}
          <div
            id="728:17911"
            className="flex flex-row items-start pt-[47px] pr-[204px] pb-px pl-[36px] box-border w-full"
          >
            <h2
              id="728:17912"
              className="text-[#02033B] font-['Inter'] text-[23px] font-extrabold leading-[30px] tracking-[-0.48px] text-left"
            >
              Read our story
            </h2>
          </div>

          {/* Text */}
          <div
            id="728:17913"
            className="flex flex-row items-start pr-[5px] pl-[36px] mt-[24px] box-border w-full"
          >
            <div
              id="728:17914"
              className="text-[#02033B] font-['Inter'] text-[16px] font-normal leading-[24px] text-left w-[358px]"
            >
              Find out why thousands trust Certo to secure their mobile world.
            </div>
          </div>

          {/* Button Wrapper */}
          <div
            id="728:17915"
            className="flex flex-row items-start pt-[48px] pr-[231px] pl-[36px] box-border w-full"
          >
            <a
              id="728:17916"
              href="#"
              className="flex flex-row items-start"
            >
              <div
                id="728:17917"
                className="flex flex-row items-center justify-center gap-[20px] pt-[16px] pb-[16px] pl-[20px] pr-[44px] bg-[#4335DE] rounded-[42px] overflow-hidden"
              >
                <div
                  id="728:17918"
                  className="text-[#FFFFFF] font-['Inter'] text-[15px] font-extrabold leading-[18px] text-left whitespace-nowrap"
                >
                  About us
                </div>
                <img
                  id="728:17919"
                  src={ArrowIcon}
                  alt=""
                  className="w-[16px] h-[11px]"
                />
              </div>
            </a>
          </div>
        </div>

        {/* Card 2: Help Center */}
        <div
          id="728:17922"
          className="relative flex flex-col items-start w-[308px] h-[296px] shrink-0"
        >
          {/* Title */}
          <div
            id="728:17923"
            className="flex flex-row items-start pr-[81px] pb-px pt-[47px] box-border w-full"
          >
            <h2
              id="728:17924"
              className="text-[#02033B] font-['Inter'] text-[23px] font-extrabold leading-[30px] tracking-[-0.48px] text-left"
            >
              Help Center
            </h2>
          </div>

          {/* Text */}
          <div
            id="728:17925"
            className="flex flex-row items-start pr-[15px] mt-[24px] box-border w-full"
          >
            <div
              id="728:17926"
              className="text-[#02033B] font-['Inter'] text-[16px] font-normal leading-[24px] text-left w-[196px]"
            >
              Help topics, getting started guides and FAQs.
            </div>
          </div>

          {/* Button Wrapper */}
          <div
            id="728:17927"
            className="flex flex-row items-start box-border w-full overflow-hidden mt-[48px]"
          >
            <div
              id="728:17928"
              className="flex flex-row items-start pr-[71px] pb-[24px] box-border"
            >
              <a
                id="728:17929"
                href="#"
                className="flex flex-row items-start"
              >
                <div
                  id="728:17930"
                  className="flex flex-row items-center justify-center pt-[16px] pb-[16px] pl-[20px] pr-[21px] rounded-[42px] overflow-hidden bg-transparent"
                  style={{
                    boxShadow: 'inset 0px 0px 0px 2px #02033B',
                  }}
                >
                  <div className="text-[#02033B] font-['Inter'] text-[15px] font-extrabold leading-[18px] text-left whitespace-nowrap">
                    Visit help center
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
