'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, RotateCcw, Shuffle, Sparkles, 
  Printer, Crown, Sun, Sunset, 
  Search, LayoutGrid, ListFilter, ArrowRight, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { saveBracketStateToDb, getBracketStateFromDb } from '@/lib/bracket-actions';

interface TeamItem {
  id: string;
  team_name: string;
  captain_name: string;
  payment_status: string;
}

interface AdminBracketViewProps {
  teams: TeamItem[];
}

const STORAGE_KEY = 'fiesta_historia_bracket_59_v1';

export default function AdminBracketView({ teams }: AdminBracketViewProps) {
  const [bracketData, setBracketData] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<'poolA' | 'poolB' | 'finals' | 'full' | 'list'>('poolA');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [isSavingDb, setIsSavingDb] = useState(false);

  // Load from localStorage or DB
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
    } catch (e) {
      console.error('Failed to load bracket data', e);
    }

    // Fallback load from DB
    getBracketStateFromDb().then(dbData => {
      if (dbData && Object.keys(dbData).length > 0) {
        setBracketData(dbData);
      }
    });
  }, []);

  const persistData = (data: Record<string, string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
    // Background sync to DB
    saveBracketStateToDb(data);
  };

  const handleManualSaveDb = async () => {
    setIsSavingDb(true);
    try {
      const res = await saveBracketStateToDb(bracketData);
      if (res?.error) {
        toast.error('Gagal menyimpan ke server: ' + res.error);
      } else {
        toast.success('Bagan berhasil disimpan & disinkronkan ke Landing Page Publik!', { icon: '🌐' });
      }
    } catch (err: any) {
      toast.error('Gagal: ' + err.message);
    } finally {
      setIsSavingDb(false);
    }
  };

  // Update a single slot
  const updateSlot = (key: string, value: string) => {
    setBracketData(prev => {
      const updated = { ...prev, [key]: value };
      persistData(updated);
      return updated;
    });
  };

  // Bulk update
  const saveBulkData = (data: Record<string, string>) => {
    setBracketData(data);
    persistData(data);
  };

  // Advance team helper with visual animation
  const advanceTeam = (sourceKey: string, targetKey: string, scoreKey?: string, winScore?: string) => {
    const teamName = bracketData[sourceKey]?.trim();
    if (!teamName) {
      toast.error('Isi nama tim terlebih dahulu!');
      return;
    }

    setBracketData(prev => {
      const updated = { ...prev, [targetKey]: teamName };
      if (scoreKey && winScore) {
        updated[scoreKey] = winScore;
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const targetEl = document.getElementById(targetKey);
    if (targetEl) {
      targetEl.classList.add('ring-2', 'ring-red-500', 'bg-red-50');
      setTimeout(() => {
        targetEl.classList.remove('ring-2', 'ring-red-500', 'bg-red-50');
      }, 1200);
    }

    toast.success(`"${teamName}" berhasil diloloskan!`, { icon: '🎯' });
  };

  // Reset entire bracket
  const handleReset = () => {
    setBracketData({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setShowResetModal(false);
    toast.success('Bagan telah dikosongkan.');
  };

  // Auto-Fill from Database
  const handleAutoFill = (shuffle: boolean = false) => {
    if (!teams || teams.length === 0) {
      toast.error('Belum ada tim terdaftar di database!');
      return;
    }

    let teamList = teams.map(t => t.team_name);
    if (shuffle) {
      teamList = [...teamList].sort(() => Math.random() - 0.5);
    }

    const newMap: Record<string, string> = { ...bracketData };

    // 5 BYEs in Round of 32 slots:
    const byeSlots = ['r32_m1_p2', 'r32_m5_p2', 'r32_m8_p2', 'r32_m9_p2', 'r32_m13_p2'];
    
    let teamIdx = 0;
    // Assign 5 BYE teams
    for (let i = 0; i < 5 && teamIdx < teamList.length; i++) {
      newMap[byeSlots[i]] = teamList[teamIdx];
      teamIdx++;
    }

    // Remaining teams fill 27 matches in Round of 64
    for (let m = 1; m <= 27 && teamIdx < teamList.length; m++) {
      newMap[`r64_m${m}_p1`] = teamList[teamIdx++] || '';
      if (teamIdx < teamList.length) {
        newMap[`r64_m${m}_p2`] = teamList[teamIdx++] || '';
      }
    }

    saveBulkData(newMap);
    toast.success(`Berhasil mengisi ${teamList.length} tim dari database! ${shuffle ? '(Acak Undian)' : '(Urut Daftar)'}`);
  };

  // Stats calculation
  const stats = useMemo(() => {
    let completedMatches = 0;
    for (let i = 1; i <= 27; i++) {
      if (bracketData[`r64_m${i}_s1`] && bracketData[`r64_m${i}_s2`]) completedMatches++;
    }
    for (let i = 1; i <= 16; i++) {
      if (bracketData[`r32_m${i}_s1`] && bracketData[`r32_m${i}_s2`]) completedMatches++;
    }
    for (let i = 1; i <= 8; i++) {
      if (bracketData[`r16_m${i}_s1`] && bracketData[`r16_m${i}_s2`]) completedMatches++;
    }
    for (let i = 1; i <= 4; i++) {
      if (bracketData[`qf_m${i}_s1`] && bracketData[`qf_m${i}_s2`]) completedMatches++;
    }
    for (let i = 1; i <= 2; i++) {
      if (bracketData[`sf_m${i}_s1`] && bracketData[`sf_m${i}_s2`]) completedMatches++;
    }
    if (bracketData['gf_s1'] && bracketData['gf_s2']) completedMatches++;
    if (bracketData['bronze_s1'] && bracketData['bronze_s2']) completedMatches++;

    return {
      completedMatches,
      totalMatches: 58,
      totalTeams: teams.length,
    };
  }, [bracketData, teams]);

  // Match List for Schedule / List Mode
  const allMatchesList = useMemo(() => {
    const list: Array<{
      id: string;
      label: string;
      round: string;
      session: string;
      p1Key: string;
      p2Key: string;
      s1Key: string;
      s2Key: string;
      targetP1: string;
      isBye?: boolean;
    }> = [];

    const r32Targets: Record<number, string> = {
      1: 'r32_m1_p1', 2: 'r32_m2_p1', 3: 'r32_m2_p2', 4: 'r32_m3_p1', 5: 'r32_m3_p2',
      6: 'r32_m4_p1', 7: 'r32_m4_p2', 8: 'r32_m5_p1', 9: 'r32_m6_p1', 10: 'r32_m6_p2',
      11: 'r32_m7_p1', 12: 'r32_m7_p2', 13: 'r32_m8_p1',
      14: 'r32_m9_p1', 15: 'r32_m10_p1', 16: 'r32_m10_p2', 17: 'r32_m11_p1', 18: 'r32_m11_p2',
      19: 'r32_m12_p1', 20: 'r32_m12_p2', 21: 'r32_m13_p1', 22: 'r32_m14_p1', 23: 'r32_m14_p2',
      24: 'r32_m15_p1', 25: 'r32_m15_p2', 26: 'r32_m16_p1', 27: 'r32_m16_p2'
    };

    for (let m = 1; m <= 27; m++) {
      list.push({
        id: `r64_m${m}`,
        label: `Match ${m}`,
        round: 'Babak 64 Besar',
        session: m <= 13 ? 'Sesi 1 (Pool A - Pagi)' : 'Sesi 2 (Pool B - Siang)',
        p1Key: `r64_m${m}_p1`,
        p2Key: `r64_m${m}_p2`,
        s1Key: `r64_m${m}_s1`,
        s2Key: `r64_m${m}_s2`,
        targetP1: r32Targets[m],
      });
    }

    for (let m = 1; m <= 16; m++) {
      const r16Target = `r16_m${Math.ceil(m / 2)}_p${m % 2 === 1 ? '1' : '2'}`;
      const isBye = m === 1 || m === 5 || m === 8 || m === 9 || m === 13;
      list.push({
        id: `r32_m${m}`,
        label: `Match ${27 + m}`,
        round: 'Babak 32 Besar',
        session: m <= 8 ? 'Sesi 1 (Pool A - Pagi)' : 'Sesi 2 (Pool B - Siang)',
        p1Key: `r32_m${m}_p1`,
        p2Key: `r32_m${m}_p2`,
        s1Key: `r32_m${m}_s1`,
        s2Key: `r32_m${m}_s2`,
        targetP1: r16Target,
        isBye
      });
    }

    for (let m = 1; m <= 8; m++) {
      const qfTarget = `qf_m${Math.ceil(m / 2)}_p${m % 2 === 1 ? '1' : '2'}`;
      list.push({
        id: `r16_m${m}`,
        label: `Match ${43 + m}`,
        round: 'Babak 16 Besar',
        session: m <= 4 ? 'Pool A (Pagi/Siang)' : 'Pool B (Siang/Sore)',
        p1Key: `r16_m${m}_p1`,
        p2Key: `r16_m${m}_p2`,
        s1Key: `r16_m${m}_s1`,
        s2Key: `r16_m${m}_s2`,
        targetP1: qfTarget,
      });
    }

    for (let m = 1; m <= 4; m++) {
      const sfTarget = `sf_m${Math.ceil(m / 2)}_p${m % 2 === 1 ? '1' : '2'}`;
      list.push({
        id: `qf_m${m}`,
        label: `Perempat Final ${m} (Match ${51 + m})`,
        round: '8 Besar (Perempat Final)',
        session: 'Babak Utama (Sore)',
        p1Key: `qf_m${m}_p1`,
        p2Key: `qf_m${m}_p2`,
        s1Key: `qf_m${m}_s1`,
        s2Key: `qf_m${m}_s2`,
        targetP1: sfTarget,
      });
    }

    for (let m = 1; m <= 2; m++) {
      list.push({
        id: `sf_m${m}`,
        label: `Semifinal ${m} (Match ${55 + m})`,
        round: 'Semifinal (4 Besar)',
        session: 'Babak Utama (Malam)',
        p1Key: `sf_m${m}_p1`,
        p2Key: `sf_m${m}_p2`,
        s1Key: `sf_m${m}_s1`,
        s2Key: `sf_m${m}_s2`,
        targetP1: `gf_p${m}`,
      });
    }

    list.push({
      id: 'bronze_m',
      label: 'Perebutan Juara 3 (Match 58)',
      round: 'Perebutan Juara 3',
      session: 'Hari 1 (Malam)',
      p1Key: 'bronze_p1',
      p2Key: 'bronze_p2',
      s1Key: 'bronze_s1',
      s2Key: 'bronze_s2',
      targetP1: 'podium_3',
    });

    list.push({
      id: 'gf_m',
      label: '👑 GRAND FINAL MLBB (BO5)',
      round: 'Grand Final',
      session: 'Hari 2 (Panggung Utama)',
      p1Key: 'gf_p1',
      p2Key: 'gf_p2',
      s1Key: 'gf_s1',
      s2Key: 'gf_s2',
      targetP1: 'podium_1',
    });

    return list;
  }, []);

  const filteredMatches = useMemo(() => {
    if (!searchQuery) return allMatchesList;
    const q = searchQuery.toLowerCase();
    return allMatchesList.filter(m => {
      const p1 = bracketData[m.p1Key] || '';
      const p2 = bracketData[m.p2Key] || '';
      return m.label.toLowerCase().includes(q) || 
             m.round.toLowerCase().includes(q) || 
             p1.toLowerCase().includes(q) || 
             p2.toLowerCase().includes(q);
    });
  }, [allMatchesList, searchQuery, bracketData]);

  // Standard Match Card
  const MatchCard = ({
    matchLabel,
    p1Key,
    p2Key,
    s1Key,
    s2Key,
    targetKey,
    isBye = false,
    byeText = "★ BYE Slot",
    isFinal = false,
  }: {
    matchLabel: string;
    p1Key: string;
    p2Key: string;
    s1Key: string;
    s2Key: string;
    targetKey?: string;
    isBye?: boolean;
    byeText?: string;
    isFinal?: boolean;
  }) => {
    const p1 = bracketData[p1Key] || '';
    const p2 = bracketData[p2Key] || '';
    const s1 = bracketData[s1Key] || '';
    const s2 = bracketData[s2Key] || '';

    const p1Won = s1 && s2 && parseInt(s1) > parseInt(s2);
    const p2Won = s1 && s2 && parseInt(s2) > parseInt(s1);

    return (
      <div className={cn(
        "bg-white border rounded-xl shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col w-[250px] shrink-0",
        isFinal ? "border-amber-400 ring-2 ring-amber-400/30" : 
        isBye ? "border-amber-200 bg-amber-50/15" : "border-slate-200"
      )}>
        <div className="bg-slate-50 border-b border-slate-100 px-2 py-1 flex items-center justify-between text-[11px]">
          <span className="font-mono font-bold text-red-600 truncate">{matchLabel}</span>
          {isBye && (
            <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
              ★ BYE
            </span>
          )}
          {isFinal && (
            <span className="text-[9px] font-display font-extrabold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
              👑 FINAL BO5
            </span>
          )}
        </div>

        <div className="p-1.5 space-y-1">
          {/* Team 1 */}
          <div className={cn(
            "flex items-center gap-1 p-1 rounded-lg border transition-all",
            p1Won ? "bg-red-50/80 border-red-300" : "bg-slate-50/50 border-slate-200"
          )}>
            <input
              id={p1Key}
              type="text"
              value={p1}
              onChange={(e) => updateSlot(p1Key, e.target.value)}
              placeholder="Nama Tim 1"
              className={cn(
                "w-full bg-transparent text-xs font-semibold px-1 py-0.5 outline-none truncate",
                p1Won ? "text-red-700 font-bold" : "text-slate-800"
              )}
            />
            <input
              type="number"
              value={s1}
              onChange={(e) => updateSlot(s1Key, e.target.value)}
              placeholder="0"
              className="w-7 text-center bg-white border border-slate-200 text-xs font-mono font-bold py-0.5 rounded outline-none"
            />
            {targetKey && (
              <button
                onClick={() => advanceTeam(p1Key, targetKey, s1Key, '1')}
                className="px-1.5 py-0.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded text-[11px] font-bold border border-red-200 transition shrink-0"
                title="Loloskan Tim 1"
              >
                👉
              </button>
            )}
          </div>

          {/* Team 2 */}
          <div className={cn(
            "flex items-center gap-1 p-1 rounded-lg border transition-all",
            p2Won ? "bg-red-50/80 border-red-300" : "bg-slate-50/50 border-slate-200"
          )}>
            <input
              id={p2Key}
              type="text"
              value={p2}
              onChange={(e) => updateSlot(p2Key, e.target.value)}
              placeholder={isBye ? byeText : "Nama Tim 2"}
              className={cn(
                "w-full bg-transparent text-xs font-semibold px-1 py-0.5 outline-none truncate",
                isBye ? "text-amber-800 italic" : p2Won ? "text-red-700 font-bold" : "text-slate-800"
              )}
            />
            <input
              type="number"
              value={s2}
              onChange={(e) => updateSlot(s2Key, e.target.value)}
              placeholder="0"
              className="w-7 text-center bg-white border border-slate-200 text-xs font-mono font-bold py-0.5 rounded outline-none"
            />
            {targetKey && (
              <button
                onClick={() => advanceTeam(p2Key, targetKey, s2Key, '1')}
                className="px-1.5 py-0.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded text-[11px] font-bold border border-red-200 transition shrink-0"
                title="Loloskan Tim 2"
              >
                👉
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // BYE Box Component (shown in R64 level so every R32 match has exactly 2 left-side boxes)
  const ByeSlotCard = ({
    byeLabel,
    slotKey,
    r32MatchLabel
  }: {
    byeLabel: string;
    slotKey: string;
    r32MatchLabel: string;
  }) => {
    const byeTeam = bracketData[slotKey] || '';
    return (
      <div className="bg-amber-50/60 border border-amber-300 rounded-xl p-2 w-[250px] shrink-0 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-[10px] text-amber-800 font-mono font-bold">
          <span>★ {byeLabel}</span>
          <span className="text-amber-600">Langsung R32</span>
        </div>
        <input
          id={slotKey}
          type="text"
          value={byeTeam}
          onChange={(e) => updateSlot(slotKey, e.target.value)}
          placeholder="Nama Tim Penerima BYE"
          className="w-full bg-white border border-amber-200 text-xs font-bold text-amber-950 px-2 py-1 rounded outline-none"
        />
        <p className="text-[9px] text-amber-700 font-mono">
          ➔ Lolos otomatis ke slot bawah <strong>{r32MatchLabel}</strong>
        </p>
      </div>
    );
  };

  // Structured Aligned Tree Component for a Sub-Branch (R64 -> R32)
  const R32PairBlock = ({
    topMatch,
    bottomItem,
    r32Match,
    r32TargetKey,
    isBye = false,
  }: {
    topMatch: { num: number; target: string };
    bottomItem: { type: 'match'; num: number; target: string } | { type: 'bye'; label: string; slotKey: string };
    r32Match: { num: number; p1Key: string; p2Key: string; s1Key: string; s2Key: string; label: string };
    r32TargetKey: string;
    isBye?: boolean;
  }) => {
    return (
      <div className="flex items-center gap-4 py-2">
        {/* Left Side: 2 Boxes (R64) */}
        <div className="flex flex-col gap-3">
          <MatchCard
            matchLabel={`M${topMatch.num} (R64)`}
            p1Key={`r64_m${topMatch.num}_p1`}
            p2Key={`r64_m${topMatch.num}_p2`}
            s1Key={`r64_m${topMatch.num}_s1`}
            s2Key={`r64_m${topMatch.num}_s2`}
            targetKey={topMatch.target}
          />
          {bottomItem.type === 'match' ? (
            <MatchCard
              matchLabel={`M${bottomItem.num} (R64)`}
              p1Key={`r64_m${bottomItem.num}_p1`}
              p2Key={`r64_m${bottomItem.num}_p2`}
              s1Key={`r64_m${bottomItem.num}_s1`}
              s2Key={`r64_m${bottomItem.num}_s2`}
              targetKey={bottomItem.target}
            />
          ) : (
            <ByeSlotCard
              byeLabel={bottomItem.label}
              slotKey={bottomItem.slotKey}
              r32MatchLabel={r32Match.label}
            />
          )}
        </div>

        {/* Connector Line */}
        <div className="flex items-center text-slate-300 shrink-0">
          <div className="w-4 h-px bg-slate-300" />
          <ArrowRight className="w-3.5 h-3.5 text-red-500 -ml-1" />
        </div>

        {/* Right Side: 1 Box (R32) - Mathematical center! */}
        <MatchCard
          matchLabel={r32Match.label}
          p1Key={r32Match.p1Key}
          p2Key={r32Match.p2Key}
          s1Key={r32Match.s1Key}
          s2Key={r32Match.s2Key}
          targetKey={r32TargetKey}
          isBye={isBye}
          byeText="★ BYE (Lolos Langsung)"
        />
      </div>
    );
  };

  // Structured Aligned Tree Component for a Quad (feeds into 1 QF match)
  const QuadTree = ({
    quadTitle,
    quadNum,
    r32Block1,
    r32Block2,
    r16TopMatch,
    r32Block3,
    r32Block4,
    r16BottomMatch,
    qfMatch,
    sfTargetKey
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
    sfTargetKey: string;
  }) => {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            <span className="font-display font-bold text-xs md:text-sm text-slate-900 uppercase tracking-wide">{quadTitle}</span>
          </div>
          <span className="text-[10px] font-mono bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-bold">
            Pemenang ke Semifinal
          </span>
        </div>

        {/* Column Stage Headers */}
        <div className="flex items-center gap-4 overflow-x-auto text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider pb-1">
          <div className="w-[250px] shrink-0 text-center bg-slate-100/80 py-1.5 rounded-lg border border-slate-200/60">
            1. Babak 64 Besar
          </div>
          <div className="w-4 shrink-0" />
          <div className="w-[250px] shrink-0 text-center bg-slate-100/80 py-1.5 rounded-lg border border-slate-200/60">
            2. Babak 32 Besar
          </div>
          <div className="w-4 shrink-0" />
          <div className="w-[250px] shrink-0 text-center bg-slate-100/80 py-1.5 rounded-lg border border-slate-200/60">
            3. Babak 16 Besar
          </div>
          <div className="w-6 shrink-0" />
          <div className="w-[250px] shrink-0 text-center bg-red-50 py-1.5 rounded-lg border border-red-200 text-red-800">
            4. Perempat Final (QF)
          </div>
        </div>

        {/* Tree container with perfect flex centering */}
        <div className="flex items-center gap-4 overflow-x-auto pb-3 pt-1">
          
          {/* Level 1 & 2: R64 and R32 combined */}
          <div className="flex flex-col gap-6">
            
            {/* Top R16 Branch */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-2">
                {r32Block1}
                {r32Block2}
              </div>

              {/* Connector to R16 Top Match */}
              <div className="flex items-center text-slate-300 shrink-0">
                <div className="w-4 h-px bg-slate-300" />
                <ArrowRight className="w-3.5 h-3.5 text-red-600 -ml-1" />
              </div>

              {/* R16 Top Match (Vertically Centered between Block 1 & 2) */}
              <MatchCard
                matchLabel={`M${r16TopMatch.num} (16 Besar)`}
                p1Key={r16TopMatch.p1Key}
                p2Key={r16TopMatch.p2Key}
                s1Key={r16TopMatch.s1Key}
                s2Key={r16TopMatch.s2Key}
                targetKey={`qf_m${qfMatch.num}_p1`}
              />
            </div>

            {/* Bottom R16 Branch */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-2">
                {r32Block3}
                {r32Block4}
              </div>

              {/* Connector to R16 Bottom Match */}
              <div className="flex items-center text-slate-300 shrink-0">
                <div className="w-4 h-px bg-slate-300" />
                <ArrowRight className="w-3.5 h-3.5 text-red-600 -ml-1" />
              </div>

              {/* R16 Bottom Match (Vertically Centered between Block 3 & 4) */}
              <MatchCard
                matchLabel={`M${r16BottomMatch.num} (16 Besar)`}
                p1Key={r16BottomMatch.p1Key}
                p2Key={r16BottomMatch.p2Key}
                s1Key={r16BottomMatch.s1Key}
                s2Key={r16BottomMatch.s2Key}
                targetKey={`qf_m${qfMatch.num}_p2`}
              />
            </div>

          </div>

          {/* Connector to QF */}
          <div className="flex items-center text-slate-300 shrink-0">
            <div className="w-6 h-px bg-red-400" />
            <ArrowRight className="w-4 h-4 text-red-700 -ml-1" />
          </div>

          {/* Level 4: QF Match (Vertically Centered between R16 M1 & M2!) */}
          <div className="space-y-2 shrink-0">
            <div className="bg-red-800 text-white p-2 rounded-xl text-center shadow-xs">
              <span className="font-display font-bold text-xs uppercase">Perempat Final {qfMatch.num}</span>
            </div>
            <MatchCard
              matchLabel={`QF ${qfMatch.num} (M${51 + qfMatch.num})`}
              p1Key={qfMatch.p1Key}
              p2Key={qfMatch.p2Key}
              s1Key={qfMatch.s1Key}
              s2Key={qfMatch.s2Key}
              targetKey={sfTargetKey}
            />
            <p className="text-[10px] text-center text-slate-500 font-mono">
              ➔ Tiket ke <strong className="text-red-600">Semifinal</strong>
            </p>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar inside Admin Panel */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0">
          <button
            onClick={() => setViewMode('poolA')}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-display font-bold transition flex items-center gap-1.5 shrink-0 border",
              viewMode === 'poolA'
                ? "bg-red-600 border-red-600 text-white shadow-xs"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span>Sesi 1: Pool A (Pagi)</span>
          </button>

          <button
            onClick={() => setViewMode('poolB')}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-display font-bold transition flex items-center gap-1.5 shrink-0 border",
              viewMode === 'poolB'
                ? "bg-red-600 border-red-600 text-white shadow-xs"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            <Sunset className="w-3.5 h-3.5 text-orange-300" />
            <span>Sesi 2: Pool B (Siang)</span>
          </button>

          <button
            onClick={() => setViewMode('finals')}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-display font-bold transition flex items-center gap-1.5 shrink-0 border",
              viewMode === 'finals'
                ? "bg-red-600 border-red-600 text-white shadow-xs"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>8 Besar & Final</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-display font-bold transition flex items-center gap-1.5 shrink-0 border",
              viewMode === 'list'
                ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Daftar 58 Match</span>
          </button>
        </div>

        {/* Quick buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSaveDb}
            disabled={isSavingDb}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition disabled:opacity-50"
            title="Simpan perubahan ke database agar tampil di Landing Page publik"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingDb ? 'Menyimpan...' : 'Simpan Publik'}</span>
          </button>

          <button
            onClick={() => handleAutoFill(false)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition"
            title="Isi tim sesuai urutan pendaftaran database"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>Isi DB</span>
          </button>

          <button
            onClick={() => handleAutoFill(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg border border-red-200 transition"
            title="Acak / Undi tim dari database"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Undi Acak</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-1.5 px-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-xs transition flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            className="p-1.5 px-2.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          POOL A: SESI 1 (PAGI) - SEJAJAR & RAPI
         ========================================================================= */}
      {viewMode === 'poolA' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-2xl shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sun className="w-6 h-6 text-amber-300" />
              <div>
                <h3 className="font-display font-bold text-base">SESI 1: POOL A (SESI PAGI)</h3>
                <p className="text-xs text-red-100">29 Tim · Match 1 s/d 13 di R64 · 3 Tim BYE · Sejajar Presisi ke QF 1 & QF 2</p>
              </div>
            </div>
            <span className="text-xs font-mono bg-white/20 px-3 py-1 rounded-full font-bold">Sesi Pagi</span>
          </div>

          {/* QUAD 1 (QF 1) */}
          <QuadTree
            quadTitle="Bagan Pool A - Bagian Atas (Menuju QF 1)"
            quadNum={1}
            sfTargetKey="sf_m1_p1"
            r32Block1={
              <R32PairBlock
                topMatch={{ num: 1, target: 'r32_m1_p1' }}
                bottomItem={{ type: 'bye', label: 'BYE Slot 1', slotKey: 'r32_m1_p2' }}
                r32Match={{ num: 28, p1Key: 'r32_m1_p1', p2Key: 'r32_m1_p2', s1Key: 'r32_m1_s1', s2Key: 'r32_m1_s2', label: 'M28 (R32-1)' }}
                r32TargetKey="r16_m1_p1"
                isBye={true}
              />
            }
            r32Block2={
              <R32PairBlock
                topMatch={{ num: 2, target: 'r32_m2_p1' }}
                bottomItem={{ type: 'match', num: 3, target: 'r32_m2_p2' }}
                r32Match={{ num: 29, p1Key: 'r32_m2_p1', p2Key: 'r32_m2_p2', s1Key: 'r32_m2_s1', s2Key: 'r32_m2_s2', label: 'M29 (R32-2)' }}
                r32TargetKey="r16_m1_p2"
              />
            }
            r16TopMatch={{ num: 44, p1Key: 'r16_m1_p1', p2Key: 'r16_m1_p2', s1Key: 'r16_m1_s1', s2Key: 'r16_m1_s2' }}
            r32Block3={
              <R32PairBlock
                topMatch={{ num: 4, target: 'r32_m3_p1' }}
                bottomItem={{ type: 'match', num: 5, target: 'r32_m3_p2' }}
                r32Match={{ num: 30, p1Key: 'r32_m3_p1', p2Key: 'r32_m3_p2', s1Key: 'r32_m3_s1', s2Key: 'r32_m3_s2', label: 'M30 (R32-3)' }}
                r32TargetKey="r16_m2_p1"
              />
            }
            r32Block4={
              <R32PairBlock
                topMatch={{ num: 6, target: 'r32_m4_p1' }}
                bottomItem={{ type: 'match', num: 7, target: 'r32_m4_p2' }}
                r32Match={{ num: 31, p1Key: 'r32_m4_p1', p2Key: 'r32_m4_p2', s1Key: 'r32_m4_s1', s2Key: 'r32_m4_s2', label: 'M31 (R32-4)' }}
                r32TargetKey="r16_m2_p2"
              />
            }
            r16BottomMatch={{ num: 45, p1Key: 'r16_m2_p1', p2Key: 'r16_m2_p2', s1Key: 'r16_m2_s1', s2Key: 'r16_m2_s2' }}
            qfMatch={{ num: 1, p1Key: 'qf_m1_p1', p2Key: 'qf_m1_p2', s1Key: 'qf_m1_s1', s2Key: 'qf_m1_s2' }}
          />

          {/* QUAD 2 (QF 2) */}
          <QuadTree
            quadTitle="Bagan Pool A - Bagian Bawah (Menuju QF 2)"
            quadNum={2}
            sfTargetKey="sf_m1_p2"
            r32Block1={
              <R32PairBlock
                topMatch={{ num: 8, target: 'r32_m5_p1' }}
                bottomItem={{ type: 'bye', label: 'BYE Slot 2', slotKey: 'r32_m5_p2' }}
                r32Match={{ num: 32, p1Key: 'r32_m5_p1', p2Key: 'r32_m5_p2', s1Key: 'r32_m5_s1', s2Key: 'r32_m5_s2', label: 'M32 (R32-5)' }}
                r32TargetKey="r16_m3_p1"
                isBye={true}
              />
            }
            r32Block2={
              <R32PairBlock
                topMatch={{ num: 9, target: 'r32_m6_p1' }}
                bottomItem={{ type: 'match', num: 10, target: 'r32_m6_p2' }}
                r32Match={{ num: 33, p1Key: 'r32_m6_p1', p2Key: 'r32_m6_p2', s1Key: 'r32_m6_s1', s2Key: 'r32_m6_s2', label: 'M33 (R32-6)' }}
                r32TargetKey="r16_m3_p2"
              />
            }
            r16TopMatch={{ num: 46, p1Key: 'r16_m3_p1', p2Key: 'r16_m3_p2', s1Key: 'r16_m3_s1', s2Key: 'r16_m3_s2' }}
            r32Block3={
              <R32PairBlock
                topMatch={{ num: 11, target: 'r32_m7_p1' }}
                bottomItem={{ type: 'match', num: 12, target: 'r32_m7_p2' }}
                r32Match={{ num: 34, p1Key: 'r32_m7_p1', p2Key: 'r32_m7_p2', s1Key: 'r32_m7_s1', s2Key: 'r32_m7_s2', label: 'M34 (R32-7)' }}
                r32TargetKey="r16_m4_p1"
              />
            }
            r32Block4={
              <R32PairBlock
                topMatch={{ num: 13, target: 'r32_m8_p1' }}
                bottomItem={{ type: 'bye', label: 'BYE Slot 3', slotKey: 'r32_m8_p2' }}
                r32Match={{ num: 35, p1Key: 'r32_m8_p1', p2Key: 'r32_m8_p2', s1Key: 'r32_m8_s1', s2Key: 'r32_m8_s2', label: 'M35 (R32-8)' }}
                r32TargetKey="r16_m4_p2"
                isBye={true}
              />
            }
            r16BottomMatch={{ num: 47, p1Key: 'r16_m4_p1', p2Key: 'r16_m4_p2', s1Key: 'r16_m4_s1', s2Key: 'r16_m4_s2' }}
            qfMatch={{ num: 2, p1Key: 'qf_m2_p1', p2Key: 'qf_m2_p2', s1Key: 'qf_m2_s1', s2Key: 'qf_m2_s2' }}
          />

        </div>
      )}

      {/* =========================================================================
          POOL B: SESI 2 (SIANG) - SEJAJAR & RAPI
         ========================================================================= */}
      {viewMode === 'poolB' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sunset className="w-6 h-6 text-orange-400" />
              <div>
                <h3 className="font-display font-bold text-base">SESI 2: POOL B (SESI SIANG/SORE)</h3>
                <p className="text-xs text-slate-300">30 Tim · Match 14 s/d 27 di R64 · 2 Tim BYE · Sejajar Presisi ke QF 3 & QF 4</p>
              </div>
            </div>
            <span className="text-xs font-mono bg-white/20 px-3 py-1 rounded-full font-bold">Sesi Siang</span>
          </div>

          {/* QUAD 3 (QF 3) */}
          <QuadTree
            quadTitle="Bagan Pool B - Bagian Atas (Menuju QF 3)"
            quadNum={3}
            sfTargetKey="sf_m2_p1"
            r32Block1={
              <R32PairBlock
                topMatch={{ num: 14, target: 'r32_m9_p1' }}
                bottomItem={{ type: 'bye', label: 'BYE Slot 4', slotKey: 'r32_m9_p2' }}
                r32Match={{ num: 36, p1Key: 'r32_m9_p1', p2Key: 'r32_m9_p2', s1Key: 'r32_m9_s1', s2Key: 'r32_m9_s2', label: 'M36 (R32-9)' }}
                r32TargetKey="r16_m5_p1"
                isBye={true}
              />
            }
            r32Block2={
              <R32PairBlock
                topMatch={{ num: 15, target: 'r32_m10_p1' }}
                bottomItem={{ type: 'match', num: 16, target: 'r32_m10_p2' }}
                r32Match={{ num: 37, p1Key: 'r32_m10_p1', p2Key: 'r32_m10_p2', s1Key: 'r32_m10_s1', s2Key: 'r32_m10_s2', label: 'M37 (R32-10)' }}
                r32TargetKey="r16_m5_p2"
              />
            }
            r16TopMatch={{ num: 48, p1Key: 'r16_m5_p1', p2Key: 'r16_m5_p2', s1Key: 'r16_m5_s1', s2Key: 'r16_m5_s2' }}
            r32Block3={
              <R32PairBlock
                topMatch={{ num: 17, target: 'r32_m11_p1' }}
                bottomItem={{ type: 'match', num: 18, target: 'r32_m11_p2' }}
                r32Match={{ num: 38, p1Key: 'r32_m11_p1', p2Key: 'r32_m11_p2', s1Key: 'r32_m11_s1', s2Key: 'r32_m11_s2', label: 'M38 (R32-11)' }}
                r32TargetKey="r16_m6_p1"
              />
            }
            r32Block4={
              <R32PairBlock
                topMatch={{ num: 19, target: 'r32_m12_p1' }}
                bottomItem={{ type: 'match', num: 20, target: 'r32_m12_p2' }}
                r32Match={{ num: 39, p1Key: 'r32_m12_p1', p2Key: 'r32_m12_p2', s1Key: 'r32_m12_s1', s2Key: 'r32_m12_s2', label: 'M39 (R32-12)' }}
                r32TargetKey="r16_m6_p2"
              />
            }
            r16BottomMatch={{ num: 49, p1Key: 'r16_m6_p1', p2Key: 'r16_m6_p2', s1Key: 'r16_m6_s1', s2Key: 'r16_m6_s2' }}
            qfMatch={{ num: 3, p1Key: 'qf_m3_p1', p2Key: 'qf_m3_p2', s1Key: 'qf_m3_s1', s2Key: 'qf_m3_s2' }}
          />

          {/* QUAD 4 (QF 4) */}
          <QuadTree
            quadTitle="Bagan Pool B - Bagian Bawah (Menuju QF 4)"
            quadNum={4}
            sfTargetKey="sf_m2_p2"
            r32Block1={
              <R32PairBlock
                topMatch={{ num: 21, target: 'r32_m13_p1' }}
                bottomItem={{ type: 'bye', label: 'BYE Slot 5', slotKey: 'r32_m13_p2' }}
                r32Match={{ num: 40, p1Key: 'r32_m13_p1', p2Key: 'r32_m13_p2', s1Key: 'r32_m13_s1', s2Key: 'r32_m13_s2', label: 'M40 (R32-13)' }}
                r32TargetKey="r16_m7_p1"
                isBye={true}
              />
            }
            r32Block2={
              <R32PairBlock
                topMatch={{ num: 22, target: 'r32_m14_p1' }}
                bottomItem={{ type: 'match', num: 23, target: 'r32_m14_p2' }}
                r32Match={{ num: 41, p1Key: 'r32_m14_p1', p2Key: 'r32_m14_p2', s1Key: 'r32_m14_s1', s2Key: 'r32_m14_s2', label: 'M41 (R32-14)' }}
                r32TargetKey="r16_m7_p2"
              />
            }
            r16TopMatch={{ num: 50, p1Key: 'r16_m7_p1', p2Key: 'r16_m7_p2', s1Key: 'r16_m7_s1', s2Key: 'r16_m7_s2' }}
            r32Block3={
              <R32PairBlock
                topMatch={{ num: 24, target: 'r32_m15_p1' }}
                bottomItem={{ type: 'match', num: 25, target: 'r32_m15_p2' }}
                r32Match={{ num: 42, p1Key: 'r32_m15_p1', p2Key: 'r32_m15_p2', s1Key: 'r32_m15_s1', s2Key: 'r32_m15_s2', label: 'M42 (R32-15)' }}
                r32TargetKey="r16_m8_p1"
              />
            }
            r32Block4={
              <R32PairBlock
                topMatch={{ num: 26, target: 'r32_m16_p1' }}
                bottomItem={{ type: 'match', num: 27, target: 'r32_m16_p2' }}
                r32Match={{ num: 43, p1Key: 'r32_m16_p1', p2Key: 'r32_m16_p2', s1Key: 'r32_m16_s1', s2Key: 'r32_m16_s2', label: 'M43 (R32-16)' }}
                r32TargetKey="r16_m8_p2"
              />
            }
            r16BottomMatch={{ num: 51, p1Key: 'r16_m8_p1', p2Key: 'r16_m8_p2', s1Key: 'r16_m8_s1', s2Key: 'r16_m8_s2' }}
            qfMatch={{ num: 4, p1Key: 'qf_m4_p1', p2Key: 'qf_m4_p2', s1Key: 'qf_m4_s1', s2Key: 'qf_m4_s2' }}
          />

        </div>
      )}

      {/* =========================================================================
          FINALS: 8 BESAR, SEMIFINAL & GRAND FINAL
         ========================================================================= */}
      {viewMode === 'finals' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* QF Column */}
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 p-2.5 rounded-xl text-center font-display font-bold text-xs text-red-700">
                PEREMPAT FINAL (8 BESAR)
              </div>
              <div className="space-y-4">
                {Array.from({ length: 4 }, (_, i) => {
                  const m = i + 1;
                  const sfTarget = `sf_m${Math.ceil(m / 2)}_p${m % 2 === 1 ? '1' : '2'}`;
                  return (
                    <MatchCard
                      key={`admin-finals-qf-${m}`}
                      matchLabel={`QF ${m} (Match ${51 + m})`}
                      p1Key={`qf_m${m}_p1`}
                      p2Key={`qf_m${m}_p2`}
                      s1Key={`qf_m${m}_s1`}
                      s2Key={`qf_m${m}_s2`}
                      targetKey={sfTarget}
                    />
                  );
                })}
              </div>
            </div>

            {/* SF Column */}
            <div className="space-y-4">
              <div className="bg-slate-900 text-white p-2.5 rounded-xl text-center font-display font-bold text-xs">
                SEMIFINAL (4 BESAR)
              </div>
              <div className="space-y-6 pt-4">
                {Array.from({ length: 2 }, (_, i) => {
                  const sfNum = i + 1;
                  return (
                    <div key={`admin-finals-sf-${sfNum}`} className="bg-white border-2 border-red-200 rounded-xl p-3 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-red-800">SEMIFINAL {sfNum}</span>
                        <span className="text-[10px] text-slate-400 font-mono">BO3</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={bracketData[`sf_m${sfNum}_p1`] || ''}
                            onChange={(e) => updateSlot(`sf_m${sfNum}_p1`, e.target.value)}
                            placeholder={`Pemenang QF ${sfNum * 2 - 1}`}
                            className="w-full bg-slate-50 border border-slate-200 text-xs font-bold px-2 py-1 rounded outline-none"
                          />
                          <input
                            type="number"
                            value={bracketData[`sf_m${sfNum}_s1`] || ''}
                            onChange={(e) => updateSlot(`sf_m${sfNum}_s1`, e.target.value)}
                            placeholder="0"
                            className="w-8 text-center bg-white border border-slate-200 text-xs font-mono font-bold py-1 rounded"
                          />
                        </div>
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => advanceTeam(`sf_m${sfNum}_p1`, `gf_p${sfNum}`, `sf_m${sfNum}_s1`, '2')}
                            className="px-2 py-0.5 bg-amber-50 hover:bg-amber-500 text-amber-900 hover:text-white rounded text-[10px] font-bold border border-amber-200 transition"
                          >
                            🏆 Ke Final
                          </button>
                          <button
                            onClick={() => advanceTeam(`sf_m${sfNum}_p1`, `bronze_p${sfNum}`)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-700 text-slate-700 hover:text-white rounded text-[10px] font-bold border border-slate-200 transition"
                          >
                            🥉 Juara 3
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={bracketData[`sf_m${sfNum}_p2`] || ''}
                            onChange={(e) => updateSlot(`sf_m${sfNum}_p2`, e.target.value)}
                            placeholder={`Pemenang QF ${sfNum * 2}`}
                            className="w-full bg-slate-50 border border-slate-200 text-xs font-bold px-2 py-1 rounded outline-none"
                          />
                          <input
                            type="number"
                            value={bracketData[`sf_m${sfNum}_s2`] || ''}
                            onChange={(e) => updateSlot(`sf_m${sfNum}_s2`, e.target.value)}
                            placeholder="0"
                            className="w-8 text-center bg-white border border-slate-200 text-xs font-mono font-bold py-1 rounded"
                          />
                        </div>
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => advanceTeam(`sf_m${sfNum}_p2`, `gf_p${sfNum}`, `sf_m${sfNum}_s2`, '2')}
                            className="px-2 py-0.5 bg-amber-50 hover:bg-amber-500 text-amber-900 hover:text-white rounded text-[10px] font-bold border border-amber-200 transition"
                          >
                            🏆 Ke Final
                          </button>
                          <button
                            onClick={() => advanceTeam(`sf_m${sfNum}_p2`, `bronze_p${sfNum}`)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-700 text-slate-700 hover:text-white rounded text-[10px] font-bold border border-slate-200 transition"
                          >
                            🥉 Juara 3
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Finals & Podium Column */}
            <div className="space-y-4">
              <div className="bg-white border-2 border-amber-400 rounded-2xl p-4 shadow-sm space-y-2.5">
                <span className="font-display font-extrabold text-xs text-amber-900 flex items-center gap-1">
                  <Crown className="w-4 h-4 text-amber-600" /> 👑 GRAND FINAL (BO5)
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1 bg-amber-50/50 p-1.5 rounded-lg border border-amber-200">
                    <input
                      type="text"
                      value={bracketData['gf_p1'] || ''}
                      onChange={(e) => updateSlot('gf_p1', e.target.value)}
                      placeholder="Finalis 1 (Pemenang SF 1)"
                      className="w-full bg-transparent text-xs font-bold outline-none"
                    />
                    <button
                      onClick={() => {
                        advanceTeam('gf_p1', 'podium_1', 'gf_s1', '3');
                        if (bracketData['gf_p2']) advanceTeam('gf_p2', 'podium_2');
                      }}
                      className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold"
                    >
                      👑 Juara 1
                    </button>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50/50 p-1.5 rounded-lg border border-amber-200">
                    <input
                      type="text"
                      value={bracketData['gf_p2'] || ''}
                      onChange={(e) => updateSlot('gf_p2', e.target.value)}
                      placeholder="Finalis 2 (Pemenang SF 2)"
                      className="w-full bg-transparent text-xs font-bold outline-none"
                    />
                    <button
                      onClick={() => {
                        advanceTeam('gf_p2', 'podium_1', 'gf_s2', '3');
                        if (bracketData['gf_p1']) advanceTeam('gf_p1', 'podium_2');
                      }}
                      className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold"
                    >
                      👑 Juara 1
                    </button>
                  </div>
                </div>
              </div>

              {/* Bronze Match */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
                <span className="font-display font-bold text-xs text-slate-700">🥉 Perebutan Juara 3</span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={bracketData['bronze_p1'] || ''}
                      onChange={(e) => updateSlot('bronze_p1', e.target.value)}
                      placeholder="Kalah SF 1"
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-2 py-1 rounded outline-none"
                    />
                    <button
                      onClick={() => advanceTeam('bronze_p1', 'podium_3', 'bronze_s1', '2')}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-600 text-amber-900 hover:text-white rounded text-[10px] font-bold border border-amber-200 transition"
                    >
                      🥉 Juara 3
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={bracketData['bronze_p2'] || ''}
                      onChange={(e) => updateSlot('bronze_p2', e.target.value)}
                      placeholder="Kalah SF 2"
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-2 py-1 rounded outline-none"
                    />
                    <button
                      onClick={() => advanceTeam('bronze_p2', 'podium_3', 'bronze_s2', '2')}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-600 text-amber-900 hover:text-white rounded text-[10px] font-bold border border-amber-200 transition"
                    >
                      🥉 Juara 3
                    </button>
                  </div>
                </div>
              </div>

              {/* Podium Box */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-red-600/30 text-center space-y-2">
                <h4 className="font-display font-bold text-xs uppercase text-amber-400">🏆 PODIUM JUARA FIESTA HISTORIA</h4>
                <div className="space-y-1.5 text-left text-xs">
                  <div className="bg-amber-500/20 p-2 rounded-xl border border-amber-500/40">
                    <span className="text-[10px] font-mono text-amber-400 font-bold block">🥇 JUARA 1:</span>
                    <input
                      type="text"
                      value={bracketData['podium_1'] || ''}
                      onChange={(e) => updateSlot('podium_1', e.target.value)}
                      placeholder="Juara 1 Turnamen"
                      className="w-full bg-transparent text-xs font-bold text-white outline-none"
                    />
                  </div>
                  <div className="bg-slate-800 p-2 rounded-xl border border-slate-700">
                    <span className="text-[10px] font-mono text-slate-400 font-bold block">🥈 JUARA 2:</span>
                    <input
                      type="text"
                      value={bracketData['podium_2'] || ''}
                      onChange={(e) => updateSlot('podium_2', e.target.value)}
                      placeholder="Juara 2 Turnamen"
                      className="w-full bg-transparent text-xs font-bold text-white outline-none"
                    />
                  </div>
                  <div className="bg-amber-900/20 p-2 rounded-xl border border-amber-800/40">
                    <span className="text-[10px] font-mono text-amber-600 font-bold block">🥉 JUARA 3:</span>
                    <input
                      type="text"
                      value={bracketData['podium_3'] || ''}
                      onChange={(e) => updateSlot('podium_3', e.target.value)}
                      placeholder="Juara 3 Turnamen"
                      className="w-full bg-transparent text-xs font-bold text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          LIST MODE: 58 MATCH TABLE
         ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama tim atau nomor match..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-red-500"
              />
            </div>
            <span className="text-xs font-mono text-slate-500 font-bold">
              {filteredMatches.length} Pertandingan
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Match</th>
                    <th className="px-4 py-3">Babak & Sesi</th>
                    <th className="px-4 py-3">Tim 1</th>
                    <th className="px-2 py-3 text-center">Skor</th>
                    <th className="px-4 py-3">Tim 2</th>
                    <th className="px-4 py-3 text-center">Aksi / Lolos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-body">
                  {filteredMatches.map((m) => {
                    const p1 = bracketData[m.p1Key] || '';
                    const p2 = bracketData[m.p2Key] || '';
                    const s1 = bracketData[m.s1Key] || '';
                    const s2 = bracketData[m.s2Key] || '';

                    return (
                      <tr key={`admin-list-${m.id}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-red-600 whitespace-nowrap">
                          {m.label}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-900 block">{m.round}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{m.session}</span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={p1}
                            onChange={(e) => updateSlot(m.p1Key, e.target.value)}
                            placeholder="Tim 1"
                            className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-2 py-1.5 rounded-lg outline-none focus:border-red-500 focus:bg-white"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              value={s1}
                              onChange={(e) => updateSlot(m.s1Key, e.target.value)}
                              placeholder="0"
                              className="w-8 text-center bg-slate-100 border border-slate-200 text-xs font-mono font-bold py-1 rounded"
                            />
                            <span className="text-slate-400 font-bold">-</span>
                            <input
                              type="number"
                              value={s2}
                              onChange={(e) => updateSlot(m.s2Key, e.target.value)}
                              placeholder="0"
                              className="w-8 text-center bg-slate-100 border border-slate-200 text-xs font-mono font-bold py-1 rounded"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={p2}
                            onChange={(e) => updateSlot(m.p2Key, e.target.value)}
                            placeholder={m.isBye ? "★ BYE Slot" : "Tim 2"}
                            className={cn(
                              "w-full border text-xs font-semibold px-2 py-1.5 rounded-lg outline-none focus:border-red-500 focus:bg-white",
                              m.isBye ? "bg-amber-50 border-amber-300 text-amber-900 italic font-bold" : "bg-slate-50 border-slate-200"
                            )}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {p1 && m.targetP1 && (
                              <button
                                onClick={() => advanceTeam(m.p1Key, m.targetP1, m.s1Key, '1')}
                                className="px-2 py-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded text-[10px] font-bold border border-red-200 transition"
                                title={`Loloskan ${p1}`}
                              >
                                👉 T1
                              </button>
                            )}
                            {p2 && m.targetP1 && (
                              <button
                                onClick={() => advanceTeam(m.p2Key, m.targetP1, m.s2Key, '1')}
                                className="px-2 py-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded text-[10px] font-bold border border-red-200 transition"
                                title={`Loloskan ${p2}`}
                              >
                                👉 T2
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-display font-bold text-lg text-slate-900">Kosongkan Semua Bagan?</h3>
              <p className="text-xs text-slate-500 font-body">
                Semua nama tim dan skor yang sudah tersimpan di browser ini akan dihapus.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
              >
                Ya, Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
