import styles from './index.module.less';
import UlIcon from '@/assets/ul-728-17983.svg';
import SpanIcon1 from '@/assets/span-728-18004.svg';
import SpanIcon2 from '@/assets/span-728-18009.svg';
import SpanIcon3 from '@/assets/span-728-18014.svg';
import SpanIcon4 from '@/assets/span-728-18019.svg';
import SpanIcon5 from '@/assets/span-728-18024.svg';
import FormBeforeIcon from '@/assets/form-newsletter-signup-footer-form-before-728-18030.svg';

export default function Footer() {
  return (
    <footer id="728:17979" className="w-full bg-[#02033B] px-12 py-24 lg:px-[192px] lg:py-[96px] text-white overflow-hidden">
      <div id="728:17980" className="max-w-[1056px] mx-auto flex flex-col gap-12 lg:gap-0 lg:flex-row lg:justify-between flex-wrap relative">
        
        {/* Left Column */}
        <div className="flex flex-col gap-[48px]">
          <div id="728:17981" className="flex flex-col">
            <div id="728:17982" className="text-[23px] font-extrabold leading-[30px] text-white mb-[49px]">
              Scan. Detect. Remove.
            </div>
            <img id="728:17983" src={UlIcon} alt="socials" className="w-[348px] h-[72px] mb-[12px]" />
            <div id="728:17993" className="flex gap-[25px]">
              <a href="#" id="728:17994" className="text-[11px] underline leading-[15px] text-white decoration-white underline-offset-2">Privacy Policy</a>
              <a href="#" id="728:17995" className="text-[11px] underline leading-[15px] text-white decoration-white underline-offset-2">Terms of Service</a>
            </div>
          </div>

          <div id="728:17996" className="flex flex-col gap-[18px] text-[11px] leading-[15px] text-white max-w-[312px]">
            <p id="728:17997">
              Copyright © 2022 Certo Software Limited | Registered in England & Wales No. 10072356
            </p>
            <p id="728:17998">
              Designed & developed by <a href="#" className="underline decoration-white underline-offset-2">Bigger Picture</a>
            </p>
          </div>
        </div>

        {/* Middle Column */}
        <div id="728:17999" className="flex flex-col gap-[60px]">
          <div id="728:18000" className="w-[188px] h-[70px] flex items-start pt-0 pl-0 border-b border-white p-[25px]">
            <div id="728:18001" className="text-[35px] font-extrabold leading-[45px] text-white">
              Certo
            </div>
          </div>

          <div id="728:18002" className="flex flex-col gap-[24px]">
            <a href="#iphone" id="728:18003" className="flex items-center gap-[24px] group">
              <img id="728:18004" src={SpanIcon1} alt="" className="w-[20px] h-[20px]" />
              <span id="728:18007" className="text-[19px] font-extrabold leading-[25px] text-[#FFC247] group-hover:underline">iPhone</span>
            </a>
            <a href="#android" id="728:18008" className="flex items-center gap-[24px] group">
              <img id="728:18009" src={SpanIcon2} alt="" className="w-[20px] h-[20px]" />
              <span id="728:18012" className="text-[19px] font-extrabold leading-[25px] text-[#FFC247] group-hover:underline">Android</span>
            </a>
            <a href="#help" id="728:18013" className="flex items-center gap-[24px] group">
              <img id="728:18014" src={SpanIcon3} alt="" className="w-[20px] h-[20px]" />
              <span id="728:18017" className="text-[19px] font-extrabold leading-[25px] text-[#FFC247] group-hover:underline">Help</span>
            </a>
            <a href="#about" id="728:18018" className="flex items-center gap-[24px] group">
              <img id="728:18019" src={SpanIcon4} alt="" className="w-[20px] h-[20px]" />
              <span id="728:18022" className="text-[19px] font-extrabold leading-[25px] text-[#FFC247] group-hover:underline">About</span>
            </a>
            <a href="#insights" id="728:18023" className="flex items-center gap-[24px] group">
              <img id="728:18024" src={SpanIcon5} alt="" className="w-[20px] h-[20px]" />
              <span id="728:18027" className="text-[19px] font-extrabold leading-[25px] text-[#FFC247] group-hover:underline">Insights</span>
            </a>
          </div>
        </div>

        {/* Right Column - Newsletter */}
        <div id="728:18028" className="relative">
             <form id="728:18029" className={`${styles.newsletterForm} w-[436px] min-h-[232px] px-[36px] py-[35px] relative z-10 flex flex-col justify-between`}>
                <img id="728:18030" src={FormBeforeIcon} className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" alt="" />
                
                <div id="728:18033" className="relative z-10 flex flex-col gap-[36px]">
                  <div id="728:18034" className="flex flex-col gap-[21px]">
                    <h3 id="728:18035" className="text-[23px] font-extrabold leading-[30px] text-[#02033B]">Sign up to our newsletter</h3>
                    <p id="728:18036" className="text-[15px] leading-[20px] text-[#02033B] max-w-[358px]">
                      Receive the latest mobile security news, exclusive discounts & offers straight to your inbox!
                    </p>
                  </div>
                  
                  <div id="728:18037" className="flex w-full">
                     <div id="728:18038" className={`flex-1 h-[35px] ${styles.newsletterInput} overflow-hidden pl-[21px] flex items-center`}>
                        <input 
                            id="728:18039" 
                            type="email" 
                            placeholder="Email address"
                            className="w-full h-full bg-transparent outline-none text-[#02033B] placeholder-[#02033B]/50 text-[15px]"
                        />
                     </div>
                     <button id="728:18041" className={`h-[35px] px-[21px] ${styles.newsletterSubmit} text-white text-[15px] font-extrabold flex items-center justify-center cursor-pointer hover:bg-[#02033B]/90 transition-colors`}>
                        Submit
                     </button>
                  </div>
                </div>
             </form>
        </div>
      </div>
      
      {/* Bottom Text */}
      <div className="max-w-[1056px] mx-auto mt-[60px]">
        <p id="728:18044" className="text-[12px] leading-[15px] text-white max-w-[550px] opacity-100">
          Apple, the Apple logo, and iPhone are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Android, Google Play and the Google Play logo are trademarks of Google LLC.
        </p>
      </div>
    </footer>
  );
}
