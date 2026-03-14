import { useState } from 'react';
import { X, CheckSquare, Calendar } from 'lucide-react';
import { TaskService, type CreateTaskDTO } from '../services/task.service';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    actorId: string;
    onSuccess: () => void;
}

type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; selectedBg: string; dot: string }> = {
    LOW:    { label: 'Faible',  color: '#059669', selectedBg: '#d1fae5', dot: '#059669' },
    MEDIUM: { label: 'Moyenne', color: '#d97706', selectedBg: '#fef3c7', dot: '#d97706' },
    HIGH:   { label: 'Haute',   color: '#dc2626', selectedBg: '#fee2e2', dot: '#dc2626' },
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

export const CreateTaskModal = ({ isOpen, onClose, actorId, onSuccess }: CreateTaskModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setDueDate('');
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: CreateTaskDTO = {
                title,
                description: description || undefined,
                priority,
                actorId,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            };
            await TaskService.create(payload);
            handleClose();
            onSuccess();
        } catch (err) {
            console.error('Failed to create task', err);
        } finally {
            setLoading(false);
        }
    };

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
                    background: '#f0f0ff',
                    borderLeft: '4px solid #4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '2.25rem', height: '2.25rem',
                            background: '#4f46e5',
                            borderRadius: '0.625rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <CheckSquare size={15} color="#fff" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e1b4b' }}>
                                Nouvelle tâche
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                                Planifiez une action à réaliser
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

                    {/* Title */}
                    <div>
                        <label style={labelStyle}>
                            Titre <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Ex : Rappeler le client, Envoyer le devis..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            autoFocus
                            style={inputStyle}
                            onFocus={e => (e.currentTarget.style.borderColor = '#4f46e5')}
                            onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={labelStyle}>
                            Description{' '}
                            <span style={{ fontSize: '0.6875rem', fontWeight: 400, color: '#9ca3af' }}>(optionnel)</span>
                        </label>
                        <textarea
                            placeholder="Détails supplémentaires..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                            onFocus={e => (e.currentTarget.style.borderColor = '#4f46e5')}
                            onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label style={labelStyle}>Priorité</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                            {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([key, cfg]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setPriority(key)}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        border: `1.5px solid ${priority === key ? cfg.color : '#e5e7eb'}`,
                                        borderRadius: '0.5rem',
                                        background: priority === key ? cfg.selectedBg : '#fff',
                                        color: priority === key ? cfg.color : '#6b7280',
                                        fontSize: '0.8125rem',
                                        fontWeight: priority === key ? 700 : 500,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.375rem',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <span style={{
                                        width: '7px', height: '7px',
                                        borderRadius: '50%',
                                        background: cfg.dot,
                                        flexShrink: 0,
                                    }} />
                                    {cfg.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Due date */}
                    <div>
                        <label style={labelStyle}>
                            Échéance{' '}
                            <span style={{ fontSize: '0.6875rem', fontWeight: 400, color: '#9ca3af' }}>(optionnel)</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Calendar
                                size={15}
                                color="#9ca3af"
                                style={{
                                    position: 'absolute', left: '0.75rem',
                                    top: '50%', transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                }}
                            />
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                                onFocus={e => (e.currentTarget.style.borderColor = '#4f46e5')}
                                onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                            />
                        </div>
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
                                background: loading ? '#a5b4fc' : '#4f46e5',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: loading ? 'none' : '0 2px 8px rgba(79,70,229,0.35)',
                            }}
                        >
                            <CheckSquare size={15} />
                            {loading ? 'Création...' : 'Créer la tâche'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};
