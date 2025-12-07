import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function NetflixHero() {
  return (
    <div className={styles.hero}>
      <div className={styles.heroGradient}></div>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>Physical AI & Humanoid Robotics</h1>
        <p className={styles.heroDescription}>
          Master the future of AI systems in the physical world. Learn ROS 2, NVIDIA Isaac,
          Gazebo simulation, and Vision-Language-Action models to build intelligent humanoid robots.
        </p>
        <div className={styles.heroButtons}>
          <Link to="/docs/chapter-1-introduction-to-physical-ai" className={styles.playButton}>
            <span className={styles.playIcon}>▶</span>
            Start Learning
          </Link>
          <button className={styles.infoButton}>
            <span className={styles.infoIcon}>ℹ</span>
            More Info
          </button>
        </div>
        <div className={styles.courseInfo}>
          <span className={styles.badge}>13 Weeks</span>
          <span className={styles.badge}>6 Chapters</span>
          <span className={styles.badge}>4 Modules</span>
          <span className={styles.badge}>Beginner Friendly</span>
        </div>
      </div>
    </div>
  );
}

function ChapterRow() {
  const chapters = [
    {
      id: 1,
      title: 'Introduction to Physical AI',
      subtitle: 'Weeks 1-2',
      description: 'Foundations of embodied intelligence, sensor systems, and the humanoid robotics landscape.',
      link: '/docs/chapter-1-introduction-to-physical-ai',
      icon: '🧠',
      color: '#E50914',
    },
    {
      id: 2,
      title: 'The Robotic Nervous System',
      subtitle: 'Weeks 3-5',
      description: 'Master ROS 2 - nodes, topics, services, and bridging Python AI agents to robot controllers.',
      link: '/docs/chapter-2-basics-of-humanoid-robotics',
      icon: '🔧',
      color: '#0080FF',
    },
    {
      id: 3,
      title: 'The Digital Twin',
      subtitle: 'Weeks 6-7',
      description: 'Simulate physics with Gazebo and Unity. Build high-fidelity virtual environments.',
      link: '/docs/chapter-3-ros-2-fundamentals',
      icon: '🌐',
      color: '#00C853',
    },
    {
      id: 4,
      title: 'The AI-Robot Brain',
      subtitle: 'Weeks 8-10',
      description: 'NVIDIA Isaac Sim for photorealistic simulation, synthetic data, and SLAM.',
      link: '/docs/chapter-4-digital-twin-simulation',
      icon: '💎',
      color: '#AA00FF',
    },
    {
      id: 5,
      title: 'Vision-Language-Action',
      subtitle: 'Weeks 11-12',
      description: 'Integrate LLMs with robotics. Voice commands to robot actions with GPT.',
      link: '/docs/chapter-5-vision-language-action-systems',
      icon: '👁️',
      color: '#FF6D00',
    },
    {
      id: 6,
      title: 'Capstone Project',
      subtitle: 'Week 13',
      description: 'Build an autonomous humanoid that understands voice and manipulates objects.',
      link: '/docs/chapter-6-capstone-ai-robot-pipeline',
      icon: '🎓',
      color: '#FFD600',
    },
  ];

  return (
    <div className={styles.rowSection}>
      <h2 className={styles.rowTitle}>Course Curriculum</h2>
      <div className={styles.rowContainer}>
        <div className={styles.cardRow}>
          {chapters.map((chapter) => (
            <Link key={chapter.id} to={chapter.link} className={styles.card}>
              <div className={styles.cardInner}>
                <div className={styles.cardIcon} style={{color: chapter.color}}>
                  {chapter.icon}
                </div>
                <div className={styles.cardNumber}>Chapter {chapter.id}</div>
                <div className={styles.cardContent}>
                  <div className={styles.cardSubtitle}>{chapter.subtitle}</div>
                  <h3 className={styles.cardTitle}>{chapter.title}</h3>
                  <p className={styles.cardDescription}>{chapter.description}</p>
                  <div className={styles.cardPlay}>
                    <span className={styles.playIcon}>▶</span>
                    <span>Start Chapter</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturesRow() {
  const features = [
    {
      icon: '🤖',
      title: 'Embodied AI',
      description: 'Learn how AI transitions from digital to physical robots.',
    },
    {
      icon: '⚡',
      title: 'Industry Tools',
      description: 'ROS 2, Isaac Sim, Gazebo - same as Boston Dynamics.',
    },
    {
      icon: '🎯',
      title: 'Hands-On',
      description: 'Build real projects from simulation to deployment.',
    },
    {
      icon: '🏆',
      title: 'Capstone Project',
      description: 'Complete autonomous humanoid robot pipeline.',
    },
  ];

  return (
    <div className={styles.rowSection}>
      <h2 className={styles.rowTitle}>What You'll Learn</h2>
      <div className={styles.rowContainer}>
        <div className={styles.featuresRow}>
          {features.map((feature, idx) => (
            <div key={idx} className={styles.featureItem}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Physical AI & Humanoid Robotics"
      description="Master ROS 2, NVIDIA Isaac, and Vision-Language-Action models">
      <div className={styles.netflixWrapper}>
        <NetflixHero />
        <ChapterRow />
        <FeaturesRow />
      </div>
    </Layout>
  );
}
