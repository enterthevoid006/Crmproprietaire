import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskService, type Task } from '../services/task.service';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { Plus, CheckCircle, Circle, Calendar, Users, Trash2, Flag, Filter } from 'lucide-react';

type FilterStatus = 'ALL' | 'TODO' | 'DONE';
type SortKey = 'date' | 'priority';

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; order: number }> = {
    HIGH:   { label: 'Haute',   color: '#be123c', bg: '#fef2f2', border: '#fecaca', order: 0 },
    MEDIUM: { label: 'Moyenne', color: '#b45309', bg: '#fffbeb', border: '#fde68a', order: 1 },
    LOW:    { label: 'Basse',   color: '#047857', bg: '#ecfdf5', border: '#a7f3d0', order: 2 },
};

export const TasksListPage = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
    const [sortKey, setSortKey] = useState<SortKey>('date');

    // Form state
    const [newTitle, setNewTitle] = useState('');
    const [newPriority, setNewPriority] = useState('MEDIUM');
    const [newDueDate, setNewDueDate] = useState('');
    const [newDescription, setNewDescription] = useState('');

    useEffect(() => { loadTasks(); }, []);

    const loadTasks = async () => {
        try {
            setIsLoading(true);
            const data = await TaskService.getAll();
            setTasks(data);
        } catch (err) {
            console.error('Failed to load tasks', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        try {
            await TaskService.create({
                title: newTitle.trim(),
                priority: newPriority as any,
                dueDate: newDueDate ? new Date(newDueDate).toISOString() : new Date().toISOString(),
                description: newDescription.trim() || undefined,
            });
            setNewTitle('');
            setNewPriority('MEDIUM');
            setNewDueDate('');
            setNewDescription('');
            setIsCreating(false);
            loadTasks();
        } catch (err) {
            console.error('Failed to create task', err);
        }
    };

    const toggleStatus = async (task: Task) => {
        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        try {
            await TaskService.updateStatus(task.id, newStatus);
        } catch (err) {
            console.error('Failed to update task', err);
            loadTasks();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer cette tâche ?')) return;
        setTasks(prev => prev.filter(t => t.id !== id));
        try {
            await TaskService.delete(id);
        } catch (err) {
            console.error('Failed to delete task', err);
            loadTasks();
        }
    };

    const filtered = tasks
        .filter(t => filterStatus === 'ALL' || t.status === filterStatus)
        .sort((a, b) => {
            if (sortKey === 'priority') {
                return (PRIORITY_CONFIG[a.priority]?.order ?? 1) - (PRIORITY_CONFIG[b.priority]?.order ?? 1);
            }
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

    const todoCount = tasks.filter(t => t.status !== 'DONE').length;
    const doneCount = tasks.filter(t => t.status === 'DONE').length;

    if (isLoading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Chargement des tâches...</span>
        </div>
    );

    return (
        <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>Tâches</h1>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                            {todoCount} en cours · {doneCount} terminée{doneCount > 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}
                    >
                        <Plus size={16} /> Nouvelle Tâche
                    </button>
                </div>

                {/* Create Form */}
                {isCreating && (
                    <form onSubmit={handleCreate} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                        <input
                            autoFocus
                            placeholder="Titre de la tâche..."
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#111827', background: '#f9fafb', marginBottom: '0.75rem', boxSizing: 'border-box' }}
                        />
                        <input
                            placeholder="Description (optionnel)"
                            value={newDescription}
                            onChange={e => setNewDescription(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#374151', background: '#f9fafb', marginBottom: '0.75rem', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Priorité</label>
                                <select value={newPriority} onChange={e => setNewPriority(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#374151', background: '#f9fafb' }}>
                                    <option value="LOW">🟢 Basse</option>
                                    <option value="MEDIUM">🟡 Moyenne</option>
                                    <option value="HIGH">🔴 Haute</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Échéance</label>
                                <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#374151', background: '#f9fafb', boxSizing: 'border-box' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button type="button" onClick={() => setIsCreating(false)}
                                style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', color: '#6b7280', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                                Annuler
                            </button>
                            <button type="submit" disabled={!newTitle.trim()}
                                style={{ padding: '0.5rem 1.25rem', background: newTitle.trim() ? '#4f46e5' : '#e5e7eb', color: newTitle.trim() ? '#fff' : '#9ca3af', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', cursor: newTitle.trim() ? 'pointer' : 'not-allowed' }}>
                                Créer
                            </button>
                        </div>
                    </form>
                )}

                {/* Filters & Sort */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '0.5rem', padding: '0.25rem', gap: '0.25rem' }}>
                        {([['ALL', 'Toutes'], ['TODO', 'En cours'], ['DONE', 'Terminées']] as const).map(([key, label]) => (
                            <button key={key} onClick={() => setFilterStatus(key)}
                                style={{ padding: '0.375rem 0.75rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500, background: filterStatus === key ? '#fff' : 'transparent', color: filterStatus === key ? '#111827' : '#6b7280', boxShadow: filterStatus === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={13} color="#9ca3af" />
                        <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
                            style={{ padding: '0.375rem 0.625rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem', fontSize: '0.8125rem', color: '#374151', background: '#fff', cursor: 'pointer' }}>
                            <option value="date">Trier par date</option>
                            <option value="priority">Trier par priorité</option>
                        </select>
                    </div>
                </div>

                {/* Task List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '0.75rem', border: '1px solid #e5e7eb', color: '#9ca3af', fontSize: '0.875rem' }}>
                            {filterStatus === 'DONE' ? '🎉 Aucune tâche terminée.' : 'Aucune tâche en cours. Profitez-en !'}
                        </div>
                    ) : filtered.map(task => {
                        const pConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['MEDIUM'];
                        const isOverdue = task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date();

                        return (
                            <div key={task.id}
                                style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', opacity: task.status === 'DONE' ? 0.65 : 1, transition: 'all 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
                                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)')}
                            >
                                {/* Checkbox */}
                                <button onClick={() => toggleStatus(task)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.125rem 0', color: task.status === 'DONE' ? '#10b981' : '#d1d5db', flexShrink: 0, marginTop: '0.125rem' }}>
                                    {task.status === 'DONE' ? <CheckCircle size={20} /> : <Circle size={20} />}
                                </button>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0, cursor: task.actorId ? 'pointer' : 'default' }}
                                    onClick={() => task.actorId && navigate(`/actors/${task.actorId}`)}>
                                    <p style={{ fontWeight: 500, fontSize: '0.9375rem', margin: 0, textDecoration: task.status === 'DONE' ? 'line-through' : 'none', color: task.status === 'DONE' ? '#9ca3af' : '#111827' }}>
                                        {task.title}
                                    </p>
                                    {task.description && (
                                        <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>{task.description}</p>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.375rem' }}>
                                        {task.dueDate && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: isOverdue ? '#dc2626' : '#6b7280' }}>
                                                <Calendar size={11} />
                                                {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                                                {isOverdue && ' · En retard'}
                                            </span>
                                        )}
                                        {task.actor && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#4f46e5' }}>
                                                <Users size={11} />
                                                {task.actor.companyName || `${task.actor.firstName || ''} ${task.actor.lastName || ''}`}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Priority badge */}
                                <span style={{ padding: '0.2rem 0.5rem', background: pConfig.bg, color: pConfig.color, border: `1px solid ${pConfig.border}`, borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Flag size={10} />
                                    {pConfig.label}
                                </span>

                                {/* Delete */}
                                <button onClick={() => handleDelete(task.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e5e7eb', padding: '0.25rem', borderRadius: '0.375rem', flexShrink: 0 }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                                    onMouseLeave={e => (e.currentTarget.style.color = '#e5e7eb')}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
