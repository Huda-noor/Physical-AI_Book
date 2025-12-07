import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={styles.heroBackground}>
        <div className={styles.heroPattern}></div>
      </div>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>🚀</span>
            <span>Next-Generation AI Education</span>
          </div>
          <Heading as="h1" className={styles.heroTitle}>
            Physical AI & Humanoid Robotics
          </Heading>
          <p className={styles.heroSubtitle}>
            Master the future of AI systems in the physical world. Learn ROS 2, simulation,
            NVIDIA Isaac, and Vision-Language-Action models to build intelligent humanoid robots.
          </p>
          <div className={styles.heroButtons}>
            <Link
              className={clsx('button button--lg', styles.buttonPrimary)}
              to="/docs/chapter-1-introduction-to-physical-ai">
              Start Learning
              <span className={styles.buttonArrow}>→</span>
            </Link>
            <Link
              className={clsx('button button--lg', styles.buttonSecondary)}
              to="/docs/intro">
              View Curriculum
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>6</div>
              <div className={styles.statLabel}>Chapters</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>13</div>
              <div className={styles.statLabel}>Weeks</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>4</div>
              <div className={styles.statLabel}>Modules</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: '🤖',
      title: 'Embodied Intelligence',
      description: 'Learn how AI transitions from digital environments to physical robots that understand real-world physics.',
    },
    {
      icon: '⚡',
      title: 'Industry Tools',
      description: 'Master ROS 2, NVIDIA Isaac Sim, Gazebo, and Unity - the same tools used by Boston Dynamics and Tesla.',
    },
    {
      icon: '🎯',
      title: 'Hands-On Projects',
      description: 'Build real projects from simulation to deployment, culminating in an autonomous humanoid robot capstone.',
    },
  ];

  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChaptersSection() {
  const chapters = [
    {
      number: '01',
      icon: '🧠',
      title: 'Introduction to Physical AI',
      description: 'Foundations of embodied intelligence, sensor systems, and the humanoid robotics landscape.',
      weeks: 'Weeks 1-2',
      topics: ['Physical AI Concepts', 'Sensor Fusion', 'Robot Platforms'],
    },
    {
      number: '02',
      icon: '🔧',
      title: 'The Robotic Nervous System',
      description: 'Master ROS 2 - nodes, topics, services, and bridging Python AI agents to robot controllers.',
      weeks: 'Weeks 3-5',
      topics: ['ROS 2 Architecture', 'URDF', 'rclpy Python API'],
    },
    {
      number: '03',
      icon: '🌐',
      title: 'The Digital Twin',
      description: 'Simulate physics with Gazebo and Unity. Build high-fidelity virtual environments for testing.',
      weeks: 'Weeks 6-7',
      topics: ['Gazebo Simulation', 'Unity Rendering', 'Sensor Simulation'],
    },
    {
      number: '04',
      icon: '💎',
      title: 'The AI-Robot Brain',
      description: 'NVIDIA Isaac Sim for photorealistic simulation, synthetic data, and hardware-accelerated SLAM.',
      weeks: 'Weeks 8-10',
      topics: ['Isaac Sim', 'VSLAM', 'Nav2 Planning'],
    },
    {
      number: '05',
      icon: '👁️',
      title: 'Vision-Language-Action',
      description: 'Integrate LLMs with robotics. Translate voice commands to robot actions using GPT and Whisper.',
      weeks: 'Weeks 11-12',
      topics: ['Voice-to-Action', 'LLM Planning', 'Multimodal AI'],
    },
    {
      number: '06',
      icon: '🎓',
      title: 'Capstone Project',
      description: 'Build an autonomous humanoid that understands voice, navigates, and manipulates objects.',
      weeks: 'Week 13',
      topics: ['End-to-End Pipeline', 'Integration', 'Deployment'],
    },
  ];

  return (
    <section className={styles.chaptersSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Course Curriculum</h2>
          <p className={styles.sectionSubtitle}>
            A comprehensive 13-week journey from AI fundamentals to autonomous humanoid robots
          </p>
        </div>
        <div className={styles.chaptersGrid}>
          {chapters.map((chapter, idx) => (
            <div key={idx} className={styles.chapterCard}>
              <div className={styles.chapterNumber}>{chapter.number}</div>
              <div className={styles.chapterIcon}>{chapter.icon}</div>
              <div className={styles.chapterContent}>
                <div className={styles.chapterWeeks}>{chapter.weeks}</div>
                <h3 className={styles.chapterTitle}>{chapter.title}</h3>
                <p className={styles.chapterDescription}>{chapter.description}</p>
                <div className={styles.chapterTopics}>
                  {chapter.topics.map((topic, topicIdx) => (
                    <span key={topicIdx} className={styles.topicTag}>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to={idx === 0 ? '/docs/chapter-1-introduction-to-physical-ai' :
                    idx === 1 ? '/docs/chapter-2-basics-of-humanoid-robotics' :
                    idx === 2 ? '/docs/chapter-3-ros-2-fundamentals' :
                    idx === 3 ? '/docs/chapter-4-digital-twin-simulation' :
                    idx === 4 ? '/docs/chapter-5-vision-language-action-systems' :
                    '/docs/chapter-6-capstone-ai-robot-pipeline'}
                className={styles.chapterLink}>
                Read Chapter
                <span className={styles.linkArrow}>→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Ready to Build the Future?</h2>
          <p className={styles.ctaDescription}>
            Start your journey into Physical AI and humanoid robotics today. No prerequisites required.
          </p>
          <Link
            className={clsx('button button--lg', styles.ctaButton)}
            to="/docs/chapter-1-introduction-to-physical-ai">
            Begin Chapter 1
            <span className={styles.buttonArrow}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Physical AI & Humanoid Robotics"
      description="Master ROS 2, NVIDIA Isaac, and Vision-Language-Action models to build intelligent humanoid robots">
      <HomepageHeader />
      <FeaturesSection />
      <ChaptersSection />
      <CTASection />
    </Layout>
  );
}
