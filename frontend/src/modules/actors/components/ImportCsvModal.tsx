import React, { useRef, useState, useCallback } from 'react';
import { Upload, FileText, X, Download, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImportError { line: number; reason: string; }
interface ImportResult { imported: number; skipped: number; errors: ImportError[]; }

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

// ─── CSV Template ─────────────────────────────────────────────────────────────

const CSV_TEMPLATE = [
    'firstName,lastName,companyName,email,phone,address,type,tags',
    'Jean,Dupont,,jean.dupont@email.com,0612345678,12 rue de la Paix Paris,INDIVIDUAL,vip',
    ',,Acme Corp,contact@acme.com,0198765432,45 avenue des Champs Paris,CORPORATE,prospect',
].join('\n');

const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modele-clients.csv';
    a.click();
    URL.revokeObjectURL(url);
};

// ─── Simple CSV preview parser ────────────────────────────────────────────────

const parsePreview = (text: string): { headers: string[]; rows: string[][] } => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return { headers: [], rows: [] };
    const split = (line: string) =>
        line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
    const headers = split(lines[0]);
    const rows = lines.slice(1, 4).map(split); // max 3 preview rows
    return { headers, rows };
};

// ─── Component ────────────────────────────────────────────────────────────────

export const ImportCsvModal: React.FC<Props> = ({ onClose, onSuccess }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile]         = useState<File | null>(null);
    const [preview, setPreview]   = useState<{ headers: string[]; rows: string[][] } | null>(null);
    const [dragging, setDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [importing, setImporting] = useState(false);
    const [result, setResult]     = useState<ImportResult | null>(null);
    const [error, setError]       = useState('');

    const handleFile = useCallback((f: File) => {
        setFile(f);
        setResult(null);
        setError('');
        setProgress(0);
        const reader = new FileReader();
        reader.onload = e => {
            const text = e.target?.result as string;
            setPreview(parsePreview(text));
        };
        reader.readAsText(f);
    }, []);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f);
    };

    const handleImport = async () => {
        if (!file) return;
        setImporting(true);
        setError('');
        setProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post<ImportResult>('/actors/import-csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: e => {
                    if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
                },
            });
            setResult(res.data);
            setProgress(100);
            if (res.data.imported > 0) {
                setTimeout(onSuccess, 1500);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Erreur lors de l\'import.');
        } finally {
            setImporting(false);
        }
    };

    return (
        // Overlay
        <div
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 200,
            }}
        >
            <div style={{
                background: '#fff',
                borderRadius: '1rem',
                width: '580px',
                maxWidth: '95vw',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid #f3f4f6',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <Upload size={18} color="#4f46e5" />
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                            Importer des clients (CSV)
                        </span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Template download */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '0.625rem' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Modèle CSV</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.125rem' }}>Téléchargez le modèle pour préparer votre fichier</div>
                        </div>
                        <button
                            onClick={downloadTemplate}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.5rem 0.875rem',
                                background: '#fff', border: '1px solid #d1d5db',
                                borderRadius: '0.5rem', cursor: 'pointer',
                                fontSize: '0.8125rem', fontWeight: 600, color: '#374151',
                            }}
                        >
                            <Download size={14} /> Télécharger
                        </button>
                    </div>

                    {/* Drag & drop zone */}
                    {!result && (
                        <div
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: `2px dashed ${dragging ? '#4f46e5' : file ? '#a7f3d0' : '#d1d5db'}`,
                                borderRadius: '0.75rem',
                                padding: '2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: dragging ? '#eef2ff' : file ? '#f0fdf4' : '#fafafa',
                                transition: 'all 0.15s',
                            }}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,text/csv"
                                style={{ display: 'none' }}
                                onChange={onFileChange}
                            />
                            {file ? (
                                <>
                                    <FileText size={32} color="#047857" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem' }}>{file.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                        {(file.size / 1024).toFixed(1)} Ko — Cliquer pour changer
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Upload size={32} color="#9ca3af" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                                    <div style={{ fontWeight: 600, color: '#374151' }}>Glissez votre fichier CSV ici</div>
                                    <div style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: '0.375rem' }}>ou cliquez pour choisir un fichier</div>
                                </>
                            )}
                        </div>
                    )}

                    {/* CSV Preview */}
                    {preview && preview.headers.length > 0 && !result && (
                        <div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                Aperçu ({preview.rows.length} ligne{preview.rows.length > 1 ? 's' : ''})
                            </div>
                            <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f9fafb' }}>
                                            {preview.headers.map(h => (
                                                <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.rows.map((row, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                {row.map((cell, j) => (
                                                    <td key={j} style={{ padding: '0.5rem 0.75rem', color: '#374151', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {cell || <span style={{ color: '#d1d5db' }}>—</span>}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Progress bar */}
                    {importing && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.375rem' }}>
                                <span>Importation en cours…</span>
                                <span>{progress}%</span>
                            </div>
                            <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${progress}%`,
                                    background: '#4f46e5',
                                    borderRadius: '9999px',
                                    transition: 'width 0.3s',
                                }} />
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.875rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#b91c1c', fontSize: '0.875rem' }}>
                            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                            {error}
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ flex: 1, padding: '1rem', background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: '0.625rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#047857' }}>{result.imported}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }}>importés</div>
                                </div>
                                <div style={{ flex: 1, padding: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.625rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#b45309' }}>{result.skipped}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>ignorés</div>
                                </div>
                            </div>
                            {result.errors.length > 0 && (
                                <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem' }}>
                                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#b91c1c', marginBottom: '0.375rem' }}>
                                        Erreurs ({result.errors.length})
                                    </div>
                                    <ul style={{ margin: 0, padding: '0 0 0 1rem' }}>
                                        {result.errors.slice(0, 10).map((e, i) => (
                                            <li key={i} style={{ fontSize: '0.75rem', color: '#7f1d1d', marginBottom: '0.125rem' }}>
                                                Ligne {e.line} : {e.reason}
                                            </li>
                                        ))}
                                        {result.errors.length > 10 && (
                                            <li style={{ fontSize: '0.75rem', color: '#9ca3af' }}>… et {result.errors.length - 10} autres erreurs</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                            {result.imported > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#047857' }}>
                                    <CheckCircle size={15} />
                                    La liste des clients va se recharger automatiquement…
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer buttons */}
                    {!result && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.25rem' }}>
                            <button
                                onClick={onClose}
                                style={{ padding: '0.625rem 1.125rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={!file || importing}
                                style={{
                                    padding: '0.625rem 1.25rem',
                                    background: file && !importing ? '#4f46e5' : '#a5b4fc',
                                    color: '#fff', border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: file && !importing ? 'pointer' : 'not-allowed',
                                    fontSize: '0.875rem', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                }}
                            >
                                <Upload size={15} />
                                {importing ? 'Importation…' : 'Importer'}
                            </button>
                        </div>
                    )}
                    {result && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={onClose}
                                style={{ padding: '0.625rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                            >
                                Fermer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
