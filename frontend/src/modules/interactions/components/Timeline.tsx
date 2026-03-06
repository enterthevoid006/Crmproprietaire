import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { InteractionService, type Interaction } from '../services/interaction.service';
import { TaskService, type Task } from '../../tasks/services/task.service';
import { Mail, Phone, Users, FileText, Plus, MessageSquare, Trash2, CheckSquare } from 'lucide-react';

interface TimelineProps {
    actorId?: string;
    opportunityId?: string;
}

type TimelineItem = (Interaction & { kind: 'INTERACTION' }) | (Task & { kind: 'TASK', date: string, details?: string, summary: string, type: 'TASK' });

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    EMAIL: { label: 'Email', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
    CALL: { label: 'Appel', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
    MEETING: { label: 'Réunion', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
    NOTE: { label: 'Note', color: '#374151', bg: '#f9fafb', border: '#e5e7eb' },
    TASK: { label: 'Tâche', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
    TASK_DONE: { label: 'Tâche terminée', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
};

const TYPE_ICONS: Record<string, any> = {
    EMAIL: Mail, CALL: Phone, MEETING: Users, NOTE: FileText, TASK: CheckSquare, TASK_DONE: CheckSquare,
};

export const Timeline = ({ actorId, opportunityId }: TimelineProps) => {
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [formType, setFormType] = useState('NOTE');
    const [formSummary, setFormSummary] = useState('');
    const [formDetails, setFormDetails] = useState('');
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => { loadData(); }, [actorId, opportunityId]);

    const loadData = async () => {
        try {
            let interactions: Interaction[] = [];
            if (actorId) interactions = await InteractionService.getByActor(actorId);
            else if (opportunityId) interactions = await InteractionService.getByOpportunity(opportunityId);

            let tasks: Task[] = [];
            if (actorId) {
                const allTasks = await TaskService.getAll();
                tasks = allTasks.filter(t => t.actorId === actorId);
            }

            const normalized = [
                ...interactions.map(i => ({ ...i, kind: 'INTERACTION' as const })),
                ...tasks.map(t => ({ ...t, kind: 'TASK' as const, type: 'TASK' as const, date: t.createdAt, summary: t.title, details: t.description || undefined })),
            ];

            setItems(normalized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (err) {
            console.error('Failed to load timeline data', err);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await InteractionService.create({ type: formType as any, summary: formSummary, details: formDetails, date: new Date(formDate).toISOString(), actorId, opportunityId });
            setIsAdding(false);
            setFormSummary('');
            setFormDetails('');
            loadData();
        } catch (err) {
            console.error('Failed to add interaction', err);
        }
    };

    const handleDelete = async (item: TimelineItem) => {
        if (!confirm('Supprimer cet élément ?')) return;
        try {
            if (item.kind === 'INTERACTION') await InteractionService.delete(item.id);
            else await TaskService.delete(item.id);
            loadData();
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    const getConfig = (item: TimelineItem) => {
        if (item.kind === 'TASK' && (item as any).status === 'DONE') return TYPE_CONFIG['TASK_DONE'];
        return TYPE_CONFIG[item.type] || TYPE_CONFIG['NOTE'];
    };

    const getIcon = (item: TimelineItem) => {
        if (item.kind === 'TASK') return TYPE_ICONS['TASK'];
        return TYPE_ICONS[item.type] || MessageSquare;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '500px' }}>

            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>Flux d'activités</h3>
                    <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: '0.125rem 0 0 0' }}>Suivi des interactions et tâches</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#111827', color: '#fff', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                >
                    <Plus size={15} /> Ajouter
                </button>
            </div>

            {/* Add Form */}
            {isAdding && (
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
                    <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Type</label>
                                <select value={formType} onChange={e => setFormType(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                                    <option value="NOTE">Note Interne</option>
                                    <option value="CALL">Appel Téléphonique</option>
                                    <option value="EMAIL">Email Envoyé</option>
                                    <option value="MEETING">Rendez-vous Client</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Date</label>
                                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#374151', boxSizing: 'border-box' }} />
                            </div>
                        </div>
                        <input placeholder="Titre de l'activité..." value={formSummary} onChange={e => setFormSummary(e.target.value)} required
                            style={{ width: '100%', padding: '0.625rem 0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#111827', marginBottom: '0.75rem', boxSizing: 'border-box' }} />
                        <textarea placeholder="Détails (optionnel)..." value={formDetails} onChange={e => setFormDetails(e.target.value)} rows={3}
                            style={{ width: '100%', padding: '0.625rem 0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#374151', resize: 'vertical', marginBottom: '1rem', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
                            <button type="button" onClick={() => setIsAdding(false)}
                                style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', color: '#6b7280', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                                Annuler
                            </button>
                            <button type="submit"
                                style={{ padding: '0.5rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                {items.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
                        <div style={{ width: '3.5rem', height: '3.5rem', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                            <MessageSquare size={24} color="#d1d5db" />
                        </div>
                        <h4 style={{ fontWeight: 700, color: '#111827', fontSize: '1rem', margin: '0 0 0.25rem 0' }}>C'est calme ici</h4>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Aucune activité pour le moment.</p>
                    </div>
                ) : (
                    <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto' }}>
                        {/* Vertical line */}
                        <div style={{ position: 'absolute', left: '1.375rem', top: '1.5rem', bottom: 0, width: '2px', background: '#f3f4f6' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {items.map(item => {
                                const config = getConfig(item);
                                const Icon = getIcon(item);
                                const isDone = item.kind === 'TASK' && (item as any).status === 'DONE';

                                return (
                                    <div key={`${item.kind}-${item.id}`} style={{ display: 'flex', gap: '1rem', position: 'relative' }}
                                        onMouseEnter={e => { const card = e.currentTarget.querySelector('.timeline-card') as HTMLElement; if (card) card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                                        onMouseLeave={e => { const card = e.currentTarget.querySelector('.timeline-card') as HTMLElement; if (card) card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
                                    >
                                        {/* Icon */}
                                        <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: config.bg, border: `1px solid ${config.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                                            <Icon size={16} color={config.color} />
                                        </div>

                                        {/* Card */}
                                        <div className="timeline-card" style={{ flex: 1, background: '#fff', border: '1px solid #f3f4f6', borderRadius: '0.75rem', padding: '0.875rem 1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'box-shadow 0.15s' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: item.details ? '0.5rem' : 0 }}>
                                                <div>
                                                    <span style={{ fontSize: '0.625rem', fontWeight: 700, color: config.color, textTransform: 'uppercase', letterSpacing: '0.05em', background: config.bg, padding: '0.125rem 0.5rem', borderRadius: '9999px', border: `1px solid ${config.border}` }}>
                                                        {config.label}
                                                    </span>
                                                    <h4 style={{ fontWeight: 600, color: isDone ? '#9ca3af' : '#111827', fontSize: '0.9375rem', margin: '0.375rem 0 0 0', textDecoration: isDone ? 'line-through' : 'none' }}>
                                                        {item.summary}
                                                    </h4>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>
                                                            {new Date(item.date).toLocaleDateString('fr-FR')}
                                                        </div>
                                                        <div style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>
                                                            {new Date(item.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleDelete(item)}
                                                        style={{ padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', borderRadius: '0.375rem' }}
                                                        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                                                        onMouseLeave={e => (e.currentTarget.style.color = '#d1d5db')}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            {item.details && (
                                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0 0 0', paddingTop: '0.5rem', borderTop: '1px solid #f9fafb', lineHeight: 1.6 }}>
                                                    {item.details}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

