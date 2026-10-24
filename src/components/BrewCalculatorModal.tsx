import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Coffee, Sparkles, Volume2, CheckCircle2, Clock, Droplets, Scale } from 'lucide-react';
import { BREW_GUIDES } from '../data/brewGuides';
import { CoffeeIcon } from './CoffeeIcons';

interface BrewCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrewCalculatorModal: React.FC<BrewCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedGuideId, setSelectedGuideId] = useState(BREW_GUIDES[0].id);
  const guide = BREW_GUIDES.find((g) => g.id === selectedGuideId) || BREW_GUIDES[0];

  const [coffeeGrams, setCoffeeGrams] = useState(guide.defaultCoffeeGrams);
  const [ratio, setRatio] = useState(guide.defaultRatio);

  // Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Update coffee grams & ratio when guide changes
  useEffect(() => {
    setCoffeeGrams(guide.defaultCoffeeGrams);
    setRatio(guide.defaultRatio);
    setTimerRunning(false);
    setSecondsElapsed(0);
  }, [selectedGuideId]);

  // Timer tick
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  if (!isOpen) return null;

  const totalWater = Math.round(coffeeGrams * ratio);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Find active step
  const activeStepIndex = guide.steps.findIndex((st, i) => {
    const nextStep = guide.steps[i + 1];
    if (!nextStep) return true;
    return secondsElapsed >= st.timeSec && secondsElapsed < nextStep.timeSec;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a1411]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#12302a] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e4e8bf] text-[#12302a] flex items-center justify-center font-bold">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black">حاسبة الباريستا ومؤقت الاستخلاص</h2>
              <p className="text-[11px] text-[#e4e8bf]">احسب نسب القهوة للماء وتتبع خطوات الصب بدقة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* Method Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {BREW_GUIDES.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGuideId(g.id)}
                className={`py-2.5 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedGuideId === g.id
                    ? 'bg-[#12302a] text-[#e4e8bf] shadow-sm'
                    : 'bg-[#fafaf8] text-[#6b7680] hover:bg-[#eef5f1] border border-[#e6e8e4]'
                }`}
              >
                <span>{g.title.split(' ')[0]} {g.title.split(' ')[1]}</span>
              </button>
            ))}
          </div>

          {/* Guide Header Info */}
          <div className="bg-[#eef5f1] p-4 rounded-2xl border border-[#d8dea6]/60">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-sm text-[#12302a]">{guide.title}</h3>
              <span className="text-[11px] font-bold bg-[#12302a] text-[#e4e8bf] px-2 py-0.5 rounded-md">
                {guide.method}
              </span>
            </div>
            <p className="text-xs text-[#17191c]/80 leading-relaxed">{guide.description}</p>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#d8dea6]/60 text-center text-[11px]">
              <div>
                <span className="text-[#6b7680] block">درجة الطحن:</span>
                <strong className="text-[#12302a] font-bold">{guide.grindSize}</strong>
              </div>
              <div>
                <span className="text-[#6b7680] block">حرارة الماء:</span>
                <strong className="text-[#12302a] font-bold">{guide.waterTemp}</strong>
              </div>
              <div>
                <span className="text-[#6b7680] block">الوقت المتوقع:</span>
                <strong className="text-[#12302a] font-bold">{guide.brewTime}</strong>
              </div>
            </div>
          </div>

          {/* Calculator Controls (Coffee Grams & Ratio) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#fafaf8] border border-[#e6e8e4] rounded-2xl">
            {/* Coffee grams slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#12302a]">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#1e4c42]" />
                  كمية البن (غرام):
                </span>
                <span className="text-sm font-black text-[#12302a] bg-white px-2 py-0.5 rounded-md border border-[#e6e8e4]">
                  {coffeeGrams} غرام
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="1"
                value={coffeeGrams}
                onChange={(e) => setCoffeeGrams(Number(e.target.value))}
                className="w-full accent-[#12302a] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6b7680]">
                <span>10 غرام (كوب صغير)</span>
                <span>20 غرام (كوبين)</span>
                <span>40 غرام (عائلي)</span>
              </div>
            </div>

            {/* Brew Ratio slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#12302a]">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-[#1e4c42]" />
                  نسبة الاستخلاص (Ratio):
                </span>
                <span className="text-sm font-black text-[#12302a] bg-white px-2 py-0.5 rounded-md border border-[#e6e8e4]">
                  1 : {ratio}
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="18"
                step="1"
                value={ratio}
                onChange={(e) => setRatio(Number(e.target.value))}
                className="w-full accent-[#12302a] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6b7680]">
                <span>1:12 (ثقيل ومركز)</span>
                <span>1:15 (متوازن قياسي)</span>
                <span>1:18 (خفيف وناعم)</span>
              </div>
            </div>
          </div>

          {/* Result Output Big Display */}
          <div className="p-4 rounded-2xl bg-[#12302a] text-white flex items-center justify-between">
            <div>
              <span className="text-xs text-[#e4e8bf] block">إجمالي كمية الماء المطلوبة:</span>
              <span className="text-2xl font-black text-white">{totalWater} مل / غرام</span>
            </div>
            <div className="text-left text-xs text-[#e4e8bf]">
              <div>كوب قهوة مختصة متوازن</div>
              <div className="text-[11px] opacity-80">{coffeeGrams} غرام بن ← {totalWater} مل ماء</div>
            </div>
          </div>

          {/* Live Pour Steps & Interactive Stopwatch Timer */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-black text-[#12302a] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1e4c42]" />
                مؤقت خطوات الصب التفاعلي:
              </h4>

              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-black text-[#12302a] bg-[#fafaf8] border border-[#e6e8e4] px-3 py-1 rounded-xl">
                  {formatTime(secondsElapsed)}
                </span>
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                    timerRunning
                      ? 'bg-amber-500 text-white'
                      : 'bg-[#12302a] text-[#e4e8bf] hover:bg-[#173d35]'
                  }`}
                  aria-label={timerRunning ? 'إيقاف مؤقت' : 'تشغيل المؤقت'}
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setSecondsElapsed(0);
                  }}
                  className="p-2 rounded-xl bg-[#eef5f1] text-[#12302a] hover:bg-[#e4e8bf] transition-colors"
                  aria-label="إعادة ضبط"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Steps list */}
            <div className="space-y-2">
              {guide.steps.map((st, idx) => {
                const targetWaterForThisStep = Math.round(totalWater * st.targetWaterGrams);
                const isCurrent = activeStepIndex === idx && timerRunning;
                const isPassed = secondsElapsed > st.timeSec && !isCurrent;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'border-[#12302a] bg-[#eef5f1] ring-2 ring-[#12302a]/20 shadow-xs'
                        : isPassed
                        ? 'border-[#e6e8e4] bg-[#fafaf8] opacity-75'
                        : 'border-[#e6e8e4] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isCurrent ? 'bg-[#12302a] text-[#e4e8bf]' : 'bg-[#eef5f1] text-[#12302a]'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-[#12302a]">{st.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[#6b7680]">عند {formatTime(st.timeSec)}</span>
                        <span className="bg-[#12302a] text-[#eef5f1] px-2 py-0.5 rounded-md text-[11px]">
                          حتى {targetWaterForThisStep} مل
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#17191c]/80 pr-7">{st.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
