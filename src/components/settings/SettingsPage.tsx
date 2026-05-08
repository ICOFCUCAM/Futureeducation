import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useRegion } from '@/contexts/RegionContext';
import { useGrading } from '@/hooks/useGrading';
import { regionList, type RegionId } from '@/regions';
import { formatCurrency } from '@/lib/intl';
import {
  User, Shield, Bell, Database, Save, CheckCircle2, Globe2, ArrowRight
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { region, regionId, locale, currency, setRegion, setLocale, setCurrency, openPicker } = useRegion();
  const grading = useGrading();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+234 801 234 5678',
    department: 'Computer Science',
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabs = [
    { id: 'profile', label: t('settings.tabs.profile'), icon: <User size={16} /> },
    { id: 'region', label: t('settings.tabs.region'), icon: <Globe2 size={16} /> },
    { id: 'grading', label: t('settings.tabs.grading'), icon: <Database size={16} /> },
    { id: 'notifications', label: t('settings.tabs.notifications'), icon: <Bell size={16} /> },
    { id: 'security', label: t('settings.tabs.security'), icon: <Shield size={16} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">{t('settings.title')}</h2>
        <p className="text-sm text-gray-500">{t('settings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 h-fit">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === tab.id ? 'bg-[#1a237e] text-white font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Profile Settings</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <img src={user?.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-blue-100" />
                <div>
                  <p className="font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                  <button className="text-xs text-blue-600 hover:underline mt-1">Change Photo</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                  <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                  <input value={profile.department} disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
                </div>
              </div>
              <button onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1a237e] text-white rounded-xl text-sm font-medium hover:bg-[#283593] transition-colors">
                {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
              </button>
            </div>
          )}

          {activeTab === 'region' && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{t('settings.region.heading')}</h3>
                  <p className="text-sm text-gray-500">
                    Tailors grading, currency, calendar, language and compliance to your part of the world.
                  </p>
                </div>
                <button
                  onClick={openPicker}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1a237e] text-white rounded-lg text-sm font-medium hover:bg-[#283593]"
                >
                  {t('settings.region.changeRegion')} <ArrowRight size={14} />
                </button>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{region.flagEmoji}</span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">{t('settings.region.currentRegion')}</p>
                    <p className="font-bold text-gray-800">{region.name}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-3">{region.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-xs">
                  <div><p className="text-gray-500">Credit system</p><p className="font-medium">{region.creditSystem.unit}</p></div>
                  <div><p className="text-gray-500">GPA scale</p><p className="font-medium">/{region.gpaScaleMax.toFixed(1)}</p></div>
                  <div><p className="text-gray-500">Calendar</p><p className="font-medium">{region.academicCalendar.description}</p></div>
                  <div><p className="text-gray-500">Compliance</p><p className="font-medium">{region.complianceFrameworks.slice(0, 2).join(', ')}</p></div>
                  <div><p className="text-gray-500">Payments</p><p className="font-medium">{region.paymentGateways.slice(0, 2).join(', ')}</p></div>
                  <div><p className="text-gray-500">Sample currency</p><p className="font-medium">{formatCurrency(1000, currency, locale)}</p></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('settings.region.language')}</label>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {region.supportedLocales.map((l) => (
                      <option key={l} value={l}>{l.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('settings.region.currency')}</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {region.currencies.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('settings.region.timezone')}</label>
                  <input
                    value={region.defaultTimezone}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">All regions</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {regionList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRegion(r.id as RegionId)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        regionId === r.id
                          ? 'border-[#1a237e] bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{r.flagEmoji}</span>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{r.name}</p>
                          <p className="text-[10px] text-gray-500">{r.defaultCurrency} · {r.creditSystem.unit}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'grading' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800">{t('grading.scaleTitle')} — {region.name}</h3>
                <p className="text-sm text-gray-500">
                  Region-aware. Switch region to see a different scale.
                </p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">{t('grading.scoreRange')}</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500">{t('grading.grade')}</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500">{t('grading.gradePoint')}</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">{t('grading.remark')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {grading.scale.map((g) => (
                    <tr key={g.grade} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{g.minScore} - {g.maxScore}</td>
                      <td className="px-4 py-2 text-sm text-center font-bold">{g.grade}</td>
                      <td className="px-4 py-2 text-sm text-center">{g.gradePoint}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{g.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700 font-medium">GPA Formula</p>
                <p className="text-xs text-blue-600 mt-1 font-mono">{t('grading.gpa')} = Σ({t('grading.gradePoint')} × {region.creditSystem.unit}) / Σ({region.creditSystem.unit})</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-amber-700 font-medium">{t('grading.classification')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-xs text-amber-700">
                  {grading.classification.map((c) => (
                    <p key={c.label}>≥ {c.minCgpa.toFixed(2)}: {c.label}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Notification Preferences</h3>
              {[
                { label: 'Result Notifications', desc: 'Get notified when results are submitted or approved' },
                { label: 'Exam Reminders', desc: 'Receive reminders before scheduled exams' },
                { label: 'Course Updates', desc: 'New materials and announcements' },
                { label: 'System Alerts', desc: 'Important system maintenance notices' },
                { label: 'Email Notifications', desc: 'Receive notifications via email' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1a237e]"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Security Settings</h3>
              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
                  <input type="password" placeholder="Enter current password"
                    className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
                  <input type="password" placeholder="Enter new password"
                    className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Confirm Password</label>
                  <input type="password" placeholder="Confirm new password"
                    className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <button className="px-4 py-2 bg-[#1a237e] text-white rounded-lg text-sm font-medium hover:bg-[#283593] transition-colors">
                  Update Password
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Two-Factor Authentication</h4>
                <p className="text-xs text-gray-500 mb-3">Add an extra layer of security to your account</p>
                <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
