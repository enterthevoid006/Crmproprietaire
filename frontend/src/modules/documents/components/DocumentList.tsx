import { useRef, useState, useEffect } from 'react';
import { DocumentService } from '../services/document.service';
import type { Document } from '../services/document.service';
import { Upload, Download, Trash2, FolderOpen, FileText } from 'lucide-react';

interface DocumentListProps {
    actorId?: string;
    opportunityId?: string;
}

const getFileConfig = (mimeType: string, filename: string) => {
    const lower = filename.toLowerCase();
    if (mimeType === 'application/pdf' || lower.endsWith('.pdf'))
        return { color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', ext: 'PDF' };
    if (mimeType.includes('word') || /\.docx?$/.test(lower))
        return { color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd', ext: 'DOC' };
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || /\.xlsx?$/.test(lower))
        return { color: '#22c55e', bg: '#f0fdf4', border: '#86efac', ext: 'XLS' };
    if (mimeType.startsWith('image/'))
        return { color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7', ext: 'IMG' };
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation') || /\.pptx?$/.test(lower))
        return { color: '#f97316', bg: '#fff7ed', border: '#fdba74', ext: 'PPT' };
    return { color: '#6b7280', bg: '#f9fafb', border: '#d1d5db', ext: 'FILE' };
};

const formatBytes = (bytes: number) => {
    if (!bytes) return '0 o';
    const k = 1024;
    const sizes = ['o', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const DocumentList = ({ actorId, opportunityId }: DocumentListProps) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [dragCount, setDragCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { loadDocuments(); }, [actorId, opportunityId]);

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const data = await DocumentService.getAll({ actorId, opportunityId });
            setDocuments(data);
        } catch (err) {
            console.error('Failed to load documents', err);
        } finally {
            setIsLoading(false);
        }
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        try {
            await DocumentService.upload(file, { actorId, opportunityId });
            await loadDocuments();
        } catch (err) {
            console.error('Upload failed', err);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        setDragCount(c => c + 1);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragCount(c => c - 1);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragCount(0);
        const file = e.dataTransfer.files?.[0];
        if (file) uploadFile(file);
    };

    const handleDownload = (doc: Document) => {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${doc.path}`;
        window.open(url, '_blank');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce document ?')) return;
        setDocuments(prev => prev.filter(d => d.id !== id));
        try {
            await DocumentService.delete(id);
        } catch (err) {
            console.error('Failed to delete document', err);
            loadDocuments();
        }
    };

    const isDragging = dragCount > 0;

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #f3f4f6',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="#4f46e5" />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                        Documents
                    </h3>
                    {documents.length > 0 && (
                        <span style={{
                            fontSize: '0.6875rem', fontWeight: 700,
                            padding: '0.125rem 0.5rem',
                            borderRadius: '9999px',
                            background: '#eef2ff', color: '#4f46e5',
                            border: '1px solid #c7d2fe',
                        }}>
                            {documents.length}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 1rem',
                        background: isUploading ? '#a5b4fc' : '#4f46e5',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        flexShrink: 0,
                        boxShadow: isUploading ? 'none' : '0 2px 6px rgba(79,70,229,0.3)',
                    }}
                    onMouseEnter={e => { if (!isUploading) e.currentTarget.style.background = '#4338ca'; }}
                    onMouseLeave={e => { if (!isUploading) e.currentTarget.style.background = '#4f46e5'; }}
                >
                    <Upload size={15} />
                    {isUploading ? 'Envoi...' : 'Ajouter un document'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                />
            </div>

            {/* Drop zone strip — visible when files exist */}
            {documents.length > 0 && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        margin: '0.875rem 1.5rem 0',
                        padding: '0.625rem 1rem',
                        border: `2px dashed ${isDragging ? '#4f46e5' : '#c7d2fe'}`,
                        borderRadius: '0.625rem',
                        background: isDragging ? '#eef2ff' : '#fafbff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                    }}
                >
                    <Upload size={14} color={isDragging ? '#4f46e5' : '#a5b4fc'} />
                    <span style={{
                        fontSize: '0.8125rem',
                        color: isDragging ? '#4f46e5' : '#818cf8',
                        fontWeight: isDragging ? 600 : 400,
                    }}>
                        {isDragging ? 'Relâchez pour uploader' : 'Glissez un fichier ici ou cliquez pour sélectionner'}
                    </span>
                </div>
            )}

            {/* Content */}
            <div style={{ flex: 1, padding: '0.875rem 1rem' }}>
                {isLoading ? (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '3rem', color: '#9ca3af', fontSize: '0.875rem',
                    }}>
                        Chargement...
                    </div>
                ) : documents.length === 0 ? (
                    /* Empty state — full drop zone */
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3rem 2rem',
                            border: `2px dashed ${isDragging ? '#4f46e5' : '#e0e7ff'}`,
                            borderRadius: '0.875rem',
                            background: isDragging ? '#eef2ff' : '#fafbff',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{
                            width: '4rem', height: '4rem',
                            background: isDragging ? '#e0e7ff' : '#f3f4f6',
                            borderRadius: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '1rem',
                            transition: 'background 0.15s',
                        }}>
                            <FolderOpen size={26} color={isDragging ? '#4f46e5' : '#d1d5db'} />
                        </div>
                        <h4 style={{
                            margin: '0 0 0.375rem 0',
                            fontSize: '0.9375rem',
                            fontWeight: 600,
                            color: isDragging ? '#4f46e5' : '#111827',
                        }}>
                            {isDragging ? 'Relâchez pour uploader' : 'Aucun document'}
                        </h4>
                        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: '#9ca3af' }}>
                            {isDragging
                                ? 'Le fichier sera ajouté automatiquement'
                                : 'Glissez-déposez un fichier ou cliquez pour sélectionner'}
                        </p>
                        {!isDragging && (
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.5rem 1.25rem',
                                background: '#eef2ff',
                                color: '#4f46e5',
                                border: '1px solid #c7d2fe',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                pointerEvents: 'none',
                            }}>
                                <Upload size={14} />
                                Sélectionner un fichier
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.375rem' }}>
                        {documents.map(doc => {
                            const cfg = getFileConfig(doc.mimeType, doc.filename);
                            const isHovered = hoveredId === doc.id;

                            return (
                                <div
                                    key={doc.id}
                                    onMouseEnter={() => setHoveredId(doc.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.875rem',
                                        padding: '0.75rem 0.875rem',
                                        borderRadius: '0.625rem',
                                        border: `1px solid ${isHovered ? '#e0e7ff' : '#f3f4f6'}`,
                                        background: isHovered ? '#fafbff' : '#fff',
                                        transition: 'background 0.1s, border-color 0.1s',
                                    }}
                                >
                                    {/* File type badge */}
                                    <div style={{
                                        width: '2.75rem',
                                        height: '2.75rem',
                                        borderRadius: '0.5rem',
                                        background: cfg.bg,
                                        border: `1px solid ${cfg.border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        fontSize: '0.5625rem',
                                        fontWeight: 800,
                                        color: cfg.color,
                                        letterSpacing: '0.06em',
                                    }}>
                                        {cfg.ext}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: '0.9rem',
                                                fontWeight: 500,
                                                color: '#111827',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => handleDownload(doc)}
                                            title={doc.filename}
                                        >
                                            {doc.filename}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginTop: '0.25rem',
                                        }}>
                                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                {formatBytes(doc.size)}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#d1d5db' }}>·</span>
                                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                {new Date(doc.createdAt).toLocaleDateString('fr-FR', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        opacity: isHovered ? 1 : 0,
                                        transition: 'opacity 0.15s',
                                        flexShrink: 0,
                                    }}>
                                        <button
                                            onClick={() => handleDownload(doc)}
                                            title="Télécharger"
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                padding: '0.375rem', borderRadius: '0.375rem',
                                                color: '#9ca3af',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.color = '#4f46e5')}
                                            onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                                        >
                                            <Download size={15} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            title="Supprimer"
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                padding: '0.375rem', borderRadius: '0.375rem',
                                                color: '#9ca3af',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                                            onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
