import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegion } from '@/contexts/RegionContext';
import { gatewaysFor, tuitionFor, type PaymentGateway } from '@/lib/payments';
import { formatCurrency } from '@/lib/intl';
import {
  Wallet, CreditCard, Smartphone, Building2, Bitcoin, Banknote,
  Check, ShieldCheck, Info, ArrowRight,
} from 'lucide-react';

const kindIcons: Record<string, React.ReactNode> = {
  card: <CreditCard size={16} />,
  bank: <Building2 size={16} />,
  'mobile-money': <Smartphone size={16} />,
  wallet: <Wallet size={16} />,
  crypto: <Bitcoin size={16} />,
  sepa: <Banknote size={16} />,
  ach: <Banknote size={16} />,
};

export default function BillingPage() {
  const { t } = useTranslation();
  const { region, regionId, locale, currency } = useRegion();
  const [programType, setProgramType] = useState('B.Sc.');
  const [level, setLevel] = useState(300);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [showStub, setShowStub] = useState(false);

  const tuition = useMemo(
    () => tuitionFor(regionId, programType, level, currency),
    [regionId, programType, level, currency],
  );

  const platformFeeBps = 0;
  const gatewayFee = useMemo(() => {
    if (!selectedGateway) return 0;
    const gw = gatewaysFor(regionId).find((g) => g.id === selectedGateway);
    return gw ? Math.round(tuition * (gw.feeBps / 10000)) : 0;
  }, [selectedGateway, tuition, regionId]);

  const total = tuition + gatewayFee + Math.round(tuition * (platformFeeBps / 10000));
  const eligibleGateways = gatewaysFor(regionId, currency);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Billing & Tuition</h2>
          <p className="text-sm text-gray-500">
            Region-priced tuition · {region.flagEmoji} {region.name} · settled in {currency}
          </p>
        </div>
        <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
          {region.complianceFrameworks.slice(0, 2).join(' · ')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tuition calculator */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">Tuition</h3>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Programme</label>
            <select
              value={programType}
              onChange={(e) => setProgramType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option>B.Sc.</option>
              <option>M.Sc.</option>
              <option>PhD</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Level / Year</label>
            <select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value={100}>Year 1</option>
              <option value={200}>Year 2</option>
              <option value={300}>Year 3</option>
              <option value={400}>Year 4</option>
            </select>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tuition</span>
              <span>{formatCurrency(tuition, currency, locale)}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-xs">
              <span>Gateway fee</span>
              <span>{formatCurrency(gatewayFee, currency, locale)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total due</span>
              <span style={{ color: 'var(--region-primary)' }}>
                {formatCurrency(total, currency, locale)}
              </span>
            </div>
          </div>

          <button
            disabled={!selectedGateway}
            onClick={() => setShowStub(true)}
            className="w-full px-4 py-2.5 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            style={{ background: 'var(--region-primary)' }}
          >
            Pay {formatCurrency(total, currency, locale)} <ArrowRight size={14} />
          </button>
        </div>

        {/* Gateway picker */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Select payment method</h3>
            <span className="text-xs text-gray-500">
              {eligibleGateways.length} available in {region.name}
            </span>
          </div>

          {eligibleGateways.length === 0 && (
            <div className="p-4 bg-amber-50 text-amber-700 rounded-xl text-sm flex items-center gap-2">
              <Info size={16} /> No gateway supports {currency} in {region.name}. Switch currency in Settings.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {eligibleGateways.map((gw) => (
              <GatewayCard
                key={gw.id}
                gateway={gw}
                selected={selectedGateway === gw.id}
                currency={currency}
                onSelect={() => setSelectedGateway(gw.id)}
              />
            ))}
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck size={14} className="text-emerald-500" />
            Funds settled to institution treasury · 3DS / SCA where required ·
            audit-logged per {region.complianceFrameworks[0]}.
          </div>
        </div>
      </div>

      {showStub && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowStub(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <Info size={28} className="mx-auto text-blue-500" />
            <h3 className="text-lg font-bold">Payment scaffold</h3>
            <p className="text-sm text-gray-600">
              {selectedGateway} integration is not yet wired. The full pipeline (intent → 3DS → webhook → ledger entry) lands in Phase 2.
            </p>
            <button
              onClick={() => setShowStub(false)}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GatewayCard({
  gateway, selected, currency, onSelect,
}: { gateway: PaymentGateway; selected: boolean; currency: string; onSelect: () => void; }) {
  const supportsCurrency = gateway.currencies.includes(currency);

  return (
    <button
      onClick={onSelect}
      className={`text-left p-3 rounded-xl border-2 transition-all ${
        selected
          ? 'shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      style={selected ? {
        borderColor: 'var(--region-primary)',
        background: 'color-mix(in srgb, var(--region-primary) 8%, white)',
      } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900">{gateway.name}</span>
            {selected && (
              <span
                className="text-white p-0.5 rounded-full"
                style={{ background: 'var(--region-primary)' }}
              >
                <Check size={10} />
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 leading-snug">{gateway.description}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {gateway.kinds.map((k) => (
              <span key={k} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-[10px] uppercase rounded text-gray-600">
                {kindIcons[k]} {k}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right text-[10px] text-gray-400 shrink-0">
          <p>{(gateway.feeBps / 100).toFixed(2)}% fee</p>
          {!supportsCurrency && (
            <p className="text-amber-600 mt-1">no {currency}</p>
          )}
        </div>
      </div>
    </button>
  );
}
