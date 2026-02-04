import FeatureCard from '@/components/feature-card';
import styles from './index.module.less';

import iconSpyware from '@/assets/div-728-17870.png';
import iconKeylogger from '@/assets/div-728-17875.png';
import iconTracking from '@/assets/div-728-17880.png';
import iconOS from '@/assets/div-728-17885.png';
import iconThreat from '@/assets/div-728-17890.png';
import iconEasy from '@/assets/div-728-17895.png';
import iconArrow from '@/assets/span-after-728-17903.svg';

const featuresData = [
  {
    iconSrc: iconSpyware,
    title: "Spyware detection",
    description: "Our advanced spyware detection engine can identify if a device contains spyware or bugging software."
  },
  {
    iconSrc: iconKeylogger,
    title: "Keylogger detection",
    description: "Find malicious keyboards installed on your device that could allow someone to record things you type (e.g. passwords)."
  },
  {
    iconSrc: iconTracking,
    title: "Find tracking apps",
    description: "Check which apps can access your location, microphone or camera. Get alerted if a known tracking app is installed."
  },
  {
    iconSrc: iconOS,
    title: "OS integrity check",
    description: "Analyze your operating system for signs of tampering that could compromise security, such as Jailbreaking."
  },
  {
    iconSrc: iconThreat,
    title: "Threat removal",
    description: "Our intelligent scan will either safely remove threats for you or provide easy-to-follow instructions."
  },
  {
    iconSrc: iconEasy,
    title: "Easy to use",
    description: "We create easy to use apps that can check your device for vulnerabilities in a matter of minutes."
  }
];

export default function FeaturesGrid() {
  return (
    <section className={styles.featuresGridSection} id="features-grid">
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Get your freedom back, stop mobile spyware today
          </h2>
        </div>

        <div className={styles.grid}>
          {featuresData.map((item, index) => (
            <FeatureCard
              key={index}
              iconSrc={item.iconSrc}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>

        <div className={styles.actions}>
          <a href="#" className={styles.buttonPrimary}>
            <span>Get Certo for iPhone</span>
            <img src={iconArrow} alt="" />
          </a>
          <a href="#" className={styles.buttonSecondary}>
            <span>Get Certo for Android</span>
          </a>
        </div>
      </div>
    </section>
  );
}
