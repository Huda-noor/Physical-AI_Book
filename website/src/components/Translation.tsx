import React, { useState, useEffect } from 'react';
import { useAuth } from '@site/src/contexts/AuthContext';

interface TranslationProps {
  chapterTitle: string;
  content: string;
  onContentChange: (content: string) => void;
}

const Translation: React.FC<TranslationProps> = ({ chapterTitle, content, onContentChange }) => {
  const { isAuthenticated } = useAuth();
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedContent, setTranslatedContent] = useState(content);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isTranslated) {
      translateContent();
    } else {
      setTranslatedContent(content);
      onContentChange(content);
    }
  }, [isTranslated]);

  const translateContent = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, this would call a translation API
      // For now, we'll simulate the translation with a basic replacement
      // This is just a placeholder - a real implementation would use an API like Google Translate
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demonstration, translate key terms to Urdu
      let urduContent = content;
      
      // Basic term translations
      urduContent = urduContent
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
      
      setTranslatedContent(urduContent);
      onContentChange(urduContent);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedContent(content);
      onContentChange(content);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="alert alert--warning margin-bottom--md" role="alert">
        Sign in to enable Urdu translation.
      </div>
    );
  }

  return (
    <div className="translation-controls margin-bottom--md">
      <div className="button-group button-group--block">
        <button
          className={`button ${isTranslated ? 'button--primary' : 'button--secondary'}`}
          onClick={() => setIsTranslated(!isTranslated)}
          disabled={loading}
        >
          {loading ? 'Translating...' : (isTranslated ? 'Switch to English' : 'Translate to Urdu')}
        </button>
      </div>
    </div>
  );
};

export default Translation;