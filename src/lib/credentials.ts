// ============================================
// W3C Verifiable Credentials (VC 2.0) helpers
// ----
// Implements a minimal, browser-native Ed25519 / ECDSA JWS pipeline
// suitable for issuing transcripts and degree certificates as
// portable, tamper-evident credentials. The signing key is generated
// per-institution and persisted in localStorage as a JWK; in
// production it lives in a confidential-compute KMS / HSM.
// ============================================

const STORAGE_KEY = 'futureedu.issuer.signingkey.jwk';
const STORAGE_DID = 'futureedu.issuer.did';
const ALG = 'ECDSA';
const CURVE = 'P-256';

export interface IssuerKey {
  did: string;
  publicJwk: JsonWebKey;
  privateJwk: JsonWebKey;
}

export interface VerifiableCredential {
  '@context': string[];
  type: string[];
  id: string;
  issuer: string;
  validFrom: string;
  validUntil?: string;
  credentialSubject: Record<string, unknown>;
  proof?: CredentialProof;
}

export interface CredentialProof {
  type: 'DataIntegrityProof';
  cryptosuite: 'ecdsa-jcs-2019';
  created: string;
  verificationMethod: string;
  proofPurpose: 'assertionMethod';
  proofValue: string;
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < arr.byteLength; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(s: string): Uint8Array {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function importPrivate(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey('jwk', jwk, { name: ALG, namedCurve: CURVE }, false, ['sign']);
}

async function importPublic(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey('jwk', jwk, { name: ALG, namedCurve: CURVE }, true, ['verify']);
}

export async function getOrCreateIssuerKey(institutionDomain = 'futech.edu.ng'): Promise<IssuerKey> {
  const cached = localStorage.getItem(STORAGE_KEY);
  const cachedDid = localStorage.getItem(STORAGE_DID);
  if (cached && cachedDid) {
    const { publicJwk, privateJwk } = JSON.parse(cached);
    return { did: cachedDid, publicJwk, privateJwk };
  }
  const keyPair = await crypto.subtle.generateKey(
    { name: ALG, namedCurve: CURVE },
    true,
    ['sign', 'verify'],
  );
  const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
  const did = `did:web:${institutionDomain}`;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ publicJwk, privateJwk }));
  localStorage.setItem(STORAGE_DID, did);
  return { did, publicJwk, privateJwk };
}

function jcsCanonicalize(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(jcsCanonicalize).join(',')}]`;
  const keys = Object.keys(obj as object).sort();
  const entries = keys.map((k) => `${JSON.stringify(k)}:${jcsCanonicalize((obj as Record<string, unknown>)[k])}`);
  return `{${entries.join(',')}}`;
}

async function digest(input: string): Promise<ArrayBuffer> {
  const data = new TextEncoder().encode(input);
  return crypto.subtle.digest('SHA-256', data);
}

export async function signCredential(
  unsigned: Omit<VerifiableCredential, 'proof'>,
  issuerKey: IssuerKey,
): Promise<VerifiableCredential> {
  const canonical = jcsCanonicalize(unsigned);
  const hash = await digest(canonical);
  const privateKey = await importPrivate(issuerKey.privateJwk);
  const signature = await crypto.subtle.sign(
    { name: ALG, hash: { name: 'SHA-256' } },
    privateKey,
    hash,
  );
  return {
    ...unsigned,
    proof: {
      type: 'DataIntegrityProof',
      cryptosuite: 'ecdsa-jcs-2019',
      created: new Date().toISOString(),
      verificationMethod: `${issuerKey.did}#assertion-key`,
      proofPurpose: 'assertionMethod',
      proofValue: bytesToBase64Url(signature),
    },
  };
}

export async function verifyCredential(
  credential: VerifiableCredential,
  publicJwk: JsonWebKey,
): Promise<boolean> {
  if (!credential.proof) return false;
  const { proof, ...unsigned } = credential;
  const canonical = jcsCanonicalize(unsigned);
  const hash = await digest(canonical);
  const publicKey = await importPublic(publicJwk);
  const sig = base64UrlToBytes(proof.proofValue);
  return crypto.subtle.verify(
    { name: ALG, hash: { name: 'SHA-256' } },
    publicKey,
    sig.buffer.slice(sig.byteOffset, sig.byteOffset + sig.byteLength) as ArrayBuffer,
    hash,
  );
}

export interface TranscriptVCInput {
  studentName: string;
  studentId: string;
  institution: string;
  region: string;
  cgpa: number;
  scaleMax: number;
  classification: string;
  totalCredits: number;
  creditUnit: string;
  programme: string;
  issuedAt?: Date;
}

export async function buildTranscriptCredential(
  input: TranscriptVCInput,
  issuerKey: IssuerKey,
): Promise<VerifiableCredential> {
  const issuedAt = input.issuedAt || new Date();
  const id = `urn:uuid:${cryptoRandomUuid()}`;
  const unsigned: Omit<VerifiableCredential, 'proof'> = {
    '@context': [
      'https://www.w3.org/ns/credentials/v2',
      'https://www.w3.org/ns/credentials/examples/v2',
    ],
    type: ['VerifiableCredential', 'AcademicTranscript'],
    id,
    issuer: issuerKey.did,
    validFrom: issuedAt.toISOString(),
    credentialSubject: {
      id: `urn:student:${input.studentId}`,
      name: input.studentName,
      institution: input.institution,
      region: input.region,
      programme: input.programme,
      cgpa: input.cgpa,
      cgpaScaleMax: input.scaleMax,
      classification: input.classification,
      totalCredits: input.totalCredits,
      creditUnit: input.creditUnit,
    },
  };
  return signCredential(unsigned, issuerKey);
}

export interface DegreeVCInput extends TranscriptVCInput {
  degreeType: string;
  conferralDate: Date;
}

export async function buildDegreeCredential(
  input: DegreeVCInput,
  issuerKey: IssuerKey,
): Promise<VerifiableCredential> {
  const id = `urn:uuid:${cryptoRandomUuid()}`;
  const unsigned: Omit<VerifiableCredential, 'proof'> = {
    '@context': [
      'https://www.w3.org/ns/credentials/v2',
      'https://www.w3.org/ns/credentials/examples/v2',
    ],
    type: ['VerifiableCredential', 'DegreeCredential'],
    id,
    issuer: issuerKey.did,
    validFrom: input.conferralDate.toISOString(),
    credentialSubject: {
      id: `urn:student:${input.studentId}`,
      name: input.studentName,
      institution: input.institution,
      region: input.region,
      degree: {
        type: input.degreeType,
        programme: input.programme,
        classification: input.classification,
      },
      cgpa: input.cgpa,
      cgpaScaleMax: input.scaleMax,
      totalCredits: input.totalCredits,
      creditUnit: input.creditUnit,
    },
  };
  return signCredential(unsigned, issuerKey);
}

function cryptoRandomUuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function downloadCredential(credential: VerifiableCredential, filename: string) {
  const blob = new Blob([JSON.stringify(credential, null, 2)], {
    type: 'application/ld+json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
