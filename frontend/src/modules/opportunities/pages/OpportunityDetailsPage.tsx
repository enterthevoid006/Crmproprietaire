import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OpportunityService, type Opportunity } from '../services/opportunity.service';
import { TaskService, type Task } from '../../tasks/services/task.service';
import { InteractionService, type Interaction } from '../../interactions/services/interaction.service';
import { useIsMobile } from '../../../hooks/useIsMobile';
import {
    ArrowLeft, DollarSign, Calendar, Building2, User, CheckSquare, FileText, Plus,
    TrendingUp, Target, MessageSquare, Phone, Mail, Users, Trash2, X, Check, Clock,
    Edit2, Activity,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
    PROSPECTING:   { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', label: 'Prospection' },
    QUALIFICATION: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: 'Qualification' },
    PROPOSAL:      { bg: '#fefce8', text: '#a16207', border: '#fde68a', label: 'Proposition' },
    NEGOTIATION:   { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', label: 'Négociation' },
    CLOSED_WON:    { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', label: 'Gagné' },
    CLOSED_LOST:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'Perdu' },
    NEW:           { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', label: 'Nouveau' },
    QUALIFIED:     { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: 'Qualifié' },
    WON:           { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', label: 'Gagné' },
    LOST:          { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'Perdu' },
};

const STAGE_OPTIONS: Array<{ value: Opportunity['stage']; label: string }> = [
    { value: 'NEW',         label: 'Nouveau' },
    { value: 'QUALIFIED',   label: 'Qualifié' },
    { value: 'PROPOSAL',    label: 'Proposition' },
    { value: 'NEGOTIATION', label: 'Négociation' },
    { value: 'WON',         label: 'Gagné' },
    { value: 'LOST',        label: 'Perdu' },
];

const PRIORITY_CONFIG = {
    HIGH:   { label: 'Haute',  color: '#ef4444', bg: '#fef2f2' },
    MEDIUM: { label: 'Moy.',   color: '#f59e0b', bg: '#fffbeb' },
    LOW:    { label: 'Basse',  color: '#10b981', bg: '#ecfdf5' },
};

const INTERACTION_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
    NOTE:    { label: 'Note',    color: '#6b7280', bg: '#f3f4f6', Icon: MessageSquare },
    CALL:    { label: 'Appel',   color: '#10b981', bg: '#ecfdf5', Icon: Phone },
    EMAIL:   { label: 'Email',   color: '#4f46e5', bg: '#eef2ff', Icon: Mail },
    MEETING: { label: 'Réunion', color: '#f59e0b', bg: '#fffbeb', Icon: Users },
    OTHER:   { label: 'Autre',   color: '#9ca3af', bg: '#f9fafb', Icon: Activity },
};

const getStageColor = (stage: string) => STAGE_COLORS[stage] ?? { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb', label: stage };

const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1)  return "À l'instant";
    if (m < 60) return `Il y a ${m}min`;
    if (h < 24) return `Il y a ${h}h`;
    if (d === 1) return 'Hier';
    return `Il y a ${d}j`;
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.5rem 0.75rem',
    fontSize: '0.875rem', color: '#111827',
    background: '#f9fafb', border: '1px solid #d1d5db',
    borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box',
};

// ─── Task Modal ───────────────────────────────────────────────────────────────

const TaskModal: React.FC<{ opportunityId: string; onClose: () => void; onSuccess: () => void }> = ({ opportunityId, onClose, onSuccess }) => {
    const isMobile = useIsMobile();
    const [title, setTitle]             = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority]       = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
    const [dueDate, setDueDate]         = useState('');
    const [submitting, setSubmitting]   = useState(false);
    const [error, setError]             = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { setError('Le titre est obligatoire'); return; }
        setSubmitting(true);
        try {
            await TaskService.create({ title: title.trim(), description: description.trim() || undefined, priority, dueDate: dueDate || undefined, opportunityId });
            onSuccess();
            onClose();
        } catch {
            setError('Erreur lors de la création');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: '1rem', width: isMobile ? '95vw' : '100%', maxWidth: isMobile ? undefined : '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Nouvelle tâche</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {error && <div style={{ padding: '0.625rem 0.875rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', fontSize: '0.8125rem', color: '#dc2626' }}>{error}</div>}
                    <ModalField label="Titre *">
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nom de la tâche" autoFocus style={inputStyle} />
                    </ModalField>
                    <ModalField label="Description">
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description optionnelle" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                    </ModalField>
                    <ModalField label="Priorité">
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                                <button key={p} type="button" onClick={() => setPriority(p)} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', border: `1.5px solid ${priority === p ? PRIORITY_CONFIG[p].color : '#e5e7eb'}`, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', background: priority === p ? PRIORITY_CONFIG[p].bg : '#fff', color: priority === p ? PRIORITY_CONFIG[p].color : '#6b7280' }}>
                                    {PRIORITY_CONFIG[p].label}
                                </button>
                            ))}
                        </div>
                    </ModalField>
                    <ModalField label="Date d'échéance">
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputStyle} />
                    </ModalField>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.5rem 1.25rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.625rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>Annuler</button>
                        <button type="submit" disabled={submitting} style={{ padding: '0.5rem 1.25rem', background: '#4f46e5', border: 'none', borderRadius: '0.625rem', fontSize: '0.875rem', fontWeight: 600, color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                            {submitting ? 'Création…' : 'Créer la tâche'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Note Modal ───────────────────────────────────────────────────────────────

const NoteModal: React.FC<{ opportunityId: string; onClose: () => void; onSuccess: () => void }> = ({ opportunityId, onClose, onSuccess }) => {
    const isMobile = useIsMobile();
    const [type, setType]             = useState<'NOTE' | 'CALL' | 'EMAIL' | 'MEETING'>('NOTE');
    const [summary, setSummary]       = useState('');
    const [date, setDate]             = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!summary.trim()) { setError('Le contenu est obligatoire'); return; }
        setSubmitting(true);
        try {
            await InteractionService.create({ type, summary: summary.trim(), date: date || undefined, opportunityId });
            onSuccess();
            onClose();
        } catch {
            setError('Erreur lors de la création');
        } finally {
            setSubmitting(false);
        }
    };

    const types: Array<'NOTE' | 'CALL' | 'EMAIL' | 'MEETING'> = ['NOTE', 'CALL', 'EMAIL', 'MEETING'];

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: '1rem', width: isMobile ? '95vw' : '100%', maxWidth: isMobile ? undefined : '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Nouvelle activité</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {error && <div style={{ padding: '0.625rem 0.875rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', fontSize: '0.8125rem', color: '#dc2626' }}>{error}</div>}
                    <ModalField label="Type">
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {types.map(t => {
                                const cfg = INTERACTION_TYPE_CONFIG[t];
                                const Icon = cfg.Icon;
                                return (
                                    <button key={t} type="button" onClick={() => setType(t)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: `1.5px solid ${type === t ? cfg.color : '#e5e7eb'}`, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', background: type === t ? cfg.bg : '#fff', color: type === t ? cfg.color : '#6b7280' }}>
                                        <Icon size={13} />{cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </ModalField>
                    <ModalField label="Contenu *">
                        <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Décrivez l'activité…" rows={4} autoFocus style={{ ...inputStyle, resize: 'vertical' }} />
                    </ModalField>
                    <ModalField label="Date">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
                    </ModalField>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.5rem 1.25rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.625rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>Annuler</button>
                        <button type="submit" disabled={submitting} style={{ padding: '0.5rem 1.25rem', background: '#4f46e5', border: 'none', borderRadius: '0.625rem', fontSize: '0.875rem', fontWeight: 600, color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                            {submitting ? 'Création…' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const OpportunityDetailsPage = () => {
    const { id }    = useParams<{ id: string }>();
    const navigate  = useNavigate();
    const isMobile  = useIsMobile();

    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [isLoading, setIsLoading]     = useState(true);
    const [error, setError]             = useState('');
    const [activeTab, setActiveTab]     = useState<'tasks' | 'notes' | 'quotes'>('tasks');
    const [refreshKey, setRefreshKey]   = useState(0);
    const [successMsg, setSuccessMsg]   = useState('');

    // Edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving]       = useState(false);
    const [editForm, setEditForm]   = useState({
        name: '',
        amount: 0,
        probability: 0,
        expectedCloseDate: '',
        stage: 'NEW' as Opportunity['stage'],
    });

    // Tasks
    const [tasks, setTasks]                   = useState<Task[]>([]);
    const [tasksLoading, setTasksLoading]     = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    // Notes
    const [interactions, setInteractions]         = useState<Interaction[]>([]);
    const [notesLoading, setNotesLoading]         = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen]   = useState(false);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        OpportunityService.getById(id)
            .then(setOpportunity)
            .catch(() => setError("Impossible de charger l'opportunité."))
            .finally(() => setIsLoading(false));
    }, [id]);

    useEffect(() => {
        if (!id) return;
        if (activeTab === 'tasks') {
            setTasksLoading(true);
            TaskService.getByOpportunity(id)
                .then(setTasks)
                .catch(console.error)
                .finally(() => setTasksLoading(false));
        }
        if (activeTab === 'notes') {
            setNotesLoading(true);
            InteractionService.getByOpportunity(id)
                .then(setInteractions)
                .catch(console.error)
                .finally(() => setNotesLoading(false));
        }
    }, [activeTab, id, refreshKey]);

    const handleSuccess = (msg = 'Ajouté avec succès') => {
        setRefreshKey(k => k + 1);
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const startEdit = () => {
        if (!opportunity) return;
        setEditForm({
            name: opportunity.name,
            amount: opportunity.amount,
            probability: opportunity.probability,
            expectedCloseDate: opportunity.expectedCloseDate ? opportunity.expectedCloseDate.slice(0, 10) : '',
            stage: opportunity.stage,
        });
        setIsEditing(true);
    };

    const cancelEdit = () => setIsEditing(false);

    const handleSave = async () => {
        if (!id) return;
        setSaving(true);
        try {
            const updated = await OpportunityService.update(id, {
                name: editForm.name,
                amount: editForm.amount,
                probability: editForm.probability,
                expectedCloseDate: editForm.expectedCloseDate || undefined,
                stage: editForm.stage,
            });
            setOpportunity(updated);
            setIsEditing(false);
            setSuccessMsg('Modifications enregistrées');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleTask = async (task: Task) => {
        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        try {
            await TaskService.updateStatus(task.id, newStatus);
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        } catch (err) { console.error(err); }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm('Supprimer cette tâche ?')) return;
        try {
            await TaskService.delete(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err) { console.error(err); }
    };

    const handleDeleteInteraction = async (interactionId: string) => {
        if (!window.confirm('Supprimer cette activité ?')) return;
        try {
            await InteractionService.delete(interactionId);
            setInteractions(prev => prev.filter(i => i.id !== interactionId));
        } catch (err) { console.error(err); }
    };

    if (isLoading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Chargement...</span>
        </div>
    );

    if (error || !opportunity) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 500, color: '#111827' }}>{error || 'Opportunité introuvable'}</p>
                <button onClick={() => navigate('/opportunities')} style={{ fontSize: '0.875rem', color: '#4f46e5', marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Retour au pipeline
                </button>
            </div>
        </div>
    );

    const stageColor      = getStageColor(opportunity.stage);
    const isOverdue       = opportunity.expectedCloseDate && new Date(opportunity.expectedCloseDate) < new Date();
    const formattedAmount = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(opportunity.amount);
    const displayName     = opportunity.actor?.companyName || (opportunity.actor ? `${opportunity.actor.firstName} ${opportunity.actor.lastName}` : null);

    return (
        <div style={{ padding: isMobile ? '1rem' : '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>

            {/* Success toast */}
            {successMsg && (
                <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '0.625rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.875rem', fontWeight: 500, color: '#065f46' }}>
                    <Check size={15} color="#059669" /> {successMsg}
                </div>
            )}

            {/* Modals */}
            {isTaskModalOpen && <TaskModal opportunityId={id!} onClose={() => setIsTaskModalOpen(false)} onSuccess={() => handleSuccess('Tâche créée')} />}
            {isNoteModalOpen && <NoteModal opportunityId={id!} onClose={() => setIsNoteModalOpen(false)} onSuccess={() => handleSuccess('Activité ajoutée')} />}

            {/* Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => navigate('/opportunities')}>
                    <ArrowLeft size={15} /> Retour au pipeline
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isEditing ? (
                        <>
                            <button onClick={cancelEdit} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280', cursor: 'pointer' }}>
                                <X size={14} /> Annuler
                            </button>
                            <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#4f46e5', border: 'none', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                                <Check size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={startEdit} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                                <Edit2 size={14} /> Modifier
                            </button>
                            <button onClick={() => setIsTaskModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                                <CheckSquare size={14} /> Tâche
                            </button>
                            <button onClick={() => setIsNoteModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                                <FileText size={14} /> Note
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Grid — 1 col on mobile, sidebar + main on desktop */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: '1.25rem', alignItems: 'start' }}>

                {/* ── SIDEBAR ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Identity Card */}
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

                        {/* Header */}
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid #f3f4f6', background: 'linear-gradient(to bottom, #f9fafb, #fff)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                                    <Target size={20} color="#4f46e5" />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                            style={{ ...inputStyle, fontSize: '0.9375rem', fontWeight: 700 }}
                                        />
                                    ) : (
                                        <>
                                            <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>{opportunity.name}</h1>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem', flexWrap: 'wrap' as const }}>
                                                <span style={{ padding: '0.125rem 0.5rem', fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderRadius: '0.375rem', background: stageColor.bg, color: stageColor.text, border: `1px solid ${stageColor.border}` }}>
                                                    {stageColor.label}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>{opportunity.id.slice(0, 8)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Financier */}
                        <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
                            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 0.75rem 0' }}>Financier</p>
                            {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                    <EditField label="Montant (€)">
                                        <input type="number" min={0} step="0.01" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                                    </EditField>
                                    <EditField label="Probabilité (%)">
                                        <input type="number" min={0} max={100} value={editForm.probability} onChange={e => setEditForm(f => ({ ...f, probability: parseInt(e.target.value) || 0 }))} style={inputStyle} />
                                    </EditField>
                                    <EditField label="Date de clôture prévue">
                                        <input type="date" value={editForm.expectedCloseDate} onChange={e => setEditForm(f => ({ ...f, expectedCloseDate: e.target.value }))} style={inputStyle} />
                                    </EditField>
                                    <EditField label="Étape du pipeline">
                                        <select value={editForm.stage} onChange={e => setEditForm(f => ({ ...f, stage: e.target.value as Opportunity['stage'] }))} style={{ ...inputStyle }}>
                                            {STAGE_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </EditField>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <InfoRow icon={DollarSign} label="Montant" value={formattedAmount} bold />
                                    <InfoRow label="Probabilité" value={`${opportunity.probability}%`} valueColor={opportunity.probability > 70 ? '#059669' : '#374151'} bold={opportunity.probability > 70} />
                                    <InfoRow icon={Calendar} label="Clôture prévue" value={opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toLocaleDateString('fr-FR') : undefined} valueColor={isOverdue ? '#dc2626' : '#374151'} />
                                </div>
                            )}
                        </div>

                        {/* Client */}
                        <div style={{ padding: '0.75rem 1.25rem 1.25rem', borderTop: '1px solid #f3f4f6' }}>
                            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 0.75rem 0' }}>Client lié</p>
                            {opportunity.actor && displayName ? (
                                <div onClick={() => navigate(`/actors/${opportunity.actorId}`)} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', cursor: 'pointer' }}>
                                    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: '#eef2ff', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {opportunity.actor.companyName ? <Building2 size={13} color="#4f46e5" /> : <User size={13} color="#4f46e5" />}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#4f46e5', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{displayName}</span>
                                        <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>Voir le profil →</span>
                                    </div>
                                </div>
                            ) : (
                                <span style={{ fontSize: '0.8125rem', color: '#9ca3af', fontStyle: 'italic' }}>Aucun client lié</span>
                            )}
                        </div>
                    </div>

                    {/* Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <MetricCard label="Valeur estimée" value={formattedAmount} icon={TrendingUp} color="#4f46e5" bgColor="#eef2ff" />
                        <MetricCard label="Probabilité" value={`${opportunity.probability}%`} icon={Target} color="#7c3aed" bgColor="#f5f3ff" />
                    </div>
                </div>

                {/* ── MAIN CONTENT ── */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

                    {/* Tabs — scrollable on mobile */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', paddingTop: '0.5rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                        <TabButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} label="Tâches" icon={CheckSquare} count={tasks.length || null} />
                        <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} label="Notes & Activité" icon={MessageSquare} count={interactions.length || null} />
                        <TabButton active={activeTab === 'quotes'} onClick={() => setActiveTab('quotes')} label="Devis" icon={FileText} count={null} />
                    </div>

                    {/* Content */}
                    <div style={{ padding: isMobile ? '1rem' : '1.25rem', minHeight: '420px' }}>

                        {/* ─ TASKS TAB ─ */}
                        {activeTab === 'tasks' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                                        {tasks.length} tâche{tasks.length !== 1 ? 's' : ''}
                                    </span>
                                    <button onClick={() => setIsTaskModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#4f46e5', border: 'none', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
                                        <Plus size={13} /> Ajouter une tâche
                                    </button>
                                </div>
                                {tasksLoading ? (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: '0.875rem' }}>Chargement…</div>
                                ) : tasks.length === 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center' }}>
                                        <div style={{ width: '3rem', height: '3rem', background: '#f3f4f6', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                                            <CheckSquare size={20} color="#9ca3af" />
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Aucune tâche pour cette opportunité</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {tasks.map(task => {
                                            const isDone = task.status === 'DONE';
                                            const pc = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.MEDIUM;
                                            const isTaskOverdue = task.dueDate && !isDone && new Date(task.dueDate) < new Date();
                                            return (
                                                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: isDone ? '#f9fafb' : '#fff', border: '1px solid #f3f4f6', borderRadius: '0.625rem' }}>
                                                    <button onClick={() => handleToggleTask(task)} style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${isDone ? '#10b981' : '#d1d5db'}`, background: isDone ? '#10b981' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                                        {isDone && <Check size={12} color="#fff" />}
                                                    </button>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: isDone ? '#9ca3af' : '#111827', textDecoration: isDone ? 'line-through' : 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{task.title}</span>
                                                        {task.dueDate && (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: isTaskOverdue ? '#ef4444' : '#9ca3af', marginTop: '0.125rem' }}>
                                                                <Clock size={11} />{new Date(task.dueDate).toLocaleDateString('fr-FR')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span style={{ padding: '0.125rem 0.5rem', fontSize: '0.625rem', fontWeight: 700, borderRadius: '0.375rem', background: pc.bg, color: pc.color, flexShrink: 0 }}>
                                                        {pc.label}
                                                    </span>
                                                    <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', display: 'flex', padding: '0.25rem', flexShrink: 0, borderRadius: '0.375rem' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#d1d5db'; }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─ NOTES TAB ─ */}
                        {activeTab === 'notes' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                                        {interactions.length} activité{interactions.length !== 1 ? 's' : ''}
                                    </span>
                                    <button onClick={() => setIsNoteModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#4f46e5', border: 'none', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
                                        <Plus size={13} /> Ajouter
                                    </button>
                                </div>
                                {notesLoading ? (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: '0.875rem' }}>Chargement…</div>
                                ) : interactions.length === 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center' }}>
                                        <div style={{ width: '3rem', height: '3rem', background: '#f3f4f6', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                                            <MessageSquare size={20} color="#9ca3af" />
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Aucune activité pour cette opportunité</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {interactions.map(interaction => {
                                            const cfg = INTERACTION_TYPE_CONFIG[interaction.type] ?? INTERACTION_TYPE_CONFIG.OTHER;
                                            const Icon = cfg.Icon;
                                            return (
                                                <div key={interaction.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.875rem', background: '#fff', border: '1px solid #f3f4f6', borderRadius: '0.625rem' }}>
                                                    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <Icon size={14} color={cfg.color} />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: cfg.color, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{cfg.label}</span>
                                                            <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>{timeAgo(interaction.createdAt)}</span>
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151', lineHeight: 1.5, whiteSpace: 'pre-wrap' as const }}>{interaction.summary}</p>
                                                    </div>
                                                    <button onClick={() => handleDeleteInteraction(interaction.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', display: 'flex', padding: '0.25rem', flexShrink: 0, alignSelf: 'flex-start', borderRadius: '0.375rem' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#d1d5db'; }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─ QUOTES TAB ─ */}
                        {activeTab === 'quotes' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
                                <div style={{ width: '3.5rem', height: '3.5rem', background: '#f3f4f6', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <FileText size={24} color="#9ca3af" />
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '0 0 0.25rem 0' }}>Aucun devis</h3>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1.25rem 0' }}>Aucun devis lié à cette opportunité.</p>
                                <button onClick={() => navigate('/finance/quotes/new')} style={{ fontSize: '0.875rem', fontWeight: 500, color: '#4f46e5', border: '1px solid #c7d2fe', background: '#eef2ff', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                                    + Créer un devis
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value, bold, valueColor = '#374151' }: { icon?: any; label: string; value?: string; bold?: boolean; valueColor?: string }) => {
    if (!value) return null;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.375rem 0' }}>
            <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {Icon ? <Icon size={11} color="#6b7280" /> : <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#d1d5db', display: 'block' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.625rem', color: '#9ca3af', display: 'block', lineHeight: 1 }}>{label}</span>
                <span style={{ fontSize: '0.8125rem', color: valueColor, fontWeight: bold ? 700 : 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{value}</span>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon: Icon, color, bgColor }: any) => (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={14} color={color} />
        </div>
        <div>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', display: 'block', lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: '0.6875rem', color: '#9ca3af', marginTop: '0.25rem', display: 'block' }}>{label}</span>
        </div>
    </div>
);

const TabButton = ({ active, onClick, label, icon: Icon, count }: any) => (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.625rem 1rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', borderBottom: active ? '2px solid #4f46e5' : '2px solid transparent', color: active ? '#4f46e5' : '#6b7280', marginBottom: '-1px', whiteSpace: 'nowrap', flexShrink: 0 }}>
        <Icon size={13} />{label}
        {count !== null && count !== undefined && count > 0 && (
            <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', borderRadius: '0.375rem', fontWeight: 700, background: active ? '#e0e7ff' : '#f3f4f6', color: active ? '#4f46e5' : '#6b7280' }}>{count}</span>
        )}
    </button>
);

const ModalField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>{label}</label>
        {children}
    </div>
);

const EditField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
        {children}
    </div>
);
