import React, { useState } from 'react';
import { useRegion } from '@/contexts/RegionContext';
import { regionList } from '@/regions';
import type { RegionId } from '@/regions';
import { Check, Globe2, X } from 'lucide-react';

export default function RegionPicker() {
  const { region, setRegion, setLocale, showPicker, closePicker, isFirstRun } = useRegion();
  const [selected, setSelected] = useState<RegionId>(region.id);

  if (!showPicker) return null;

  function confirm() {
    setRegion(selected);
    const next = regionList.find((r) => r.id === selected)!;
    setLocale(next.defaultLocale);
    closePicker();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#0f1a3c] to-[#1a237e] text-white px-6 py-5 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl">
              <Globe2 size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">{isFirstRun ? 'Welcome — choose your region' : 'Change region'}</h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Your region tailors grading, currency, calendar, language and compliance.
              </p>
            </div>
          </div>
          {!isFirstRun && (
            <button onClick={closePicker} className="p-1.5 hover:bg-white/15 rounded-lg" aria-label="Close">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {regionList.map((r) => {
            const isSelected = selected === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-[#1a237e] bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden>{r.flagEmoji}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{r.name}</h3>
                      <p className="text-[11px] text-gray-500">{r.creditSystem.unit} · {r.defaultCurrency} · GPA /{r.gpaScaleMax.toFixed(1)}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="p-1 bg-[#1a237e] text-white rounded-full">
                      <Check size={14} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-2 leading-snug">{r.description}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {r.supportedLocales.slice(0, 5).map((l) => (
                    <span key={l} className="px-1.5 py-0.5 bg-gray-100 text-[10px] uppercase rounded text-gray-600">
                      {l}
                    </span>
                  ))}
                  {r.rtl && (
                    <span className="px-1.5 py-0.5 bg-amber-100 text-[10px] uppercase rounded text-amber-700">
                      RTL
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-2">
          {!isFirstRun && (
            <button
              onClick={closePicker}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
          )}
          <button
            onClick={confirm}
            className="px-5 py-2 bg-[#1a237e] text-white text-sm font-semibold rounded-lg hover:bg-[#283593] shadow-lg shadow-blue-500/20"
          >
            {isFirstRun ? 'Get started' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
