import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRegion } from '@/contexts/RegionContext';
import { useGrading } from '@/hooks/useGrading';
import { sampleTranscriptData } from '@/lib/sampleData';
import { UNIVERSITY } from '@/lib/constants';
import {
  buildTranscriptCredential,
  buildDegreeCredential,
  downloadCredential,
  getOrCreateIssuerKey,
  verifyCredential,
  type IssuerKey,
  type VerifiableCredential,
} from '@/lib/credentials';
import {
  BadgeCheck, Download, ShieldCheck, ShieldAlert, FileJson,
  Key, Copy, Sparkles, Upload, ArrowRight,
} from 'lucide-react';

const STORAGE_LIST = 'futureedu.credentials.list';

interface StoredCredential {
  id: string;
  type: 'AcademicTranscript' | 'DegreeCredential';
  issuedAt: string;
  credential: VerifiableCredential;
}

function load(): StoredCredential[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_LIST) || '[]'); } catch { return []; }
}
function save(list: StoredCredential[]) { localStorage.setItem(STORAGE_LIST, JSON.stringify(list)); }

export default function CredentialsPage() {
  const { user } = useAuth();
  const { region } = useRegion();
  const { getClassification, scaleMax } = useGrading();
  const data = sampleTranscriptData;

  const [issuerKey, setIssuerKey] = useState<IssuerKey | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [list, setList] = useState<StoredCredential[]>([]);
  const [verifyResult, setVerifyResult] = useState<null | { ok: boolean; cred: VerifiableCredential }>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    setList(load());
    getOrCreateIssuerKey('futech.edu.ng').then(setIssuerKey);
  }, []);

  async function issueTranscript() {
    if (!issuerKey) return;
    setIssuing(true);
    const cred = await buildTranscriptCredential({
      studentName: `${data.student.first_name} ${data.student.last_name}`,
      studentId: data.student.matric_no,
      institution: UNIVERSITY.name,
      region: region.name,
      cgpa: data.cgpa,
      scaleMax,
      classification: getClassification(data.cgpa),
      totalCredits: data.totalCredits,
      creditUnit: region.creditSystem.unit,
      programme: `${data.student.degree_type} ${data.student.program}`,
    }, issuerKey);
    const stored: StoredCredential = {
      id: cred.id, type: 'AcademicTranscript',
      issuedAt: new Date().toISOString(), credential: cred,
    };
    const next = [stored, ...list];
    setList(next); save(next);
    setIssuing(false);
  }

  async function issueDegree() {
    if (!issuerKey) return;
    setIssuing(true);
    const cred = await buildDegreeCredential({
      studentName: `${data.student.first_name} ${data.student.last_name}`,
      studentId: data.student.matric_no,
      institution: UNIVERSITY.name,
      region: region.name,
      cgpa: data.cgpa,
      scaleMax,
      classification: getClassification(data.cgpa),
      totalCredits: data.totalCredits,
      creditUnit: region.creditSystem.unit,
      programme: `${data.student.degree_type} ${data.student.program}`,
      degreeType: data.student.degree_type,
      conferralDate: new Date(),
    }, issuerKey);
    const stored: StoredCredential = {
      id: cred.id, type: 'DegreeCredential',
      issuedAt: new Date().toISOString(), credential: cred,
    };
    const next = [stored, ...list];
    setList(next); save(next);
    setIssuing(false);
  }

  async function handleVerifyFile(file: File) {
    setVerifyError(null);
    setVerifyResult(null);
    if (!issuerKey) return;
    try {
      const text = await file.text();
      const cred: VerifiableCredential = JSON.parse(text);
      const ok = await verifyCredential(cred, issuerKey.publicJwk);
      setVerifyResult({ ok, cred });
    } catch (err) {
      setVerifyError((err as Error).message || 'Could not parse credential');
    }
  }

  function copyDid() {
    if (!issuerKey) return;
    navigator.clipboard?.writeText(issuerKey.did);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BadgeCheck size={22} style={{ color: 'var(--region-primary)' }} /> Verifiable Credentials
          </h2>
          <p className="text-sm text-gray-500">
            W3C VC 2.0 · ECDSA P-256 · DataIntegrityProof (ecdsa-jcs-2019)
          </p>
        </div>
      </div>

      {/* Issuer identity */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl text-white"
              style={{ background: 'var(--region-primary)' }}
            >
              <Key size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Issuer DID</p>
              <p className="font-mono text-sm font-semibold text-gray-800">
                {issuerKey?.did || 'Generating key…'}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {UNIVERSITY.name} · {region.name} · accredited by {region.accreditationBodies[0]}
              </p>
            </div>
          </div>
          <button
            onClick={copyDid}
            disabled={!issuerKey}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 disabled:opacity-50"
            title="Copy DID"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      {/* Issue actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActionCard
          title="Issue academic transcript"
          subtitle="Signed VC of CGPA, classification and credits."
          icon={<FileJson size={22} />}
          disabled={!issuerKey || issuing}
          onClick={issueTranscript}
        />
        <ActionCard
          title="Issue degree certificate"
          subtitle="Conferral-date credential with degree title."
          icon={<Sparkles size={22} />}
          disabled={!issuerKey || issuing}
          onClick={issueDegree}
        />
      </div>

      {/* Verify */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Verify a credential</h3>
          <span className="text-xs text-gray-500">Drop a .jsonld file</span>
        </div>
        <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50">
          <input
            type="file"
            accept="application/json,application/ld+json,.json,.jsonld"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleVerifyFile(e.target.files[0])}
          />
          <Upload size={24} className="mx-auto text-gray-400" />
          <p className="text-sm text-gray-600 mt-2">Click to choose a credential file</p>
          <p className="text-[11px] text-gray-400 mt-1">Verifies signature against this institution's DID.</p>
        </label>

        {verifyError && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{verifyError}</div>
        )}
        {verifyResult && (
          <div className={`mt-3 p-3 rounded-xl flex items-start gap-3 ${verifyResult.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {verifyResult.ok ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
            <div className="text-sm">
              <p className="font-semibold">
                {verifyResult.ok ? 'Signature valid' : 'Signature INVALID'}
              </p>
              <p className="text-xs opacity-80 mt-1">
                {verifyResult.cred.type.filter((t) => t !== 'VerifiableCredential').join(', ')} ·
                Issued by {verifyResult.cred.issuer} · ID {verifyResult.cred.id}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Issued list */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Issued credentials</h3>
          <span className="text-xs text-gray-500">{list.length} stored locally</span>
        </div>
        {list.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No credentials yet — issue one above.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {list.map((s) => (
              <li key={s.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--region-primary)' }}>
                      {s.type === 'DegreeCredential' ? 'DEGREE' : 'TRANSCRIPT'}
                    </span>
                    <span className="text-sm font-medium text-gray-800 truncate">{s.id}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Issued {new Date(s.issuedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => downloadCredential(s.credential, `${s.type}-${s.id.split(':').pop()}.jsonld`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg shrink-0"
                  style={{ background: 'var(--region-primary)' }}
                >
                  <Download size={12} /> Download
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-[11px] text-gray-500 leading-relaxed">
        Credentials are signed locally with a per-browser ECDSA P-256 key for demonstration.
        In production, issuance moves to a confidential-compute KMS / HSM, the DID resolves over
        <code className="px-1 py-0.5 bg-gray-100 rounded mx-1">did:web</code>
        from the institution's domain, and revocation lists land at
        <code className="px-1 py-0.5 bg-gray-100 rounded mx-1">/.well-known/did.json</code>.
      </div>
    </div>
  );
}

function ActionCard({
  title, subtitle, icon, disabled, onClick,
}: { title: string; subtitle: string; icon: React.ReactNode; disabled?: boolean; onClick: () => void; }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="text-left p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl text-white"
            style={{ background: 'var(--region-primary)' }}>
            {icon}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <ArrowRight size={16} className="text-gray-400" />
      </div>
    </button>
  );
}
