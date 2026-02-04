import PhilosophyImage from '@/assets/div-728-17860.png';
import ArrowIcon from '@/assets/span-after-728-17855.svg';
import styles from './index.module.less';

export default function PhilosophySection() {
  return (
    <section
      id="728:17846"
      className="flex flex-row items-start justify-start bg-[#FFFFFF] pt-[84px] pb-[84px] pl-[132px] pr-[132px] box-border w-[1440px]"
    >
      <div
        id="728:17847"
        className="flex flex-row items-center gap-[60px] pr-[60px] box-border w-[1176px] h-[496px]"
      >
        <div
          id="728:17848"
          className="flex flex-col box-border w-[588px] h-[496px]"
        >
          <div
            id="728:17849"
            className="font-['Inter'] text-[36px] font-extrabold leading-[45px] tracking-[-0.72px] text-[#02033B] w-[446.4px] mb-[43px]"
          >
            At Certo, mobile security is not an afterthought, it’s what we do.
          </div>
          <div
            id="728:17850"
            className="font-['Inter'] text-[20px] font-normal leading-[30px] text-[#02033B] w-[448.23px] mb-[76px]"
          >
            With years of experience in mobile security and spyware detection, our products have helped countless people safeguard their devices and find peace of mind.
          </div>
          <div
            id="728:17851"
            className="flex flex-col gap-[24px] pr-[223.34px] pb-[24px] box-border w-[492px] items-start"
          >
            <button
              id="728:17852"
              className="flex flex-row items-start box-border pl-[20px] pr-[52px] pt-[16px] pb-[15.5px] bg-[#FFC247] rounded-[42px] overflow-hidden cursor-pointer"
            >
              <div
                id="728:17853"
                className="flex flex-row items-center gap-[16px] pr-[4.66px]"
              >
                <span
                  id="728:17854"
                  className="font-['Inter'] text-[19px] font-extrabold leading-[22.5px] text-[#02033B] whitespace-nowrap"
                >
                  Get Certo for iPhone
                </span>
                <img
                  id="728:17855"
                  src={ArrowIcon}
                  alt=""
                  className="w-[20px] h-[14px]"
                />
              </div>
            </button>

            <button
              id="728:17858"
              className="flex flex-row items-start box-border pl-[20px] pr-[25.59px] pt-[16px] pb-[15.5px] shadow-[inset_0px_0px_0px_2px_#02033B] rounded-[42px] overflow-hidden bg-transparent cursor-pointer"
            >
              <span
                id="728:17859"
                className="font-['Inter'] text-[19px] font-extrabold leading-[22.5px] text-[#02033B] whitespace-nowrap"
              >
                Get Certo for Android
              </span>
            </button>
          </div>
        </div>
        <img
          id="728:17860"
          src={PhilosophyImage}
          alt="Philosophy"
          className="w-[468px] h-[468px]"
        />
      </div>
    </section>
  );
}
