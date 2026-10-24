import { BrewGuide } from '../types';

export const BREW_GUIDES: BrewGuide[] = [
  {
    id: 'v60-4-6',
    title: 'طريقة V60 بطريقة تيتسو كاسويا 4:6',
    method: 'V60 Pour-Over',
    icon: 'dripperset',
    defaultCoffeeGrams: 20,
    defaultRatio: 15, // 20g coffee -> 300g water
    grindSize: 'متوسطة إلى خشنة قليلاً (مثل ملح البحر الخشن)',
    waterTemp: '91°C - 93°C',
    brewTime: '3:30 دقيقة',
    description: 'الطريقة العالمية الأفضل للتحكم بتوازن الحلاوة والحموضة (أول 40% من الماء) وكثافة القوام (آخر 60% من الماء).',
    steps: [
      { timeSec: 0, title: 'الصبة الأولى (الترطيب والتوازن)', targetWaterGrams: 0.2, description: 'صب 60 مل ماء بحركة دائرية هادئة وانتظر 45 ثانية لتفتح النكهات.' },
      { timeSec: 45, title: 'الصبة الثانية (تحديد الحلاوة)', targetWaterGrams: 0.4, description: 'صب حتى يصل المجموع إلى 120 مل لتعزيز سكريات المحصول.' },
      { timeSec: 90, title: 'الصبة الثالثة (بناء القوام)', targetWaterGrams: 0.6, description: 'صب حتى يصل المجموع إلى 180 مل.' },
      { timeSec: 135, title: 'الصبة الرابعة (توازن الاستخلاص)', targetWaterGrams: 0.8, description: 'صب حتى يصل المجموع إلى 240 مل.' },
      { timeSec: 180, title: 'الصبة الخامسة والنهائية', targetWaterGrams: 1.0, description: 'صب حتى يكتمل إجمالي الماء (300 مل) واترك القهوة تترشح بالكامل.' }
    ]
  },
  {
    id: 'v60-standard',
    title: 'طريقة V60 الكلاسيكية (3 صبات)',
    method: 'V60 Classic 3-Pours',
    icon: 'dripperset',
    defaultCoffeeGrams: 15,
    defaultRatio: 16, // 15g coffee -> 240g water
    grindSize: 'متوسطة النعومة',
    waterTemp: '92°C',
    brewTime: '2:45 دقيقة',
    description: 'طريقة متوازنة وسريعة تبرز الإيحاءات الزهرية والفاكهية بوضوح ونقاء عالي.',
    steps: [
      { timeSec: 0, title: 'الترطيب (Blooming)', targetWaterGrams: 0.2, description: 'صب 50 مل ماء وحرك القمع بحركة دائرية لطيفة وانتظر 40 ثانية.' },
      { timeSec: 40, title: 'الصبة الرئيسية الأولى', targetWaterGrams: 0.6, description: 'صب باستمرار بحركات دائرية مركزية حتى 150 مل.' },
      { timeSec: 80, title: 'الصبة النهائية والتثبيت', targetWaterGrams: 1.0, description: 'صب بهدوء حتى 240 مل ثم حرك السيرفر واستمتع بالكوب.' }
    ]
  },
  {
    id: 'aeropress-inverted',
    title: 'أيروبرس بالطريقة المعكوسة (Inverted)',
    method: 'AeroPress Inverted',
    icon: 'aeropress',
    defaultCoffeeGrams: 16,
    defaultRatio: 13, // 16g coffee -> 210g water
    grindSize: 'متوسطة النعومة (أنعم من V60)',
    waterTemp: '88°C - 90°C',
    brewTime: '2:00 دقيقة',
    description: 'قوام ممتلئ، نكهة مركزة، وخالية تماماً من الشوائب أو المرارة الزائدة.',
    steps: [
      { timeSec: 0, title: 'صب الماء بالكامل والتحريك', targetWaterGrams: 1.0, description: 'ضع الأيروبرس بالمقلوب، أضف القهوة وصب 210 مل ماء وحرك بالملعقة 5 مرات.' },
      { timeSec: 30, title: 'تثبيت الغطاء والفلتر', targetWaterGrams: 1.0, description: 'رطب الفلتر الورقي وثبت الغطاء بإحكام على الأداة.' },
      { timeSec: 75, title: 'قلب الأداة فوق الكوب', targetWaterGrams: 1.0, description: 'اقلب الأيروبرس بحذر وثقة فوق الكوب أو السيرفر.' },
      { timeSec: 85, title: 'الضغط البطيء والمنتظم', targetWaterGrams: 1.0, description: 'اضغط المكبس لأسفل ببطء لمدة 30 ثانية حتى تسمع صوت تفريغ الهواء الفحيح.' }
    ]
  },
  {
    id: 'chemex-clean',
    title: 'طريقة كيمكس للترشيح فائق النقاء',
    method: 'Chemex Clean Brew',
    icon: 'server',
    defaultCoffeeGrams: 30,
    defaultRatio: 16, // 30g coffee -> 480g water
    grindSize: 'متوسطة الخشونة',
    waterTemp: '94°C',
    brewTime: '4:00 دقائق',
    description: 'فلتر كيمكس السميك يحجز جميع الزيوت والشوائب ليعطيك أكثر كوب قهوة نقي وشفاف ممكن.',
    steps: [
      { timeSec: 0, title: 'الترطيب الشامل', targetWaterGrams: 0.18, description: 'صب 90 مل ماء لترطيب كامل البن وانتظر 45 ثانية.' },
      { timeSec: 45, title: 'الصبة الأولى الدائرية', targetWaterGrams: 0.55, description: 'صب في المنتصف بحركات لولبية للخارج دون ملامسة جدار الفلتر حتى 260 مل.' },
      { timeSec: 120, title: 'الصبة الثانية الختامية', targetWaterGrams: 1.0, description: 'أكمل الصب حتى 480 مل واترك الترشيح يكتمل بسلاسة.' }
    ]
  }
];
