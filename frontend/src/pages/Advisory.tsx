/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Bot, 
  User, 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  PlusCircle, 
  ArrowUp, 
  ArrowRight, 
  Landmark, 
  Scissors, 
  Droplets 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Advisory() {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 flex flex-col xl:flex-row gap-12">
      <div className="flex-1 flex flex-col h-full max-w-5xl mx-auto xl:mx-0 w-full gap-8">
        <div>
          <h2 className="text-3xl font-bold text-black tracking-tight">Cognitive Insights</h2>
          <p className="text-base text-slate-500 mt-2">Your personalized intelligence feed.</p>
        </div>

        <div className="flex-1 bg-white rounded-[32px] p-8 flex flex-col ambient-shadow border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-black/5 to-emerald-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-8 mb-8">
            <div className="flex gap-5 max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 shadow-lg shadow-black/20">
                <Bot className="text-white w-5 h-5 fill-current" />
              </div>
              <div className="bg-slate-50 rounded-2xl rounded-tl-sm p-5 text-base text-slate-800 leading-relaxed">
                <p className="mb-4">Good afternoon. Based on your recent ledger activity, I've identified an opportunity to optimize your liquidity.</p>
                <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-start gap-4 mt-2 shadow-sm">
                  <TrendingUp className="text-emerald-600 mt-0.5 w-5 h-5 fill-current" />
                  <div>
                    <p className="font-semibold text-black text-base">High-Yield Reallocation</p>
                    <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">Moving $15,000 from your operational account to the High-Yield Reserve could generate an estimated +$675 annually, maintaining your 3-month safety buffer.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-5 max-w-[85%] self-end flex-row-reverse">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300 shrink-0">
                 <User className="w-full h-full p-2 text-slate-500" />
              </div>
              <div className="bg-black text-white rounded-2xl rounded-tr-sm p-5 text-base shadow-sm">
                <p>Execute the $15k transfer to the Reserve.</p>
              </div>
            </div>

            <div className="flex gap-5 max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 shadow-lg shadow-black/20">
                <Bot className="text-white w-5 h-5 fill-current" />
              </div>
              <div className="bg-slate-50 rounded-2xl rounded-tl-sm p-5 text-base text-slate-800 leading-relaxed">
                <p>Transfer initialized. The funds will settle in the High-Yield Reserve within 24 hours.</p>
                <p className="mt-3 text-slate-400 text-xs font-mono font-medium tracking-wider">TX_ID: AX-8892-Z</p>
              </div>
            </div>

            <div className="flex gap-5 max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 shadow-lg shadow-black/20">
                <Lightbulb className="text-white w-5 h-5 fill-current" />
              </div>
              <div className="bg-slate-50 rounded-2xl rounded-tl-sm p-5 text-base text-slate-800 leading-relaxed">
                <p>I also noticed recurring subscriptions that overlap in utility. Would you like to review a consolidation plan?</p>
              </div>
            </div>
          </div>

          <div className="relative bg-slate-100 rounded-2xl p-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-black/5 transition-all ambient-shadow">
            <button className="p-3 text-slate-400 hover:text-black transition-colors">
              <PlusCircle className="w-6 h-6" />
            </button>
            <input 
              className="bg-transparent border-none flex-1 text-base text-black placeholder:text-slate-400 focus:ring-0 px-3 py-4"
              placeholder="Ask your advisor..."
              type="text"
            />
            <button className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center hover:bg-slate-800 transition-colors shrink-0">
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full xl:w-[420px] flex flex-col gap-10 shrink-0">
        <div className="flex flex-col gap-5">
          <h3 className="text-xs font-bold text-black uppercase tracking-widest">Top Recommendations</h3>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 ambient-shadow cursor-pointer hover:bg-slate-50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                <Landmark className="text-black w-6 h-6" />
              </div>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] px-3 py-1.5 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider border border-emerald-100">
                <ArrowUp className="w-3 h-3" />
                High Impact
              </span>
            </div>
            <h4 className="font-bold text-black text-base mb-2">Optimize Cash Drag</h4>
            <p className="text-sm text-slate-500 leading-relaxed">Sweep $22k excess operational funds into short-term T-Bills.</p>
            <div className="mt-5 flex items-center text-sm font-semibold text-black gap-1.5 group-hover:gap-2.5 transition-all">
              Review Proposal <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 ambient-shadow cursor-pointer hover:bg-slate-50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                <Scissors className="text-black w-6 h-6" />
              </div>
              <span className="bg-slate-50 text-slate-400 text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                Med Impact
              </span>
            </div>
            <h4 className="font-bold text-black text-base mb-2">Consolidate Subscriptions</h4>
            <p className="text-sm text-slate-500 leading-relaxed">Identified 3 overlapping SaaS tools. Potential savings: $145/mo.</p>
            <div className="mt-5 flex items-center text-sm font-semibold text-black gap-1.5 group-hover:gap-2.5 transition-all">
              Review Subscriptions <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-5">
          <h3 className="text-xs font-bold text-black uppercase tracking-widest">Market Outlook</h3>
          <div className="bg-black text-white rounded-2xl p-8 relative overflow-hidden shadow-2xl shadow-black/20">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-5">
                <Droplets className="text-emerald-400 w-4 h-4 fill-current" />
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">LIQUIDITY ENVIRONMENT</span>
              </div>
              <h4 className="text-2xl font-bold mb-3 tracking-tight">Neutral to Favorable</h4>
              <p className="text-base text-slate-300 font-light leading-relaxed mb-8">Rates remain steady. We advise maintaining current equity exposure while laddering short-term fixed income.</p>
              
              <div className="flex items-end gap-2 h-16 w-full mt-4">
                <div className="w-1/6 bg-emerald-500/20 h-1/3 rounded-t-sm" />
                <div className="w-1/6 bg-emerald-500/30 h-2/3 rounded-t-sm" />
                <div className="w-1/6 bg-emerald-500/40 h-1/2 rounded-t-sm" />
                <div className="w-1/6 bg-emerald-500/60 h-3/4 rounded-t-sm" />
                <div className="w-1/6 bg-emerald-500 h-full rounded-t-sm relative">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-400">NOW</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
