'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Crown, Sun, Sunset, 
  Search, LayoutGrid, ListFilter, ArrowRight, Printer, Sparkles, Shield, Clock, Award, CheckCircle2
} from 'lucide-react';
import { BracketTeamData } from '@/lib/actions';
import { cn } from '@/lib/utils';

interface PublicBracketViewProps {
  initialTeams?: BracketTeamData[];
  initialData?: Record<string, string>;
}

const STORAGE_KEY = 'fiesta_historia_bracket_59_v1';

export default function PublicBracketView({ initialTeams = [], initialData = {} }: PublicBracketViewProps) {
  const [bracketData, setBracketData] = useState<Record<string, string>>(initialData);
  const [viewMode, setViewMode] = useState<'poolA' | 'poolB' | 'finals' | 'list'>('poolA');
  const [searchQuery, setSearchQuery] = useState('');

  // Load from localStorage or initialData
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length > 0) {
          setBracketData(parsed);
          return;
        }
      }
    } catch (e) {}

    if (initialData && Object.keys(initialData).length > 0) {
      setBracketData(initialData);
    }
  }, [initialData]);

  const isSearched = (teamName?: string) => {
    if (!searchQuery.trim() || !teamName) return false;
    return teamName.toLowerCase().includes(searchQuery.trim().toLowerCase());
  };

  // Modern Clean Read-Only Match Card
  const ReadOnlyMatchCard = ({
    matchLabel,
    p1Key,
    p2Key,
    s1Key,
    s2Key,
    isBye = false,
    byeText = "★ BYE (Lolos Otomatis)",
    stageName,
  }: {
    matchLabel: string;
    p1Key: string;
    p2Key: string;
    s1Key?: string;
    s2Key?: string;
    isBye?: boolean;
    byeText?: string;
    stageName?: string;
  }) => {
    const p1Name = (bracketData[p1Key] || (p1Key === 'final_m1_p1' ? bracketData['gf_p1'] : p1Key === 'bronze_m1_p1' ? bracketData['bronze_p1'] : ''))?.trim();
    const p2Name = (bracketData[p2Key] || (p2Key === 'final_m1_p2' ? bracketData['gf_p2'] : p2Key === 'bronze_m1_p2' ? bracketData['bronze_p2'] : ''))?.trim();
    const s1 = (s1Key ? (bracketData[s1Key] || (s1Key === 'final_m1_s1' ? bracketData['gf_s1'] : s1Key === 'bronze_m1_s1' ? bracketData['bronze_s1'] : '')) : '')?.trim();
    const s2 = (s2Key ? (bracketData[s2Key] || (s2Key === 'final_m1_s2' ? bracketData['gf_s2'] : s2Key === 'bronze_m1_s2' ? bracketData['bronze_s2'] : '')) : '')?.trim();

    const hasScore = s1 !== '' && s2 !== '';
    const s1Num = parseInt(s1, 10);
    const s2Num = parseInt(s2, 10);
    const p1Wins = hasScore && !isNaN(s1Num) && !isNaN(s2Num) && s1Num > s2Num;
    const p2Wins = hasScore && !isNaN(s1Num) && !isNaN(s2Num) && s2Num > s1Num;

    const p1Highlighted = isSearched(p1Name);
    const p2Highlighted = isSearched(p2Name);
    const matchHighlighted = p1Highlighted || p2Highlighted;

    return (
      <div 
        className={cn(
          "bg-white border rounded-xl shadow-xs overflow-hidden w-60 text-left transition-all duration-200 shrink-0 select-none",
          matchHighlighted
            ? "border-red-500 ring-2 ring-red-400/50 shadow-md scale-[1.02]"
            : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
        )}
      >
        {/* Match Top Bar */}
        <div className="bg-slate-900 text-slate-200 px-3 py-1.5 flex items-center justify-between text-[11px] font-mono border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="font-bold tracking-tight text-white">{matchLabel}</span>
          </div>
          <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-sans text-[10px]">
            {stageName || 'BO3'}
          </span>
        </div>

        {/* Team 1 Row */}
        <div className={cn(
          "px-2.5 py-2 flex items-center justify-between gap-2 border-b border-slate-100 transition-colors",
          p1Wins ? "bg-emerald-50/90 text-emerald-950 font-bold" : "text-slate-800",
          p1Highlighted && "bg-red-50/80 font-bold",
          !p1Name && "text-slate-400 italic font-normal"
        )}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className={cn(
              "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0",
              p1Wins ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
            )}>
              1
            </span>
            <span className="truncate text-xs" title={p1Name || "Menunggu pemenang"}>
              {p1Name || "Menunggu pemenang..."}
            </span>
          </div>
          {s1Key && (
            <span className={cn(
              "w-5 h-5 flex items-center justify-center rounded text-xs font-mono font-bold shrink-0",
              p1Wins ? "bg-emerald-600 text-white shadow-2xs" : "bg-slate-100 text-slate-700"
            )}>
              {s1 || '-'}
            </span>
          )}
        </div>

        {/* Team 2 Row */}
        <div className={cn(
          "px-2.5 py-2 flex items-center justify-between gap-2 transition-colors",
          p2Wins ? "bg-emerald-50/90 text-emerald-950 font-bold" : "text-slate-800",
          p2Highlighted && "bg-red-50/80 font-bold",
          isBye && "bg-amber-50/70 text-amber-900",
          !p2Name && !isBye && "text-slate-400 italic font-normal"
        )}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className={cn(
              "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0",
              p2Wins ? "bg-emerald-600 text-white" : isBye ? "bg-amber-200 text-amber-800" : "bg-slate-100 text-slate-500"
            )}>
              2
            </span>
            {isBye ? (
              <span className="truncate text-[11px] font-bold text-amber-800 flex items-center gap-1" title={p2Name || byeText}>
                {p2Name || byeText}
              </span>
            ) : (
              <span className="truncate text-xs" title={p2Name || "Menunggu pemenang"}>
                {p2Name || "Menunggu pemenang..."}
              </span>
            )}
          </div>
          {s2Key && !isBye && (
            <span className={cn(
              "w-5 h-5 flex items-center justify-center rounded text-xs font-mono font-bold shrink-0",
              p2Wins ? "bg-emerald-600 text-white shadow-2xs" : "bg-slate-100 text-slate-700"
            )}>
              {s2 || '-'}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Modern Clean BYE Card
  const ReadOnlyByeCard = ({
    byeLabel,
    slotKey,
  }: {
    byeLabel: string;
    slotKey: string;
  }) => {
    const assignedTeam = bracketData[slotKey]?.trim();
    const isHighlighted = isSearched(assignedTeam);

    return (
      <div 
        className={cn(
          "bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200/90 rounded-xl shadow-xs overflow-hidden w-60 text-left transition-all shrink-0 select-none",
          isHighlighted && "ring-2 ring-amber-500 shadow-md"
        )}
      >
        <div className="bg-amber-800 text-amber-50 px-3 py-1 flex items-center justify-between text-[11px] font-mono border-b border-amber-700/60">
          <span className="font-bold tracking-tight">{byeLabel}</span>
          <span className="text-[9px] bg-amber-900/60 text-amber-200 px-1.5 py-0.2 rounded uppercase font-bold">BYE R32</span>
        </div>
        <div className="p-2.5 space-y-1">
          <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Lolos Otomatis ke Round 32</span>
          </div>
          <p className="text-xs font-bold text-slate-900 truncate" title={assignedTeam || "Slot BYE Terjadwal"}>
            {assignedTeam || "★ Slot BYE Terjadwal"}
          </p>
        </div>
      </div>
    );
  };

  // Precision 2-to-1 Bracket Tree Block
  const ReadOnlyR32PairBlock = ({
    topMatch,
    bottomItem,
    r32Match,
    isBye = false,
  }: {
    topMatch: { num: number };
    bottomItem: { type: 'match'; num: number } | { type: 'bye'; label: string; slotKey: string };
    r32Match: { num: number; p1Key: string; p2Key: string; s1Key: string; s2Key: string; label: string };
    isBye?: boolean;
  }) => {
    return (
      <div className="flex items-center gap-3">
        {/* Left Side: 2 Feeder Match Cards */}
        <div className="flex flex-col gap-2.5">
          <ReadOnlyMatchCard
            matchLabel={`Match ${topMatch.num}`}
            p1Key={`r64_m${topMatch.num}_p1`}
            p2Key={`r64_m${topMatch.num}_p2`}
            s1Key={`r64_m${topMatch.num}_s1`}
            s2Key={`r64_m${topMatch.num}_s2`}
            stageName="R64"
          />

          {bottomItem.type === 'match' ? (
            <ReadOnlyMatchCard
              matchLabel={`Match ${bottomItem.num}`}
              p1Key={`r64_m${bottomItem.num}_p1`}
              p2Key={`r64_m${bottomItem.num}_p2`}
              s1Key={`r64_m${bottomItem.num}_s1`}
              s2Key={`r64_m${bottomItem.num}_s2`}
              stageName="R64"
            />
          ) : (
            <ReadOnlyByeCard
              byeLabel={bottomItem.label}
              slotKey={bottomItem.slotKey}
            />
          )}
        </div>

        {/* Bracket Tree Connector Line */}
        <div className="flex items-center justify-center w-6 shrink-0 text-slate-300">
          <div className="w-full flex items-center">
            <div className="w-3 h-px bg-slate-300" />
            <ArrowRight className="w-3.5 h-3.5 text-red-500 -ml-1" />
          </div>
        </div>

        {/* Right Side: R32 Match Card */}
        <ReadOnlyMatchCard
          matchLabel={r32Match.label}
          p1Key={r32Match.p1Key}
          p2Key={r32Match.p2Key}
          s1Key={r32Match.s1Key}
          s2Key={r32Match.s2Key}
          isBye={isBye}
          stageName="R32"
          byeText="★ BYE (Lolos Langsung)"
        />
      </div>
    );
  };

  // Quad Tree with Header Columns
  const ReadOnlyQuadTree = ({
    quadTitle,
    quadNum,
    r32Block1,
    r32Block2,
    r16TopMatch,
    r32Block3,
    r32Block4,
    r16BottomMatch,
    qfMatch,
  }: {
    quadTitle: string;
    quadNum: number;
    r32Block1: React.ReactNode;
    r32Block2: React.ReactNode;
    r16TopMatch: { num: number; p1Key: string; p2Key: string; s1Key: string; s2Key: string };
    r32Block3: React.ReactNode;
    r32Block4: React.ReactNode;
    r16BottomMatch: { num: number; p1Key: string; p2Key: string; s1Key: string; s2Key: string };
    qfMatch: { num: number; p1Key: string; p2Key: string; s1Key: string; s2Key: string };
  }) => {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
        {/* Quad Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            <h4 className="font-display font-bold text-xs md:text-sm text-slate-900 uppercase tracking-wide">
              {quadTitle}
            </h4>
          </div>
          <span className="text-[10px] font-mono bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-bold">
            Pemenang Lolos ke Semifinal
          </span>
        </div>

        {/* Column Stage Headers */}
        <div className="flex items-center gap-4 overflow-x-auto text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider pb-1">
          <div className="w-60 shrink-0 text-center bg-slate-100/80 py-1.5 rounded-lg border border-slate-200/60">
            1. Babak 64 Besar
          </div>
          <div className="w-6 shrink-0" />
          <div className="w-60 shrink-0 text-center bg-slate-100/80 py-1.5 rounded-lg border border-slate-200/60">
            2. Babak 32 Besar
          </div>
          <div className="w-6 shrink-0" />
          <div className="w-60 shrink-0 text-center bg-slate-100/80 py-1.5 rounded-lg border border-slate-200/60">
            3. Babak 16 Besar
          </div>
          <div className="w-6 shrink-0" />
          <div className="w-60 shrink-0 text-center bg-red-50 py-1.5 rounded-lg border border-red-200 text-red-800">
            4. Perempat Final (QF)
          </div>
        </div>

        {/* Tree Container with horizontal scroll */}
        <div className="flex items-center gap-4 overflow-x-auto pb-3 pt-1">
          
          {/* Level 1 & 2: R64 & R32 */}
          <div className="flex flex-col gap-6">
            
            {/* Top R16 Branch */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-3">
                {r32Block1}
                {r32Block2}
              </div>

              {/* Connector Line to R16 */}
              <div className="flex items-center justify-center w-6 shrink-0 text-slate-300">
                <div className="w-full flex items-center">
                  <div className="w-3 h-px bg-slate-300" />
                  <ArrowRight className="w-3.5 h-3.5 text-red-600 -ml-1" />
                </div>
              </div>

              {/* R16 Top Match */}
              <ReadOnlyMatchCard
                matchLabel={`Match ${r16TopMatch.num}`}
                p1Key={r16TopMatch.p1Key}
                p2Key={r16TopMatch.p2Key}
                s1Key={r16TopMatch.s1Key}
                s2Key={r16TopMatch.s2Key}
                stageName="16 Besar"
              />
            </div>

            {/* Bottom R16 Branch */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-3">
                {r32Block3}
                {r32Block4}
              </div>

              {/* Connector Line to R16 */}
              <div className="flex items-center justify-center w-6 shrink-0 text-slate-300">
                <div className="w-full flex items-center">
                  <div className="w-3 h-px bg-slate-300" />
                  <ArrowRight className="w-3.5 h-3.5 text-red-600 -ml-1" />
                </div>
              </div>

              {/* R16 Bottom Match */}
              <ReadOnlyMatchCard
                matchLabel={`Match ${r16BottomMatch.num}`}
                p1Key={r16BottomMatch.p1Key}
                p2Key={r16BottomMatch.p2Key}
                s1Key={r16BottomMatch.s1Key}
                s2Key={r16BottomMatch.s2Key}
                stageName="16 Besar"
              />
            </div>

          </div>

          {/* Connector Line to QF */}
          <div className="flex items-center justify-center w-6 shrink-0 text-red-400">
            <div className="w-full flex items-center">
              <div className="w-4 h-px bg-red-400" />
              <ArrowRight className="w-4 h-4 text-red-700 -ml-1" />
            </div>
          </div>

          {/* Level 4: QF Match */}
          <div className="space-y-2 shrink-0">
            <div className="bg-red-800 text-white py-1 px-3 rounded-xl text-center shadow-xs">
              <span className="font-display font-bold text-xs uppercase tracking-tight">Perempat Final {qfMatch.num}</span>
            </div>
            <ReadOnlyMatchCard
              matchLabel={`QF ${qfMatch.num} (Match ${50 + qfMatch.num})`}
              p1Key={qfMatch.p1Key}
              p2Key={qfMatch.p2Key}
              s1Key={qfMatch.s1Key}
              s2Key={qfMatch.s2Key}
              stageName="8 Besar"
            />
            <p className="text-[10px] text-center text-slate-500 font-mono">
              ➔ Tiket ke <strong className="text-red-600 font-bold">Semifinal</strong>
            </p>
          </div>

        </div>
      </div>
    );
  };

  // Full 58 Matches for List View
  const allMatchesList = useMemo(() => {
    const list = [];

    // Match 1 - 26 (R64 - 26 Matches for 58 Teams / 6 BYEs)
    for (let i = 1; i <= 26; i++) {
      const isPoolA = i <= 13;
      list.push({
        num: i,
        stage: 'Babak 64 Besar',
        session: isPoolA ? 'Sesi 1: Pool A (Pagi)' : 'Sesi 2: Pool B (Siang)',
        p1: bracketData[`r64_m${i}_p1`] || '',
        p2: bracketData[`r64_m${i}_p2`] || '',
        s1: bracketData[`r64_m${i}_s1`] || '',
        s2: bracketData[`r64_m${i}_s2`] || '',
      });
    }

    // Match 27 - 42 (R32 - 16 Matches)
    for (let i = 1; i <= 16; i++) {
      const isPoolA = i <= 8;
      list.push({
        num: 26 + i,
        stage: 'Babak 32 Besar',
        session: isPoolA ? 'Sesi 1: Pool A (Pagi)' : 'Sesi 2: Pool B (Siang)',
        p1: bracketData[`r32_m${i}_p1`] || '',
        p2: bracketData[`r32_m${i}_p2`] || '',
        s1: bracketData[`r32_m${i}_s1`] || '',
        s2: bracketData[`r32_m${i}_s2`] || '',
      });
    }

    // Match 43 - 50 (R16 - 8 Matches)
    for (let i = 1; i <= 8; i++) {
      const isPoolA = i <= 4;
      list.push({
        num: 42 + i,
        stage: 'Babak 16 Besar',
        session: isPoolA ? 'Sesi 1: Pool A (Pagi)' : 'Sesi 2: Pool B (Siang)',
        p1: bracketData[`r16_m${i}_p1`] || '',
        p2: bracketData[`r16_m${i}_p2`] || '',
        s1: bracketData[`r16_m${i}_s1`] || '',
        s2: bracketData[`r16_m${i}_s2`] || '',
      });
    }

    // Match 51 - 54 (QF - 4 Matches)
    for (let i = 1; i <= 4; i++) {
      list.push({
        num: 50 + i,
        stage: 'Perempat Final (8 Besar)',
        session: 'Sesi Malam',
        p1: bracketData[`qf_m${i}_p1`] || '',
        p2: bracketData[`qf_m${i}_p2`] || '',
        s1: bracketData[`qf_m${i}_s1`] || '',
        s2: bracketData[`qf_m${i}_s2`] || '',
      });
    }

    // Match 55 & 56 (Semifinals)
    list.push({
      num: 55,
      stage: 'Semifinal 1',
      session: 'Sesi Malam',
      p1: bracketData['sf_m1_p1'] || '',
      p2: bracketData['sf_m1_p2'] || '',
      s1: bracketData['sf_m1_s1'] || '',
      s2: bracketData['sf_m1_s2'] || '',
    });
    list.push({
      num: 56,
      stage: 'Semifinal 2',
      session: 'Sesi Malam',
      p1: bracketData['sf_m2_p1'] || '',
      p2: bracketData['sf_m2_p2'] || '',
      s1: bracketData['sf_m2_s1'] || '',
      s2: bracketData['sf_m2_s2'] || '',
    });

    // Match 57 (Perebutan Juara 3)
    list.push({
      num: 57,
      stage: 'Perebutan Juara 3',
      session: 'Sesi Malam',
      p1: bracketData['bronze_m1_p1'] || '',
      p2: bracketData['bronze_m1_p2'] || '',
      s1: bracketData['bronze_m1_s1'] || '',
      s2: bracketData['bronze_m1_s2'] || '',
    });

    // Match 58 (Grand Final)
    list.push({
      num: 58,
      stage: 'GRAND FINAL (BO5)',
      session: 'Puncak Acara',
      p1: bracketData['final_m1_p1'] || '',
      p2: bracketData['final_m1_p2'] || '',
      s1: bracketData['final_m1_s1'] || '',
      s2: bracketData['final_m1_s2'] || '',
    });

    return list;
  }, [bracketData]);

  // Filtered matches for live search
  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return allMatchesList;
    const q = searchQuery.toLowerCase();
    return allMatchesList.filter(
      m => m.p1.toLowerCase().includes(q) || 
           m.p2.toLowerCase().includes(q) || 
           m.stage.toLowerCase().includes(q) ||
           `match ${m.num}`.includes(q)
    );
  }, [allMatchesList, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner with Summary */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 md:p-6 shadow-lg border border-red-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-red-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Official Bracket
              </span>
              <span className="text-xs font-mono text-slate-300">
                58 Tim Terdaftar · 6 Slot BYE
              </span>
            </div>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-white">
              Bagan Pertandingan Turnamen (58 Tim)
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-body leading-relaxed">
              Pertandingan dibagi seimbang ke 2 sesi penyisihan (Pool A & Pool B: masing-masing 29 tim & 3 BYE) menuju Babak 8 Besar dan Grand Final.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-display font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition backdrop-blur-xs shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation View Tabs & Live Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setViewMode('poolA')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-display font-bold transition border",
              viewMode === 'poolA'
                ? "bg-red-600 border-red-600 text-white shadow-xs"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            )}
          >
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span>Sesi 1: Pool A (Pagi - 29 Tim)</span>
          </button>

          <button
            onClick={() => setViewMode('poolB')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-display font-bold transition border",
              viewMode === 'poolB'
                ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            )}
          >
            <Sunset className="w-3.5 h-3.5 text-orange-400" />
            <span>Sesi 2: Pool B (Siang - 29 Tim)</span>
          </button>

          <button
            onClick={() => setViewMode('finals')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-display font-bold transition border",
              viewMode === 'finals'
                ? "bg-amber-600 border-amber-600 text-white shadow-xs"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            )}
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-300" />
            <span>8 Besar & Final</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-display font-bold transition border",
              viewMode === 'list'
                ? "bg-slate-800 border-slate-800 text-white shadow-xs"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            )}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Daftar 58 Match</span>
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama tim kamu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition"
          />
        </div>
      </div>

      {/* Search results banner if search active */}
      {searchQuery.trim() && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex items-center justify-between">
          <span>Menampilkan hasil pencarian untuk &ldquo;<strong>{searchQuery}</strong>&rdquo; ({filteredMatches.length} match ditemukan)</span>
          <button 
            onClick={() => setSearchQuery('')}
            className="font-bold underline hover:text-amber-950"
          >
            Reset Pencarian
          </button>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 1: POOL A (SESI 1 - PAGI - 29 TIM / 3 BYE)
         ========================================================================= */}
      {viewMode === 'poolA' && !searchQuery.trim() && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-2xl shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sun className="w-6 h-6 text-amber-300 shrink-0" />
              <div>
                <h3 className="font-display font-bold text-base">SESI 1: POOL A (SESI PAGI)</h3>
                <p className="text-xs text-red-100">29 Tim · Match 1 s/d 13 di R64 · 3 Tim BYE · Menuju QF 1 & QF 2</p>
              </div>
            </div>
            <span className="text-xs font-mono bg-white/20 px-3 py-1 rounded-full font-bold shrink-0">Sesi Pagi</span>
          </div>

          {/* QUAD 1 (QF 1) */}
          <ReadOnlyQuadTree
            quadTitle="Bagan Pool A - Bagian Atas (Menuju QF 1)"
            quadNum={1}
            r32Block1={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 1 }}
                bottomItem={{ type: 'bye', label: 'BYE Slot 1', slotKey: 'r32_m1_p2' }}
                r32Match={{ num: 27, p1Key: 'r32_m1_p1', p2Key: 'r32_m1_p2', s1Key: 'r32_m1_s1', s2Key: 'r32_m1_s2', label: 'M27 (R32-1)' }}
                isBye={true}
              />
            }
            r32Block2={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 2 }}
                bottomItem={{ type: 'match', num: 3 }}
                r32Match={{ num: 28, p1Key: 'r32_m2_p1', p2Key: 'r32_m2_p2', s1Key: 'r32_m2_s1', s2Key: 'r32_m2_s2', label: 'M28 (R32-2)' }}
              />
            }
            r16TopMatch={{ num: 43, p1Key: 'r16_m1_p1', p2Key: 'r16_m1_p2', s1Key: 'r16_m1_s1', s2Key: 'r16_m1_s2' }}
            r32Block3={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 4 }}
                bottomItem={{ type: 'match', num: 5 }}
                r32Match={{ num: 29, p1Key: 'r32_m3_p1', p2Key: 'r32_m3_p2', s1Key: 'r32_m3_s1', s2Key: 'r32_m3_s2', label: 'M29 (R32-3)' }}
              />
            }
            r32Block4={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 6 }}
                bottomItem={{ type: 'match', num: 7 }}
                r32Match={{ num: 30, p1Key: 'r32_m4_p1', p2Key: 'r32_m4_p2', s1Key: 'r32_m4_s1', s2Key: 'r32_m4_s2', label: 'M30 (R32-4)' }}
              />
            }
            r16BottomMatch={{ num: 44, p1Key: 'r16_m2_p1', p2Key: 'r16_m2_p2', s1Key: 'r16_m2_s1', s2Key: 'r16_m2_s2' }}
            qfMatch={{ num: 1, p1Key: 'qf_m1_p1', p2Key: 'qf_m1_p2', s1Key: 'qf_m1_s1', s2Key: 'qf_m1_s2' }}
          />

          {/* QUAD 2 (QF 2) */}
          <ReadOnlyQuadTree
            quadTitle="Bagan Pool A - Bagian Bawah (Menuju QF 2)"
            quadNum={2}
            r32Block1={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 8 }}
                bottomItem={{ type: 'bye', label: 'BYE Slot 2', slotKey: 'r32_m5_p2' }}
                r32Match={{ num: 31, p1Key: 'r32_m5_p1', p2Key: 'r32_m5_p2', s1Key: 'r32_m5_s1', s2Key: 'r32_m5_s2', label: 'M31 (R32-5)' }}
                isBye={true}
              />
            }
            r32Block2={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 9 }}
                bottomItem={{ type: 'match', num: 10 }}
                r32Match={{ num: 32, p1Key: 'r32_m6_p1', p2Key: 'r32_m6_p2', s1Key: 'r32_m6_s1', s2Key: 'r32_m6_s2', label: 'M32 (R32-6)' }}
              />
            }
            r16TopMatch={{ num: 45, p1Key: 'r16_m3_p1', p2Key: 'r16_m3_p2', s1Key: 'r16_m3_s1', s2Key: 'r16_m3_s2' }}
            r32Block3={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 11 }}
                bottomItem={{ type: 'match', num: 12 }}
                r32Match={{ num: 33, p1Key: 'r32_m7_p1', p2Key: 'r32_m7_p2', s1Key: 'r32_m7_s1', s2Key: 'r32_m7_s2', label: 'M33 (R32-7)' }}
              />
            }
            r32Block4={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 13 }}
                bottomItem={{ type: 'bye', label: 'BYE Slot 3', slotKey: 'r32_m8_p2' }}
                r32Match={{ num: 34, p1Key: 'r32_m8_p1', p2Key: 'r32_m8_p2', s1Key: 'r32_m8_s1', s2Key: 'r32_m8_s2', label: 'M34 (R32-8)' }}
                isBye={true}
              />
            }
            r16BottomMatch={{ num: 46, p1Key: 'r16_m4_p1', p2Key: 'r16_m4_p2', s1Key: 'r16_m4_s1', s2Key: 'r16_m4_s2' }}
            qfMatch={{ num: 2, p1Key: 'qf_m2_p1', p2Key: 'qf_m2_p2', s1Key: 'qf_m2_s1', s2Key: 'qf_m2_s2' }}
          />
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: POOL B (SESI 2 - SIANG - 29 TIM / 3 BYE)
         ========================================================================= */}
      {viewMode === 'poolB' && !searchQuery.trim() && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sunset className="w-6 h-6 text-orange-400 shrink-0" />
              <div>
                <h3 className="font-display font-bold text-base">SESI 2: POOL B (SESI SIANG)</h3>
                <p className="text-xs text-slate-300">29 Tim · Match 14 s/d 26 di R64 · 3 Tim BYE · Menuju QF 3 & QF 4</p>
              </div>
            </div>
            <span className="text-xs font-mono bg-white/20 px-3 py-1 rounded-full font-bold shrink-0">Sesi Siang</span>
          </div>

          {/* QUAD 3 (QF 3) */}
          <ReadOnlyQuadTree
            quadTitle="Bagan Pool B - Bagian Atas (Menuju QF 3)"
            quadNum={3}
            r32Block1={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 14 }}
                bottomItem={{ type: 'bye', label: 'BYE Slot 4', slotKey: 'r32_m9_p2' }}
                r32Match={{ num: 35, p1Key: 'r32_m9_p1', p2Key: 'r32_m9_p2', s1Key: 'r32_m9_s1', s2Key: 'r32_m9_s2', label: 'M35 (R32-9)' }}
                isBye={true}
              />
            }
            r32Block2={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 15 }}
                bottomItem={{ type: 'match', num: 16 }}
                r32Match={{ num: 36, p1Key: 'r32_m10_p1', p2Key: 'r32_m10_p2', s1Key: 'r32_m10_s1', s2Key: 'r32_m10_s2', label: 'M36 (R32-10)' }}
              />
            }
            r16TopMatch={{ num: 47, p1Key: 'r16_m5_p1', p2Key: 'r16_m5_p2', s1Key: 'r16_m5_s1', s2Key: 'r16_m5_s2' }}
            r32Block3={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 17 }}
                bottomItem={{ type: 'match', num: 18 }}
                r32Match={{ num: 37, p1Key: 'r32_m11_p1', p2Key: 'r32_m11_p2', s1Key: 'r32_m11_s1', s2Key: 'r32_m11_s2', label: 'M37 (R32-11)' }}
              />
            }
            r32Block4={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 19 }}
                bottomItem={{ type: 'match', num: 20 }}
                r32Match={{ num: 38, p1Key: 'r32_m12_p1', p2Key: 'r32_m12_p2', s1Key: 'r32_m12_s1', s2Key: 'r32_m12_s2', label: 'M38 (R32-12)' }}
              />
            }
            r16BottomMatch={{ num: 48, p1Key: 'r16_m6_p1', p2Key: 'r16_m6_p2', s1Key: 'r16_m6_s1', s2Key: 'r16_m6_s2' }}
            qfMatch={{ num: 3, p1Key: 'qf_m3_p1', p2Key: 'qf_m3_p2', s1Key: 'qf_m3_s1', s2Key: 'qf_m3_s2' }}
          />

          {/* QUAD 4 (QF 4) */}
          <ReadOnlyQuadTree
            quadTitle="Bagan Pool B - Bagian Bawah (Menuju QF 4)"
            quadNum={4}
            r32Block1={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 21 }}
                bottomItem={{ type: 'bye', label: 'BYE Slot 5', slotKey: 'r32_m13_p2' }}
                r32Match={{ num: 39, p1Key: 'r32_m13_p1', p2Key: 'r32_m13_p2', s1Key: 'r32_m13_s1', s2Key: 'r32_m13_s2', label: 'M39 (R32-13)' }}
                isBye={true}
              />
            }
            r32Block2={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 22 }}
                bottomItem={{ type: 'match', num: 23 }}
                r32Match={{ num: 40, p1Key: 'r32_m14_p1', p2Key: 'r32_m14_p2', s1Key: 'r32_m14_s1', s2Key: 'r32_m14_s2', label: 'M40 (R32-14)' }}
              />
            }
            r16TopMatch={{ num: 49, p1Key: 'r16_m7_p1', p2Key: 'r16_m7_p2', s1Key: 'r16_m7_s1', s2Key: 'r16_m7_s2' }}
            r32Block3={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 24 }}
                bottomItem={{ type: 'match', num: 25 }}
                r32Match={{ num: 41, p1Key: 'r32_m15_p1', p2Key: 'r32_m15_p2', s1Key: 'r32_m15_s1', s2Key: 'r32_m15_s2', label: 'M41 (R32-15)' }}
              />
            }
            r32Block4={
              <ReadOnlyR32PairBlock
                topMatch={{ num: 26 }}
                bottomItem={{ type: 'bye', label: 'BYE Slot 6', slotKey: 'r32_m16_p2' }}
                r32Match={{ num: 42, p1Key: 'r32_m16_p1', p2Key: 'r32_m16_p2', s1Key: 'r32_m16_s1', s2Key: 'r32_m16_s2', label: 'M42 (R32-16)' }}
                isBye={true}
              />
            }
            r16BottomMatch={{ num: 50, p1Key: 'r16_m8_p1', p2Key: 'r16_m8_p2', s1Key: 'r16_m8_s1', s2Key: 'r16_m8_s2' }}
            qfMatch={{ num: 4, p1Key: 'qf_m4_p1', p2Key: 'qf_m4_p2', s1Key: 'qf_m4_s1', s2Key: 'qf_m4_s2' }}
          />
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 3: FINALS (8 BESAR, SEMIFINAL & GRAND FINAL)
         ========================================================================= */}
      {viewMode === 'finals' && !searchQuery.trim() && (
        <div className="space-y-8">
          {/* Podium Juara */}
          <div className="bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 border border-amber-200 rounded-3xl p-6 shadow-sm">
            <div className="text-center space-y-1 mb-6">
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase">
                Hall of Champions
              </span>
              <h3 className="font-display font-bold text-2xl text-slate-900">
                Panggung Juara Fiesta Historia 2026 🏆
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto items-end">
              {/* Juara 2 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs order-2 md:order-1">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-slate-600 font-display font-bold text-lg mb-2">
                  🥈 2
                </div>
                <p className="text-xs text-slate-400 font-mono font-bold uppercase">Runner Up</p>
                <p className="font-display font-bold text-base text-slate-900 mt-1 truncate">
                  {bracketData['champion_2'] || bracketData['podium_2'] || bracketData['final_m1_p2'] || bracketData['gf_p2'] || 'Menunggu Hasil...'}
                </p>
                <p className="text-xs font-mono text-slate-500 mt-0.5">Hadiah Rp 3.000.000</p>
              </div>

              {/* Juara 1 */}
              <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-400 rounded-2xl p-6 text-center shadow-lg order-1 md:order-2 -mt-4">
                <Crown className="w-8 h-8 text-amber-500 mx-auto mb-1 animate-bounce" />
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-display font-extrabold text-2xl mb-2 shadow-md">
                  🥇 1
                </div>
                <p className="text-xs text-amber-700 font-mono font-bold uppercase">Juara 1 Turnamen</p>
                <p className="font-display font-extrabold text-lg text-slate-900 mt-1 truncate">
                  {bracketData['champion_1'] || bracketData['podium_1'] || 'Menunggu Juara...'}
                </p>
                <p className="text-xs font-mono font-bold text-amber-600 mt-0.5">Hadiah Rp 4.000.000 + Trophy</p>
              </div>

              {/* Juara 3 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs order-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-orange-700 font-display font-bold text-lg mb-2">
                  🥉 3
                </div>
                <p className="text-xs text-slate-400 font-mono font-bold uppercase">Juara 3</p>
                <p className="font-display font-bold text-base text-slate-900 mt-1 truncate">
                  {bracketData['champion_3'] || bracketData['podium_3'] || 'Menunggu Hasil...'}
                </p>
                <p className="text-xs font-mono text-slate-500 mt-0.5">Hadiah Rp 2.000.000</p>
              </div>
            </div>
          </div>

          {/* Finals Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* QF Column */}
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 p-2.5 rounded-xl text-center font-display font-bold text-xs text-red-700">
                PEREMPAT FINAL (8 BESAR)
              </div>
              <div className="space-y-4">
                {Array.from({ length: 4 }, (_, i) => {
                  const m = i + 1;
                  return (
                    <ReadOnlyMatchCard
                      key={`public-finals-qf-${m}`}
                      matchLabel={`QF ${m} (Match ${50 + m})`}
                      p1Key={`qf_m${m}_p1`}
                      p2Key={`qf_m${m}_p2`}
                      s1Key={`qf_m${m}_s1`}
                      s2Key={`qf_m${m}_s2`}
                      stageName="8 Besar"
                    />
                  );
                })}
              </div>
            </div>

            {/* Semifinals Column */}
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 p-2.5 rounded-xl text-center font-display font-bold text-xs text-orange-700">
                SEMIFINAL (4 BESAR)
              </div>
              <div className="space-y-8 pt-4">
                <ReadOnlyMatchCard
                  matchLabel="Semifinal 1 (Match 55)"
                  p1Key="sf_m1_p1"
                  p2Key="sf_m1_p2"
                  s1Key="sf_m1_s1"
                  s2Key="sf_m1_s2"
                  stageName="Semifinal"
                />

                <ReadOnlyMatchCard
                  matchLabel="Semifinal 2 (Match 56)"
                  p1Key="sf_m2_p1"
                  p2Key="sf_m2_p2"
                  s1Key="sf_m2_s1"
                  s2Key="sf_m2_s2"
                  stageName="Semifinal"
                />
              </div>
            </div>

            {/* Finals & Bronze Column */}
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-center font-display font-bold text-xs text-amber-700">
                GRAND FINAL & BRONZE
              </div>
              <div className="space-y-6 pt-2">
                {/* Grand Final */}
                <div className="border-2 border-red-600 rounded-2xl p-1 bg-red-600/5 shadow-md">
                  <div className="text-center py-1 text-[11px] font-display font-bold text-red-700">
                    👑 PEREBUTAN JUARA 1 & 2 (BO5)
                  </div>
                  <ReadOnlyMatchCard
                    matchLabel="Grand Final (Match 58)"
                    p1Key="final_m1_p1"
                    p2Key="final_m1_p2"
                    s1Key="final_m1_s1"
                    s2Key="final_m1_s2"
                    stageName="Grand Final"
                  />
                </div>

                {/* Bronze Match */}
                <div className="border border-amber-300 rounded-2xl p-1 bg-amber-500/5 shadow-xs">
                  <div className="text-center py-1 text-[11px] font-display font-bold text-amber-800">
                    🥉 PEREBUTAN JUARA 3 (BO3)
                  </div>
                  <ReadOnlyMatchCard
                    matchLabel="Bronze Match (Match 57)"
                    p1Key="bronze_m1_p1"
                    p2Key="bronze_m1_p2"
                    s1Key="bronze_m1_s1"
                    s2Key="bronze_m1_s2"
                    stageName="Perebutan Juara 3"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 4 / SEARCH: LIST ALL 58 MATCHES
         ========================================================================= */}
      {(viewMode === 'list' || searchQuery.trim()) && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-sm">Daftar Seluruh 58 Pertandingan Turnamen</h3>
              <p className="text-xs text-slate-300">Format Single Elimination 58 Tim Mobile Legends Bang Bang</p>
            </div>
            <span className="text-xs font-mono bg-white/20 px-3 py-1 rounded-full font-bold">
              {filteredMatches.length} Match Ditampilkan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Babak</th>
                  <th className="px-4 py-3">Sesi</th>
                  <th className="px-4 py-3">Tim 1 (Merah)</th>
                  <th className="px-4 py-3 text-center">Skor</th>
                  <th className="px-4 py-3">Tim 2 (Biru)</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-body">
                {filteredMatches.map((m) => {
                  const hasWinner = (m.s1 && m.s2) && (parseInt(m.s1) !== parseInt(m.s2));
                  const isBye = m.p2.toLowerCase().includes('bye') || m.p1.toLowerCase().includes('bye');
                  return (
                    <tr key={`match-row-${m.num}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        M{m.num}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {m.stage}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <span className="font-medium text-slate-800">{m.session}</span>
                      </td>
                      <td className={cn(
                        "px-4 py-3 font-medium",
                        isSearched(m.p1) ? "text-red-600 font-bold bg-red-50/50" : "text-slate-900"
                      )}>
                        {m.p1 || <span className="text-slate-400 italic">Menunggu pemenang...</span>}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold">
                        {m.s1 || m.s2 ? (
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                            {m.s1 || '0'} - {m.s2 || '0'}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className={cn(
                        "px-4 py-3 font-medium",
                        isSearched(m.p2) ? "text-red-600 font-bold bg-red-50/50" : "text-slate-900"
                      )}>
                        {isBye ? (
                          <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                            ★ {m.p2 || 'BYE'}
                          </span>
                        ) : (
                          m.p2 || <span className="text-slate-400 italic">Menunggu pemenang...</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {hasWinner ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            ✓ Selesai
                          </span>
                        ) : isBye ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            ★ BYE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">
                            Terjadwal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
