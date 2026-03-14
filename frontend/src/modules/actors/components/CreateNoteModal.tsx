import { useState } from 'react';
import { X, FileText, Phone, Mail, Users } from 'lucide-react';
import { InteractionService, type Interaction } from '../../interactions/services/interaction.service';

interface CreateNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    actorId: string;
    onSuccess: () => void;
}

type InteractionType = 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING';

const TYPE_CONFIG: Record<InteractionType, {
    label: string;
    icon: React.ComponentType<{ size: number }>;
    color: string;
    bg: string;
    border: string;
    placeholder: string;
}> = {
    NOTE:    { label: 'Note',    icon: FileText, color: '#374151', bg: '#f9fafb', border: '#d1d5db', placeholder: 'Écrivez votre note interne...' },
    CALL:    { label: 'Appel',   icon: Phone,    color: '#047857', bg: '#ecfdf5', border: '#6ee7b7', placeholder: 'Résumé de l\'appel téléphonique...' },
    EMAIL:   { label: 'Email',   icon: Mail,     color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd', placeholder: 'Sujet ou résumé de l\'email...' },
    MEETING: { label: 'Réunion', icon: Users,    color: '#b45309', bg: '#fffbeb', border: '#fcd34d', placeholder: 'Compte-rendu de la réunion...' },
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    color: '#111827',
    background: '#fff',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '0.5rem',
};

export const CreateNoteModal = ({ isOpen, onClose, actorId, onSuccess }: CreateNoteModalProps) => {
    const [type, setType] = useState<InteractionType>('NOTE');
    const [content, setContent] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        setType('NOTE');
        setContent('');
        setDate('');
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await InteractionService.create({
                type: type as Interaction['type'],
                summary: content,
                actorId,
                date: date ? new Date(date).toISOString() : new Date().toISOString(),
            });
            handleClose();
            onSuccess();
        } catch (err) {
            console.error('Failed to create interaction', err);
        } finally {
            setLoading(false);
        }
    };

    const selectedCfg = TYPE_CONFIG[type];

    return (
        <>
            {/* Overlay */}
            <div
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    top: 0, right: 0, bottom: 0, left: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 50,
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'calc(100% - 2rem)',
                maxWidth: '480px',
                background: '#fff',
                borderRadius: '1rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                zIndex: 51,
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    background: '#fffbeb',
                    borderLeft: '4px solid #f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '2.25rem', height: '2.25rem',
                            background: '#f59e0b',
                            borderRadius: '0.625rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <FileText size={15} color="#fff" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#78350f' }}>
                                Nouvelle interaction
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                                Note, appel, email ou réunion
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#9ca3af', padding: '0.25rem', borderRadius: '0.375rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Type selector */}
                    <div>
                        <label style={labelStyle}>Type d'interaction</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                            {(Object.entries(TYPE_CONFIG) as [InteractionType, typeof TYPE_CONFIG[InteractionType]][]).map(([key, cfg]) => {
                                const Icon = cfg.icon;
                                const isSelected = type === key;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setType(key)}
                                        style={{
                                            padding: '0.625rem 0.375rem',
                                            border: `1.5px solid ${isSelected ? cfg.border : '#e5e7eb'}`,
                                            borderRadius: '0.5rem',
                                            background: isSelected ? cfg.bg : '#fff',
                                            color: isSelected ? cfg.color : '#9ca3af',
                                            fontSize: '0.75rem',
                                            fontWeight: isSelected ? 700 : 400,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.375rem',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <Icon size={18} />
                                        {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label style={labelStyle}>
                            Contenu <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                            placeholder={selectedCfg.placeholder}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            required
                            autoFocus
                            rows={4}
                            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                            onFocus={e => (e.currentTarget.style.borderColor = '#f59e0b')}
                            onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label style={labelStyle}>
                            Date{' '}
                            <span style={{ fontSize: '0.6875rem', fontWeight: 400, color: '#9ca3af' }}>
                                (optionnel — aujourd'hui par défaut)
                            </span>
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            style={inputStyle}
                            onFocus={e => (e.currentTarget.style.borderColor = '#f59e0b')}
                            onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #f3f4f6',
                    }}>
                        <button
                            type="button"
                            onClick={handleClose}
                            style={{
                                padding: '0.625rem 1.25rem',
                                background: 'transparent',
                                border: 'none',
                                color: '#6b7280',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                borderRadius: '0.5rem',
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.625rem 1.5rem',
                                background: loading ? '#fcd34d' : '#f59e0b',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: loading ? 'none' : '0 2px 8px rgba(245,158,11,0.35)',
                            }}
                        >
                            <FileText size={15} />
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};
