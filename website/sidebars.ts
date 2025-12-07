import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  textbookSidebar: [
    {
      type: 'doc',
      id: 'chapter-1-introduction-to-physical-ai',
      label: '1. Introduction to Physical AI',
    },
    {
      type: 'doc',
      id: 'chapter-2-basics-of-humanoid-robotics',
      label: '2. Basics of Humanoid Robotics',
    },
    {
      type: 'doc',
      id: 'chapter-3-ros-2-fundamentals',
      label: '3. ROS 2 Fundamentals',
    },
    {
      type: 'doc',
      id: 'chapter-4-digital-twin-simulation',
      label: '4. Digital Twin Simulation',
    },
    {
      type: 'doc',
      id: 'chapter-5-vision-language-action-systems',
      label: '5. Vision-Language-Action (VLA)',
    },
    {
      type: 'doc',
      id: 'chapter-6-capstone-ai-robot-pipeline',
      label: '6. Capstone Project',
    },
  ],
};

export default sidebars;
