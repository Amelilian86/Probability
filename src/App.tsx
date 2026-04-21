/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Play, 
  Info,
  Layers,
  CircleDot,
  MousePointer2
} from 'lucide-react';

// --- Types ---

type BallType = 'A_ONLY' | 'B_ONLY' | 'INTERSECTION' | 'NEUTRAL';

interface BallData {
  id: string;
  type: BallType;
  x: number; // percentage of container width
  y: number; // percentage of container height
  label: string;
  inA: boolean;
  inB: boolean;
}

enum TeachingStep {
  SAMPLE_SPACE = 0,
  EVENT_A = 1,
  EVENT_B = 2,
  INTERSECTION = 3,
  CONDITIONAL_BA = 4,   // P(B|A)
  CONDITIONAL_AB = 5,   // P(A|B)
  PATH_A_1 = 6,         // Start from A: Step 1
  PATH_A_2 = 7,         // Start from A: Step 2
  PATH_A_3 = 8,         // Start from A: Result
  PATH_B_1 = 9,         // Start from B: Step 1
  PATH_B_2 = 10,        // Start from B: Step 2
  PATH_B_3 = 11,        // Start from B: Result
  SUMMARY = 12          // Final Summary
}

// --- Constants & Data ---

const BALLS: BallData[] = [
  // 3 Pure Red Balls (A-only)
  { id: 'R1', type: 'A_ONLY', x: 26, y: 38, label: 'R1', inA: true, inB: false },
  { id: 'R2', type: 'A_ONLY', x: 20, y: 55, label: 'R2', inA: true, inB: false },
  { id: 'R3', type: 'A_ONLY', x: 28, y: 70, label: 'R3', inA: true, inB: false },
  
  // 2 Red-Blue Balls (Intersection)
  { id: 'RB1', type: 'INTERSECTION', x: 48, y: 44, label: 'RB1', inA: true, inB: true },
  { id: 'RB2', type: 'INTERSECTION', x: 48, y: 64, label: 'RB2', inA: true, inB: true },
  
  // 2 Pure Blue Balls (B-only)
  { id: 'B1', type: 'B_ONLY', x: 70, y: 40, label: 'B1', inA: false, inB: true },
  { id: 'B2', type: 'B_ONLY', x: 74, y: 60, label: 'B2', inA: false, inB: true },
  
  // 3 Neutral Balls
  { id: 'N1', type: 'NEUTRAL', x: 85, y: 12, label: 'N1', inA: false, inB: false },
  { id: 'N2', type: 'NEUTRAL', x: 12, y: 15, label: 'N2', inA: false, inB: false },
  { id: 'N3', type: 'NEUTRAL', x: 8, y: 85, label: 'N3', inA: false, inB: false },
];

export default function App() {
  const [step, setStep] = useState<TeachingStep>(TeachingStep.SAMPLE_SPACE);
  const [selectedBall, setSelectedBall] = useState<BallData | null>(null);

  const handleNext = () => {
    if (step < TeachingStep.SUMMARY) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > TeachingStep.SAMPLE_SPACE) setStep(step - 1);
  };

  const handleReset = () => {
    setStep(TeachingStep.SAMPLE_SPACE);
    setSelectedBall(null);
  };

  // --- Step Content ---
  const stepInfo = useMemo(() => {
    switch (step) {
      case TeachingStep.SAMPLE_SPACE:
        return {
          title: "样本空间 / Sample Space",
          math: "|S| = 10",
          desc: "样本空间 S 表示所有可能结果的集合。在本例中共有 10 个球。"
        };
      case TeachingStep.EVENT_A:
        return {
          title: "事件 A / Event A",
          math: "P(A) = \\frac{5}{10} = 0.5",
          desc: "事件 A 表示抽到属于红色事件的球。集合 A 中共有 5 个球。"
        };
      case TeachingStep.EVENT_B:
        return {
          title: "事件 B / Event B",
          math: "P(B) = \\frac{4}{10} = 0.4",
          desc: "事件 B 表示抽到属于蓝色事件的球。集合 B 中共有 4 个球。"
        };
      case TeachingStep.INTERSECTION:
        return {
          title: "交集 / Intersection (A ∩ B)",
          math: "P(A \\cap B) = \\frac{2}{10} = 0.2",
          desc: "交集表示同时属于事件 A 和事件 B 的结果。图中共有 2 个半红半蓝球。"
        };
      case TeachingStep.CONDITIONAL_BA:
        return {
          title: "条件概率 / P(B|A)",
          math: "P(B|A) = \\frac{|A \\cap B|}{|A|} = \\frac{2}{5}",
          desc: "在 A 发生的条件下，观察 B 的发生概率。分母变为 A 的元素个数。"
        };
      case TeachingStep.CONDITIONAL_AB:
        return {
          title: "条件概率 / P(A|B)",
          math: "P(A|B) = \\frac{|A \\cap B|}{|B|} = \\frac{2}{4}",
          desc: "在 B 发生的条件下，观察 A 的发生概率。分母变为 B 的元素个数。"
        };
      case TeachingStep.PATH_A_1:
      case TeachingStep.PATH_A_2:
      case TeachingStep.PATH_A_3:
        return {
          title: "路径 A / Path from A",
          math: "P(A \\cap B) = P(A) \\times P(B|A)",
          desc: "从事件 A 出发推导交集概率。"
        };
      case TeachingStep.PATH_B_1:
      case TeachingStep.PATH_B_2:
      case TeachingStep.PATH_B_3:
        return {
          title: "路径 B / Path from B",
          math: "P(A \\cap B) = P(B) \\times P(A|B)",
          desc: "从事件 B 出发推导交集概率。"
        };
      case TeachingStep.SUMMARY:
        return {
          title: "最终总结 / Final Summary",
          math: "P(A \\cap B) = P(A)P(B|A) = P(B)P(A|B)",
          desc: "无论从哪个事件出发，最终得到的交集概率结果都是一致的。"
        };
      default: return null;
    }
  }, [step]);

  return (
    <div className="h-screen w-full grid grid-cols-[1fr_360px] grid-rows-[56px_1fr_90px] bg-natural-divider gap-px overflow-hidden select-none">
      {/* Header */}
      <header className="col-span-2 bg-white flex items-center px-8 border-b border-natural-border justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-natural-text">概率乘法法则可视化教学</h1>
          <span className="text-[#8e8a82] text-xs font-semibold uppercase tracking-wider bg-natural-accent px-2 py-0.5 rounded border border-natural-divider">
            Multiplication Rule
          </span>
        </div>
      </header>

      {/* Main Stage */}
      <main className="bg-natural-bg relative flex justify-center items-center overflow-hidden h-full p-8">
        <div className="relative w-full max-w-[800px] aspect-[4/3] border-2 border-dashed border-natural-border rounded-2xl bg-white/40 shadow-inner">
          {/* S Mark */}
          <div className="absolute top-4 left-6 flex items-center gap-2">
            <span className="font-serif italic font-bold text-2xl text-[#A8A297]">S</span>
            <span className="text-[#A8A297] text-xs font-bold border-l border-[#D1CDC2] pl-2 uppercase tracking-tight">样本空间 / Sample Space</span>
          </div>

          {/* Venn Diagram */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-12">
            <svg viewBox="0 0 800 600" className="w-full h-full">
              <motion.circle 
                cx="300" cy="300" r="220" 
                initial={false}
                animate={{ 
                  fill: (step === TeachingStep.CONDITIONAL_BA || step === TeachingStep.PATH_A_1 || step === TeachingStep.PATH_A_2 || step === TeachingStep.PATH_B_2) ? "rgba(230, 106, 92, 0.12)" : (step === TeachingStep.PATH_A_3 || step === TeachingStep.PATH_B_3 || step === TeachingStep.SUMMARY ? "rgba(230, 106, 92, 0.05)" : "rgba(230, 106, 92, 0.03)"),
                  stroke: (step === TeachingStep.EVENT_A || step === TeachingStep.CONDITIONAL_BA || step === TeachingStep.CONDITIONAL_AB || (step >= TeachingStep.PATH_A_1 && step <= TeachingStep.PATH_A_3) || step === TeachingStep.PATH_B_2 || step === TeachingStep.SUMMARY) ? (step === TeachingStep.PATH_A_3 || step === TeachingStep.PATH_B_3 || step === TeachingStep.SUMMARY ? "rgba(230, 106, 92, 0.3)" : "#E66A5C") : "rgba(209, 205, 194, 0.4)",
                  strokeWidth: (step === TeachingStep.PATH_A_3 || step === TeachingStep.PATH_B_3 || step === TeachingStep.SUMMARY) ? 1.5 : ((step === TeachingStep.EVENT_A || step === TeachingStep.CONDITIONAL_BA || step >= TeachingStep.PATH_A_1) ? 3 : 2),
                  strokeDasharray: (step === TeachingStep.EVENT_A || step === TeachingStep.CONDITIONAL_BA || step >= TeachingStep.PATH_A_1) ? "0" : "5 5"
                }}
              />
              {/* Intersection Highlight Background */}
              <AnimatePresence>
                {(step === TeachingStep.PATH_A_3 || step === TeachingStep.PATH_B_3 || step === TeachingStep.SUMMARY) && (
                  <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    d="M 400,105 A 220,220 0 0 1 400,495 A 220,220 0 0 1 400,105"
                    fill="rgba(61, 57, 53, 0.08)"
                    stroke="#313131"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                )}
              </AnimatePresence>
              <motion.text 
                x="150" y="70" 
                className="text-xl font-bold fill-prob-red"
                animate={{ opacity: (step === TeachingStep.EVENT_A || step === TeachingStep.CONDITIONAL_BA || (step >= TeachingStep.PATH_A_1 && step <= TeachingStep.PATH_A_3) || step === TeachingStep.SUMMARY || step === TeachingStep.SAMPLE_SPACE) ? 1 : 0.3 }}
              >
                事件 A / Event A
              </motion.text>

              {/* Event B */}
              <motion.circle 
                cx="500" cy="300" r="220" 
                initial={false}
                animate={{ 
                  fill: (step === TeachingStep.CONDITIONAL_AB || step === TeachingStep.PATH_B_1 || step === TeachingStep.PATH_B_2 || step === TeachingStep.PATH_A_2) ? "rgba(92, 148, 230, 0.12)" : "rgba(92, 148, 230, 0.03)",
                  stroke: (step === TeachingStep.EVENT_B || step === TeachingStep.CONDITIONAL_AB || (step >= TeachingStep.PATH_B_1 && step <= TeachingStep.PATH_B_3) || step === TeachingStep.PATH_A_2 || step === TeachingStep.SUMMARY) ? (step === TeachingStep.PATH_A_3 || step === TeachingStep.PATH_B_3 || step === TeachingStep.SUMMARY ? "rgba(92, 148, 230, 0.3)" : "#5C94E6") : "rgba(209, 205, 194, 0.4)",
                  strokeWidth: (step === TeachingStep.EVENT_B || step === TeachingStep.CONDITIONAL_AB || step >= TeachingStep.PATH_B_1) ? 3 : 2,
                  strokeDasharray: (step === TeachingStep.EVENT_B || step === TeachingStep.CONDITIONAL_AB || step >= TeachingStep.PATH_B_1) ? "0" : "5 5",
                  opacity: (step === TeachingStep.CONDITIONAL_BA || step === TeachingStep.PATH_A_1 || step === TeachingStep.PATH_A_2) ? 0.2 : 1
                }}
              />
              <motion.text 
                x="650" y="70" 
                textAnchor="end"
                className="text-xl font-bold fill-prob-blue"
                animate={{ 
                  opacity: (step === TeachingStep.EVENT_B || step === TeachingStep.PATH_B_1 || step === TeachingStep.SAMPLE_SPACE || step === TeachingStep.SUMMARY) ? 1 : 0.3,
                  display: (step === TeachingStep.CONDITIONAL_BA || step === TeachingStep.PATH_A_1 || step === TeachingStep.PATH_A_2) ? 'none' : 'block'
                }}
              >
                事件 B / Event B
              </motion.text>
            </svg>
          </div>

          {/* Floating Rule Step Labels */}
          <AnimatePresence mode="wait">
            {(step === TeachingStep.PATH_A_1) && (
              <motion.div key="apath1" initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0}} className="absolute top-[20%] left-[24%] bg-prob-red text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg z-50 border border-white/20">
                1. 事件 A: 5/10
              </motion.div>
            )}
            {(step === TeachingStep.PATH_A_2) && (
              <motion.div key="apath2" initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0}} className="absolute top-[22%] left-[43%] bg-prob-blue text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg z-50 border border-white/20">
                2. B | A: 2/5
              </motion.div>
            )}
            {(step === TeachingStep.PATH_A_3 || step === TeachingStep.SUMMARY) && (
              <motion.div key="apath3" initial={{opacity:0, scale:0.8, y: 10}} animate={{opacity:1, scale:1, y: 0}} exit={{opacity:0}} className="absolute top-[52%] left-[40.5%] translate-x-[-50%] bg-[#313131] text-white text-[11px] font-bold px-4 py-1.5 rounded-lg shadow-2xl z-50 border border-white/20 flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-white/70 uppercase">路径A结果 / Path A</span>
                <span>A ∩ B: 2/10</span>
              </motion.div>
            )}
            
            {(step === TeachingStep.PATH_B_1) && (
              <motion.div key="bpath1" initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0}} className="absolute top-[20%] left-[55%] bg-prob-blue text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg z-50 border border-white/20">
                1. 事件 B: 4/10
              </motion.div>
            )}
            {(step === TeachingStep.PATH_B_2) && (
              <motion.div key="bpath2" initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0}} className="absolute top-[22%] left-[43%] bg-prob-red text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg z-50 border border-white/20">
                2. A | B: 2/4
              </motion.div>
            )}
            {(step === TeachingStep.PATH_B_3) && (
              <motion.div key="bpath3" initial={{opacity:0, scale:0.8, y: 10}} animate={{opacity:1, scale:1, y: 0}} exit={{opacity:0}} className="absolute top-[52%] left-[40.5%] translate-x-[-50%] bg-[#313131] text-white text-[11px] font-bold px-4 py-1.5 rounded-lg shadow-2xl z-50 border border-white/20 flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-white/70 uppercase">路径B结果 / Path B</span>
                <span>A ∩ B: 2/10</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Balls */}
          <div className="absolute inset-0 p-12">
            {BALLS.map((ball) => {
              const ballLogic = (() => {
                switch (step) {
                  case TeachingStep.SAMPLE_SPACE: return { active: true, hidden: false, focal: false };
                  case TeachingStep.EVENT_A: return { active: ball.inA, hidden: false, focal: false };
                  case TeachingStep.EVENT_B: return { active: ball.inB, hidden: false, focal: false };
                  case TeachingStep.INTERSECTION: return { active: ball.inA && ball.inB, hidden: false, focal: false };
                  case TeachingStep.CONDITIONAL_BA: return { active: ball.inA, hidden: !ball.inA, focal: ball.inA && ball.inB };
                  case TeachingStep.CONDITIONAL_AB: return { active: ball.inB, hidden: !ball.inB, focal: ball.inA && ball.inB };
                  // Derivation Path A
                  case TeachingStep.PATH_A_1: return { active: ball.inA, hidden: false, focal: false };
                  case TeachingStep.PATH_A_2: return { active: ball.inA, hidden: !ball.inA, focal: ball.inA && ball.inB };
                  case TeachingStep.PATH_A_3: 
                    if (ball.inA && ball.inB) return { active: true, hidden: false, focal: true };
                    return { active: false, hidden: false, focal: false, extraDimmed: true };
                  // Derivation Path B
                  case TeachingStep.PATH_B_1: return { active: ball.inB, hidden: false, focal: false };
                  case TeachingStep.PATH_B_2: return { active: ball.inB, hidden: !ball.inB, focal: ball.inA && ball.inB };
                  case TeachingStep.PATH_B_3: 
                    if (ball.inA && ball.inB) return { active: true, hidden: false, focal: true };
                    return { active: false, hidden: false, focal: false, extraDimmed: true };
                  case TeachingStep.SUMMARY:
                    if (ball.inA && ball.inB) return { active: true, hidden: false, focal: true };
                    return { active: false, hidden: false, focal: false, extraDimmed: true };
                  default: return { active: true, hidden: false, focal: false };
                }
              })();

              return (
                <motion.div
                  key={ball.id}
                  layoutId={ball.id}
                  className="absolute cursor-pointer"
                  style={{ left: `${ball.x}%`, top: `${ball.y}%` }}
                  initial={false}
                  animate={{
                    opacity: ballLogic.hidden ? 0 : (ballLogic.active ? 1 : (ballLogic.extraDimmed ? 0.05 : 0.15)),
                    scale: ballLogic.focal ? 1.4 : 1,
                    zIndex: ballLogic.focal ? 100 : 20,
                    y: (ballLogic.focal && (step === TeachingStep.PATH_A_3 || step === TeachingStep.PATH_B_3 || step === TeachingStep.SUMMARY)) ? [0, -8, 0] : [0, -4, 0]
                  }}
                  transition={{
                    opacity: { duration: 0.4 },
                    scale: { type: 'spring', stiffness: 300, damping: 20 },
                    y: { 
                      duration: ballLogic.focal ? 2 : (3 + Math.random() * 2), 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }
                  }}
                  whileHover={{ scale: 1.15 }}
                  onClick={() => setSelectedBall(ball)}
                >
                  <BallVisual type={ball.type} label={ball.id} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Sidebar - Re-styled as Derivation Steps */}
      <aside className="bg-white p-7 border-l border-natural-border flex flex-col gap-6 overflow-y-auto">
        <div className="flex flex-col gap-4 flex-grow">
          <div>
            <h3 className="text-sm font-bold text-[#7A746B] uppercase tracking-widest italic mb-4">核心推导 / Core Derivation</h3>
            
            <div className="space-y-2 overflow-y-auto max-h-[350px] pr-1 custom-scrollbar">
              {/* Path A Toggle Group */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[#A09B93] px-1 italic">路径 A：从事件 A 出发</p>
                <motion.div 
                  animate={{ 
                    opacity: (step >= TeachingStep.PATH_A_1 && step <= TeachingStep.PATH_A_3) || step === TeachingStep.EVENT_A || step === TeachingStep.CONDITIONAL_BA || step === TeachingStep.SUMMARY ? 1 : 0.3,
                    borderColor: (step >= TeachingStep.PATH_A_1 && step <= TeachingStep.PATH_A_3) ? '#E66A5C' : '#E5E1D8',
                    backgroundColor: (step >= TeachingStep.PATH_A_1 && step <= TeachingStep.PATH_A_3) ? '#FFFCFA' : '#F9F8F6'
                  }}
                  className="p-3 rounded-xl border border-natural-divider space-y-2"
                >
                  <div className="flex justify-between items-center text-[10px] text-prob-red font-bold underline decoration-1 underline-offset-2">
                    <span>P(A) = 0.5</span>
                    <span>P(B|A) = 0.4</span>
                  </div>
                  <div className="flex flex-col items-center font-serif text-[#3D3935] py-1 border-t border-natural-divider/50 mt-1">
                    <div className="scale-90"><InlineMath math="P(A \cap B) = P(A) \times P(B|A)" /></div>
                    {step >= TeachingStep.PATH_A_2 && <div className="scale-90"><InlineMath math="= \frac{5}{10} \times \frac{2}{5} = 0.2" /></div>}
                  </div>
                </motion.div>
              </div>

              {/* Path B Toggle Group */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[#A09B93] px-1 italic">路径 B：从事件 B 出发</p>
                <motion.div 
                  animate={{ 
                    opacity: (step >= TeachingStep.PATH_B_1 && step <= TeachingStep.PATH_B_3) || step === TeachingStep.EVENT_B || step === TeachingStep.CONDITIONAL_AB || step === TeachingStep.SUMMARY ? 1 : 0.3,
                    borderColor: (step >= TeachingStep.PATH_B_1 && step <= TeachingStep.PATH_B_3) ? '#5C94E6' : '#E5E1D8',
                    backgroundColor: (step >= TeachingStep.PATH_B_1 && step <= TeachingStep.PATH_B_3) ? '#F8FAFF' : '#F9F8F6'
                  }}
                  className="p-3 rounded-xl border border-natural-divider space-y-2"
                >
                  <div className="flex justify-between items-center text-[10px] text-prob-blue font-bold underline decoration-1 underline-offset-2">
                    <span>P(B) = 0.4</span>
                    <span>P(A|B) = 0.5</span>
                  </div>
                  <div className="flex flex-col items-center font-serif text-[#3D3935] py-1 border-t border-natural-divider/50 mt-1">
                     <div className="scale-90"><InlineMath math="P(A \cap B) = P(B) \times P(A|B)" /></div>
                     {step >= TeachingStep.PATH_B_2 && <div className="scale-90"><InlineMath math="= \frac{4}{10} \times \frac{2}{4} = 0.2" /></div>}
                  </div>
                </motion.div>
              </div>

              {/* Final Equality Block */}
              {step === TeachingStep.SUMMARY && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl border-2 border-natural-text bg-white shadow-lg space-y-2"
                >
                   <p className="text-[9px] font-bold text-natural-text uppercase text-center bg-natural-accent py-0.5 rounded">最终等式 / Equivalence</p>
                   <div className="text-center py-2">
                     <BlockMath math="P(A)P(B|A) = P(B)P(A|B)" />
                   </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-[#7A746B] uppercase tracking-wider underline decoration-natural-divider underline-offset-4 decoration-2">教学说明 / Explanation</h3>
            <p className="text-sm text-[#5D5954] leading-relaxed">
              {step === TeachingStep.PATH_A_1 && "路径 A - Step 1: 先进入 A，概率为 5/10。"}
              {step === TeachingStep.PATH_A_2 && "路径 A - Step 2: 在 A 的 5 个球中寻找属于 B 的 2 个。"}
              {step === TeachingStep.PATH_B_1 && "路径 B - Step 1: 先观察 B，概率为 4/10。"}
              {step === TeachingStep.PATH_B_2 && "路径 B - Step 2: 在 B 的 4 个球中确认同时也属于 A 的 2 个。"}
              {step === TeachingStep.SUMMARY && "结论：两条推导路径虽然出发点不同，但最终揭示的是同一个交集概率结果。"}
              {(step < TeachingStep.PATH_A_1 || step === TeachingStep.PATH_A_3 || step === TeachingStep.PATH_B_3) && stepInfo?.desc}
            </p>
          </div>
        </div>

        <div className="border-t border-natural-divider pt-6 sticky bottom-0 bg-white">
          <h3 className="text-[11px] font-bold text-[#ACA79E] uppercase mb-3 flex items-center gap-2">
            <CircleDot className="w-3 h-3" /> 球体信息 / Ball Info
          </h3>
          {selectedBall ? (
            <div className="bg-natural-accent/50 p-4 rounded-xl border border-natural-divider space-y-2 text-[13px]">
              <div className="flex justify-between border-b border-natural-border/40 pb-1.5">
                <span className="text-[#89857d]">编号 / ID</span>
                <span className="font-bold">{selectedBall.id}</span>
              </div>
              <div className="flex justify-between border-b border-natural-border/40 pb-1.5">
                <span className="text-[#89857d]">类型 / Type</span>
                <span className="font-bold">{getTypeName(selectedBall.type).split('/')[0]}</span>
              </div>
              <div className="flex justify-between border-b border-natural-border/40 pb-1.5">
                <span className="text-[#89857d]">属于 A / In A</span>
                <span className={`font-bold ${selectedBall.inA ? 'text-prob-red' : ''}`}>{selectedBall.inA ? '是 / Yes' : '否 / No'}</span>
              </div>
              <div className="flex justify-between border-b border-natural-border/40 pb-1.5">
                <span className="text-[#89857d]">属于 B / In B</span>
                <span className={`font-bold ${selectedBall.inB ? 'text-prob-blue' : ''}`}>{selectedBall.inB ? '是 / Yes' : '否 / No'}</span>
              </div>
            </div>
          ) : (
            <div className="h-28 flex items-center justify-center bg-slate-50/50 border border-dashed border-natural-divider rounded-xl">
              <p className="text-[11px] text-[#A8A297] italic">点击球体查看详细属性</p>
            </div>
          )}
        </div>
      </aside>

      {/* Controls Container */}
      <footer className="col-span-2 bg-white flex flex-col items-center justify-center border-t border-natural-border px-10 gap-2">
        {/* Step Actions - Row 1 */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setStep(TeachingStep.SAMPLE_SPACE)}
            className={`px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold ${step === TeachingStep.SAMPLE_SPACE ? 'bg-natural-text text-white border-natural-text' : 'bg-white border-natural-border text-[#6a655d] hover:bg-slate-50'}`}
          >
            样本空间
          </button>
          <button 
            onClick={() => setStep(TeachingStep.EVENT_A)}
            className={`px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold ${step === TeachingStep.EVENT_A ? 'bg-natural-text text-white border-natural-text' : 'bg-white border-natural-border text-[#6a655d] hover:bg-slate-50'}`}
          >
            事件 A
          </button>
          <button 
            onClick={() => setStep(TeachingStep.EVENT_B)}
            className={`px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold ${step === TeachingStep.EVENT_B ? 'bg-natural-text text-white border-natural-text' : 'bg-white border-natural-border text-[#6a655d] hover:bg-slate-50'}`}
          >
            事件 B
          </button>
          <button 
            onClick={() => setStep(TeachingStep.INTERSECTION)}
            className={`px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold ${step === TeachingStep.INTERSECTION ? 'bg-natural-text text-white border-natural-text' : 'bg-white border-natural-border text-[#6a655d] hover:bg-slate-50'}`}
          >
            交集
          </button>
          <div className="w-px h-6 bg-natural-divider mx-1" />
          <button 
            onClick={() => setStep(TeachingStep.CONDITIONAL_BA)}
            className={`px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold ${step === TeachingStep.CONDITIONAL_BA ? 'bg-natural-text text-white border-natural-text' : 'bg-white border-natural-border text-[#6a655d] hover:bg-slate-50'}`}
          >
            P(B|A)
          </button>
          <button 
            onClick={() => setStep(TeachingStep.CONDITIONAL_AB)}
            className={`px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold ${step === TeachingStep.CONDITIONAL_AB ? 'bg-natural-text text-white border-natural-text' : 'bg-white border-natural-border text-[#6a655d] hover:bg-slate-50'}`}
          >
            P(A|B)
          </button>
        </div>

        {/* Step Actions - Row 2 */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setStep(TeachingStep.PATH_A_1)}
              className={`px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${step >= TeachingStep.PATH_A_1 && step <= TeachingStep.PATH_A_3 ? 'bg-prob-red text-white border-prob-red' : 'bg-white border-prob-red text-prob-red hover:bg-red-50'}`}
            >
              乘法路径 A (从A出发)
            </button>
            <button 
              onClick={() => setStep(TeachingStep.PATH_B_1)}
              className={`px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${step >= TeachingStep.PATH_B_1 && step <= TeachingStep.PATH_B_3 ? 'bg-prob-blue text-white border-prob-blue' : 'bg-white border-prob-blue text-prob-blue hover:bg-blue-50'}`}
            >
              乘法路径 B (从B出发)
            </button>
            <button 
              onClick={() => setStep(TeachingStep.SUMMARY)}
              className={`px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${step === TeachingStep.SUMMARY ? 'bg-natural-text text-white border-natural-text' : 'bg-white border-natural-text text-natural-text hover:bg-slate-100'}`}
            >
              最终等式总结
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#F1EFEC] p-1 rounded-xl">
               <button onClick={handlePrev} disabled={step === 0} className="p-1.5 hover:bg-white rounded-lg disabled:opacity-20 transition-all">
                  <ChevronLeft className="w-4 h-4 text-natural-text" />
               </button>
               <button onClick={handleNext} disabled={step === TeachingStep.SUMMARY} className="p-1.5 hover:bg-white rounded-lg disabled:opacity-20 transition-all">
                  <ChevronRight className="w-4 h-4 text-natural-text" />
               </button>
            </div>
            <button 
              onClick={handleReset}
              className="px-4 py-1.5 rounded-lg border border-natural-border bg-white text-[#7a746b] font-bold text-xs hover:bg-slate-50 flex items-center gap-2 transition-all shadow-sm"
            >
              <RotateCcw className="w-3 h-3" />
              重置
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BallVisual({ type, label }: { type: BallType, label: string }) {
  const getBallClass = () => {
    switch (type) {
      case 'A_ONLY': return "bg-prob-red shadow-[0_4px_10px_rgba(230,106,92,0.3)]";
      case 'B_ONLY': return "bg-prob-blue shadow-[0_4px_10px_rgba(92,148,230,0.3)]";
      case 'INTERSECTION': return "bg-gradient-to-r from-prob-red from-50% to-prob-blue to-50% shadow-[0_4px_10px_rgba(0,0,0,0.2)]";
      case 'NEUTRAL': return "bg-prob-neutral shadow-[0_4px_10px_rgba(160,155,147,0.3)]";
    }
  };

  return (
    <div className={`w-10 h-10 rounded-full ${getBallClass()} flex items-center justify-center text-[10px] font-bold text-white shadow-xl border border-white/30 select-none relative`}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      {label}
    </div>
  );
}
function getTypeName(type: BallType) {
  switch (type) {
    case 'A_ONLY': return '纯红球 / Red Ball';
    case 'B_ONLY': return '纯蓝球 / Blue Ball';
    case 'INTERSECTION': return '半红半蓝球 / Mixed Ball';
    case 'NEUTRAL': return '中性球 / Neutral Ball';
  }
}
