# Images for Physical AI & Humanoid Robotics Educational Platform

This directory contains documentation about images for the educational platform homepage. The actual images are located in the parent `static/img/` directory. Here are the images currently used:

## Images Used in Homepage

### Features Section
- `human-meets-robot-stockcake.webp` - Used for Embodied Intelligence feature
- `robot-with-stock-chart.webp` - Used for Industry-Standard Tools feature
- `robot-coding-session-stockcake.webp` - Used for Hands-On Projects feature

### Chapters Section
- `iStock-1184804468-1000x0-c-default.webp` - Used for Chapter 1: Introduction to Physical AI
- `istockphoto-1496920323-612x612.jpg` - Used for Chapter 2: The Robotic Nervous System
- `istockphoto-966248982-612x612.jpg` - Used for Chapter 3: Digital Twin Simulation
- `0_coCX2RBuCrXzsPgp.jpg` - Used for Chapter 4: The AI-Robot Brain
- `360_F_272681855_yaxT3ZJGgOo3AHzNEKOfORe5YznybPCP.jpg` - Used for Chapter 5: Vision-Language-Action
- `robot-with-stock-chart.webp` - Used for Chapter 6: Capstone Project

### CTA Section
- `human-meets-robot-stockcake.webp` - Used for the call-to-action section

## Image Guidelines

### Format
- Use JPEG or WebP formats for photographs
- Use PNG for graphics with transparency
- Use SVG for simple vector graphics

### Size
- Feature images: 800x600 pixels
- Chapter card images: 600x400 pixels
- Small icons: 200x200 pixels

### Quality
- Keep file sizes under 200KB when possible
- Use compression tools to optimize without losing quality
- Ensure images are high resolution but optimized for web

## How to Add New Images

1. Place your new images in the `static/img/` directory
2. Update the `src` attributes in `src/pages/index.tsx` to reference your new images
3. Run `npm run build` to ensure the site builds correctly with your images
4. Test the site locally with `npm run start`

## Recommended Sources for Images

If you need placeholder or stock images, consider these sources:
- Unsplash (https://unsplash.com/)
- Pexels (https://www.pexels.com/)
- Pixabay (https://pixabay.com/)
- Generated images using AI tools like DALL-E or Stable Diffusion

Make sure any images used comply with their respective licenses.