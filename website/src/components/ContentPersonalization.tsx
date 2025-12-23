import React, { useState, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useAuth } from '@site/src/contexts/AuthContext';
import Personalization from './Personalization';
import Translation from './Translation';

interface ContentPersonalizationProps {
  chapterTitle: string;
  sectionTitle?: string;
  children: string; // The content to be personalized and/or translated
}

const ContentPersonalization: React.FC<ContentPersonalizationProps> = ({ 
  chapterTitle, 
  sectionTitle,
  children 
}) => {
  const { user, isAuthenticated } = useAuth();
  const [processedContent, setProcessedContent] = useState(children);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [originalContent] = useState(children);

  // Apply personalization to content
  const applyPersonalization = (content: string): string => {
    if (!isAuthenticated || !user?.profile || !isPersonalized) {
      return content;
    }

    const { softwareBackground, programmingLanguages, roboticsExperience, hardwareAccess } = user.profile;
    
    // Apply different modifications based on user's software background
    switch (softwareBackground) {
      case 'beginner':
        // Add more explanations and simpler language for beginners
        return content
          .replace(/\*\*Technical Detail\*\*[^]*?\n\n/g, '') // Remove advanced sections
          .replace(/(For advanced users:)[^]*?(?=\n\n|$)/g, '') // Remove advanced notes
          .replace(/([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g, (match) => `**${match}** (explained simply: ${match.toLowerCase()})`); // Add simple explanations

      case 'intermediate':
        // Provide balanced content for intermediate users
        return content
          .replace(/\*\*Simplified Explanation\*\*/g, '**Detailed Explanation**') // Enhance explanations
          .replace(/([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g, (match) => `**${match}** (implementation detail: ${match.toLowerCase()} can be implemented using...)`); // Add implementation details

      case 'advanced':
        // Add technical depth and implementation details for advanced users
        return content
          .replace(/\*\*Basic Overview\*\*/g, '**Technical Implementation**') // More technical
          .replace(/([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g, (match) => `**${match}** (advanced implementation: ${match.toLowerCase()} can be optimized using...)`); // Add optimization details

      default:
        return content;
    }
  };

  // Apply translation to content
  const applyTranslation = (content: string): string => {
    if (!isTranslated) {
      return content;
    }

    // In a real implementation, this would call a translation API
    // For now, we'll do a basic term translation
    return content
      .replace(/\bPhysical AI\b/g, 'فزیکل اے آئی')
      .replace(/\bHumanoid\b/g, 'ہیومنوائڈ')
      .replace(/\bRobotics\b/g, 'روبوٹکس')
      .replace(/\bIntroduction\b/g, 'تعارف')
      .replace(/\bChapter\b/g, 'باب')
      .replace(/\blearning\b/g, 'سیکھنا')
      .replace(/\bartificial intelligence\b/g, 'مصنوعی ذہانت')
      .replace(/\bembodied intelligence\b/g, 'جسد یافتہ ذہانت')
      .replace(/\bsensors\b/g, 'سینسرز')
      .replace(/\bactuators\b/g, 'ایکچوایٹرز')
      .replace(/\bperceive\b/g, 'ادراک کرنا')
      .replace(/\breason\b/g, 'استدلال')
      .replace(/\bact\b/g, 'عمل کرنا')
      .replace(/\breal-world\b/g, 'حقیقی دنیا')
      .replace(/\benvironment\b/g, 'ماحول')
      .replace(/\bsystems\b/g, 'سسٹمز')
      .replace(/\bunderstand\b/g, 'سمجھنا')
      .replace(/\bphysics\b/g, 'طبیعیات')
      .replace(/\bgravity\b/g, 'گریویٹی')
      .replace(/\bcollision\b/g, 'ٹکر')
      .replace(/\bmomentum\b/g, 'رخدار')
      .replace(/\bfriction\b/g, 'احکام')
      .replace(/\bnavigation\b/g, 'نیویگیشن')
      .replace(/\bobstacle\b/g, 'رکاوٹ')
      .replace(/\bdetection\b/g, 'شناخت')
      .replace(/\bmanipulation\b/g, 'ہیرا پھیری')
      .replace(/\bgrasping\b/g, 'تھامنا')
      .replace(/\bcontrol\b/g, 'کنٹرول')
      .replace(/\balgorithms\b/g, 'الگورتھم')
      .replace(/\bsimulation\b/g, 'سیمیولیشن')
      .replace(/\breal\b/g, 'حقیقی')
      .replace(/\bhardware\b/g, 'ہارڈ ویئر')
      .replace(/\bsoftware\b/g, 'سافٹ ویئر')
      .replace(/\bdevelopment\b/g, 'ڈیولپمنٹ')
      .replace(/\bplatform\b/g, 'پلیٹ فارم')
      .replace(/\bresearch\b/g, 'تحقیق')
      .replace(/\bcommercial\b/g, 'تجارتی')
      .replace(/\beducation\b/g, 'تعلیم')
      .replace(/\bindustry\b/g, 'صنعت')
      .replace(/\bhuman-centered\b/g, 'انسان مرکزی')
      .replace(/\binteraction\b/g, 'تعامل')
      .replace(/\bversatility\b/g, 'تنوع')
      .replace(/\btraining\b/g, 'تربیت')
      .replace(/\bdata\b/g, 'ڈیٹا')
      .replace(/\bsensor\b/g, 'سینسر')
      .replace(/\bfusion\b/g, 'فیوژن')
      .replace(/\bmultimodal\b/g, 'ملٹی ماڈل')
      .replace(/\bperception\b/g, 'ادراک')
      .replace(/\bcomputer vision\b/g, 'کمپیوٹر وژن')
      .replace(/\bmachine learning\b/g, 'مشین لرننگ')
      .replace(/\bdeep learning\b/g, 'ڈیپ لرننگ')
      .replace(/\bneural networks\b/g, 'نیورل نیٹ ورکس')
      .replace(/\breinforcement learning\b/g, 'رین فورسمنٹ لرننگ')
      .replace(/\bnatural language processing\b/g, 'قدرتی زبان کی پروسیسنگ')
      .replace(/\bvision-language-action\b/g, 'وژن-زبان-ایکشن')
      .replace(/\bROS\b/g, 'آر او ایس')
      .replace(/\bRobot Operating System\b/g, 'روبوٹ آپریٹنگ سسٹم')
      .replace(/\bNVIDIA Isaac Sim\b/g, 'این وی ڈی ائی اسحاق سیم')
      .replace(/\bGazebo\b/g, 'گیزیبو')
      .replace(/\bUnity\b/g, 'یونٹی')
      .replace(/\bLiDAR\b/g, 'لائی ڈار')
      .replace(/\bIMU\b/g, 'آئی ایم یو')
      .replace(/\bInertial Measurement Unit\b/g, 'انرٹیل میزرمینٹ یونٹ')
      .replace(/\bIntel RealSense\b/g, 'انٹیل ریل سینس')
      .replace(/\bDepth Camera\b/g, 'گہرائی کیمرہ')
      .replace(/\bRGB Camera\b/g, 'آر جی بی کیمرہ')
      .replace(/\bBoston Dynamics\b/g, 'بوسٹن ڈائی نامکس')
      .replace(/\bTesla Optimus\b/g, 'ٹیسلا آپٹیمس')
      .replace(/\bUnitree\b/g, 'یونی ٹری')
      .replace(/\bAtlas\b/g, 'اٹلس')
      .replace(/\bH1\b/g, 'ایچ 1')
      .replace(/\bGo2 Edu\b/g, 'گو 2 ایجو')
      .replace(/\bJetson\b/g, 'جیٹسن')
      .replace(/\bOrin\b/g, 'اورن')
      .replace(/\bRTX\b/g, 'آر ٹی ایکس')
      .replace(/\bVRAM\b/g, 'وی ریم')
      .replace(/\bSLAM\b/g, 'ایس ایل اے ایم')
      .replace(/\bVSLAM\b/g, 'وی ایس ایل اے ایم');
  };

  // Update content when personalization or translation changes
  useEffect(() => {
    let content = originalContent;
    
    // Apply personalization first
    if (isPersonalized) {
      content = applyPersonalization(content);
    }
    
    // Then apply translation
    if (isTranslated) {
      content = applyTranslation(content);
    }
    
    setProcessedContent(content);
  }, [isPersonalized, isTranslated, originalContent, user, isAuthenticated]);

  const togglePersonalization = () => {
    setIsPersonalized(!isPersonalized);
  };

  const toggleTranslation = () => {
    setIsTranslated(!isTranslated);
  };

  if (!isAuthenticated) {
    return (
      <div className="content-personalization-container">
        <div className="alert alert--info margin-bottom--md" role="alert">
          Sign in to enable personalized content and Urdu translation.
        </div>
        <div>{originalContent}</div>
      </div>
    );
  }

  return (
    <div className="content-personalization-container">
      <div className="personalization-translation-controls margin-bottom--md">
        <div className="button-group button-group--block">
          <button
            className={`button ${isPersonalized ? 'button--primary' : 'button--secondary'} margin-right--sm`}
            onClick={togglePersonalization}
          >
            {isPersonalized ? 'Disable Personalization' : 'Personalize Content'}
          </button>
          <button
            className={`button ${isTranslated ? 'button--primary' : 'button--secondary'}`}
            onClick={toggleTranslation}
          >
            {isTranslated ? 'Switch to English' : 'Translate to Urdu'}
          </button>
        </div>
        
        {user?.profile && (
          <div className="alert alert--success margin-top--sm" role="alert">
            <small>
              <strong>Profile:</strong> {user.profile.softwareBackground} background, 
              {user.profile.programmingLanguages?.length > 0 && ` knows ${user.profile.programmingLanguages.join(', ')}`}
            </small>
          </div>
        )}
      </div>
      
      <div className="personalized-content">
        {processedContent.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
};

const ContentPersonalizationWrapper: React.FC<ContentPersonalizationProps> = (props) => {
  return (
    <BrowserOnly fallback={<div>Loading personalized content...</div>}>
      {() => <ContentPersonalization {...props} />}
    </BrowserOnly>
  );
};

export default ContentPersonalizationWrapper;