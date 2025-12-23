import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground}>
        <div className={styles.heroGrid}></div>
        <div className={styles.heroGlow}></div>
      </div>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroLabel}>Next-Generation Education</div>
          <h1 className={styles.heroTitle}>
            Build Intelligent
            <br />
            <span className={styles.gradientText}>Humanoid Robots</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Master Physical AI, ROS 2, NVIDIA Isaac Sim, and Vision-Language-Action models.
            From simulation to real-world deployment in 13 weeks.
          </p>
          <div className={styles.heroButtons}>
            <Link to="/docs/chapter-1-introduction-to-physical-ai" className={styles.primaryButton}>
              Start Learning
              <svg className={styles.buttonIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link to="/docs/intro" className={styles.secondaryButton}>
              View Curriculum
            </Link>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>13</div>
              <div className={styles.statLabel}>Weeks</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>6</div>
              <div className={styles.statLabel}>Chapters</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>4</div>
              <div className={styles.statLabel}>Modules</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChaptersSection() {
  const chapters = [
    {
      number: '01',
      title: 'Introduction to Physical AI',
      duration: 'Weeks 1-2',
      description: 'Foundations of embodied intelligence, sensor ecosystems, and humanoid robotics landscape.',
      link: '/docs/chapter-1-introduction-to-physical-ai',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      image: '/img/iStock-1184804468-1000x0-c-default.webp'
    },
    {
      number: '02',
      title: 'The Robotic Nervous System',
      duration: 'Weeks 3-5',
      description: 'Master ROS 2 architecture, nodes, topics, and bridge Python AI to robot controllers.',
      link: '/docs/chapter-2-basics-of-humanoid-robotics',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      image: '/img/istockphoto-1496920323-612x612.jpg'
    },
    {
      number: '03',
      title: 'Digital Twin Simulation',
      duration: 'Weeks 6-7',
      description: 'Build high-fidelity environments with Gazebo and Unity for robot testing.',
      link: '/docs/chapter-3-ros-2-fundamentals',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      image: '/img/istockphoto-966248982-612x612.jpg'
    },
    {
      number: '04',
      title: 'The AI-Robot Brain',
      duration: 'Weeks 8-10',
      description: 'NVIDIA Isaac Sim, photorealistic simulation, synthetic data, and VSLAM.',
      link: '/docs/chapter-4-digital-twin-simulation',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      image: '/img/0_coCX2RBuCrXzsPgp.jpg'
    },
    {
      number: '05',
      title: 'Vision-Language-Action',
      duration: 'Weeks 11-12',
      description: 'Integrate LLMs with robotics and translate voice commands to actions.',
      link: '/docs/chapter-5-vision-language-action-systems',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      image: '/img/360_F_272681855_yaxT3ZJGgOo3AHzNEKOfORe5YznybPCP.jpg'
    },
    {
      number: '06',
      title: 'Capstone Project',
      duration: 'Week 13',
      description: 'Build an autonomous humanoid with voice understanding and object manipulation.',
      link: '/docs/chapter-6-capstone-ai-robot-pipeline',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      image: '/img/robot-with-stock-chart.webp'
    },
  ];

  return (
    <section className={styles.chapters}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionLabel}>Curriculum</div>
          <h2 className={styles.sectionTitle}>Complete Learning Path</h2>
          <p className={styles.sectionSubtitle}>
            A comprehensive journey from AI fundamentals to autonomous humanoid robots
          </p>
        </div>
        <div className={styles.chaptersGrid}>
          {chapters.map((chapter, idx) => (
            <Link key={idx} to={chapter.link} className={styles.chapterCard}>
              <div className={styles.cardImage}>
                <img
                  src={chapter.image}
                  alt={chapter.title}
                  style={{ maxWidth: '100%', height: '180px', objectFit: 'cover' }}
                />
              </div>
              <div className={styles.cardBadge}>{chapter.number}</div>
              <div className={styles.cardDuration}>{chapter.duration}</div>
              <h3 className={styles.cardTitle}>{chapter.title}</h3>
              <p className={styles.cardDescription}>{chapter.description}</p>
              <div className={styles.cardArrow}>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: 'Embodied Intelligence',
      description: 'Learn how AI transitions from digital environments to physical robots that understand real-world physics and dynamics.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      image: '/img/human-meets-robot-stockcake.webp'
    },
    {
      title: 'Industry-Standard Tools',
      description: 'Master ROS 2, NVIDIA Isaac Sim, and Gazebo - the same tools used by Boston Dynamics, Tesla, and NASA.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      image: '/img/robot-with-stock-chart.webp'
    },
    {
      title: 'Hands-On Projects',
      description: 'Build real projects from simulation to deployment, culminating in a fully autonomous humanoid robot.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      image: '/img/robot-coding-session-stockcake.webp'
    },
  ];

  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureImage}>
                <img
                  src={feature.image}
                  alt={feature.title}
                  style={{ maxWidth: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }}
                />
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.cta}>
      <div className="container">
        <div className={styles.ctaCard}>
          <div className={styles.ctaImage}>
            <img
              src="/img/human-meets-robot-stockcake.webp"
              alt="Join the robotics education journey"
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px' }}
            />
          </div>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Start Your Journey?</h2>
            <p className={styles.ctaDescription}>
              Join the next generation of robotics engineers and AI developers building the future of physical AI.
            </p>
            <Link to="/docs/chapter-1-introduction-to-physical-ai" className={styles.ctaButton}>
              Begin Chapter 1
              <svg className={styles.buttonIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Physical AI & Humanoid Robotics"
      description="Master ROS 2, NVIDIA Isaac, and Vision-Language-Action models to build intelligent humanoid robots">
      <HeroSection />
      <FeaturesSection />
      <ChaptersSection />
      <CTASection />
    </Layout>
  );
}
