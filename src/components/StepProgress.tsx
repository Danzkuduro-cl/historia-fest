'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, label: 'Tim', shortLabel: '01' },
  { id: 2, label: 'Pemain', shortLabel: '02' },
  { id: 3, label: 'Cadangan', shortLabel: '03' },
  { id: 4, label: 'Konfirmasi', shortLabel: '04' },
];

interface StepProgressProps {
  currentStep: number;
}

export default function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="flex items-center justify-between w-full px-2">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-display font-bold transition-all duration-300 border-2',
                currentStep === step.id
                  ? 'bg-red-600 border-red-600 text-white shadow-sm'
                  : currentStep > step.id
                  ? 'bg-red-50 border-red-600 text-red-600'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              )}
            >
              {currentStep > step.id ? (
                <Check className="w-4 h-4" />
              ) : (
                step.shortLabel
              )}
            </div>
            <span
              className={cn(
                'text-[10px] font-body font-medium tracking-wide whitespace-nowrap',
                currentStep === step.id
                  ? 'text-red-600 font-bold'
                  : currentStep > step.id
                  ? 'text-red-600/70'
                  : 'text-slate-400'
              )}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line */}
          {idx < STEPS.length - 1 && (
            <div className="flex-1 mx-2 mb-4">
              <div className="h-[2px] rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: currentStep > step.id ? '100%' : '0%',
                    background: 'linear-gradient(90deg, #DC2626, #111827)',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
