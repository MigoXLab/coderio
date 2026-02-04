import styles from './index.module.less';
import LogoIcon from '@/assets/logo-svg-728-18047.svg';
import ArrowIcon from '@/assets/a-after-728-18065.svg';

export default function Header() {
  return (
    <header
      id="728:17674"
      className="relative flex w-full max-w-[1440px] h-[102px] items-start justify-start bg-[#F3F8FF] overflow-hidden"
    >
      <div
        id="728:18045"
        className="relative flex w-full flex-row items-center gap-[410.81px] px-[120px] py-[24px]"
      >
        {/* Background Gradient Element */}
        <div
          id="728:18046"
          className={`absolute left-0 top-[51px] h-[51px] w-[1440px] ${styles.headerGradient}`}
        />

        {/* Logo */}
        <img
          id="728:18047"
          src={LogoIcon}
          alt="logo.svg"
          className="relative h-[54px] w-[157px] shrink-0 object-cover z-10"
        />

        {/* Navigation & CTA */}
        <div
          id="728:18057"
          className="relative flex flex-row items-center justify-start gap-[48px] z-10"
        >
          {/* Menu */}
          <ul
            id="728:18058"
            className="flex flex-row items-center justify-start gap-[48px] list-none p-0 m-0"
          >
            <li className="shrink-0">
              <a
                id="728:18059"
                className="font-inter text-[19px] font-extrabold leading-[25px] text-[#02033B] no-underline cursor-pointer"
              >
                iPhone
              </a>
            </li>
            <li className="shrink-0">
              <a
                id="728:18060"
                className="font-inter text-[19px] font-extrabold leading-[25px] text-[#02033B] no-underline cursor-pointer"
              >
                Android
              </a>
            </li>
            <li className="shrink-0">
              <a
                id="728:18061"
                className="font-inter text-[19px] font-extrabold leading-[25px] text-[#02033B] no-underline cursor-pointer"
              >
                Help
              </a>
            </li>
            <li
              id="728:18062"
              className="flex shrink-0 items-center justify-center"
            >
              <a
                id="728:18063"
                className="flex items-center gap-[9.11px] cursor-pointer"
              >
                <span
                  id="728:18064"
                  className="font-inter text-[19px] font-extrabold leading-[25px] text-[#02033B]"
                >
                  Company
                </span>
                <img
                  id="728:18065"
                  src={ArrowIcon}
                  alt="arrow"
                  className="h-[7px] w-[12px] shrink-0"
                />
              </a>
            </li>
          </ul>

          {/* Sign in Button */}
          <a
            id="728:18068"
            className="flex h-[50px] shrink-0 items-center justify-center gap-[10px] overflow-hidden rounded-[42px] bg-[#4335DE] px-[20px] py-[16px] cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span
              id="728:18069"
              className="font-inter text-[15px] font-extrabold leading-[18px] text-white whitespace-nowrap"
            >
              Sign in
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
