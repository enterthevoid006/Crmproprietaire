import { useState, useEffect } from 'react';
import { TaskService, type Task } from '../services/task.service';
import { CheckCircle, Circle, Trash2, Plus, Calendar, CheckSquare } from 'lucide-react';

interface ClientTaskListProps {
    actorId: string;
    onAddClick?: () => void;
}

const PRIORITY_CONFIG: Record<'HIGH' | 'MEDIUM' | 'LOW', { label: string; color: string; bg: string; border: string }> = {
    HIGH:   { label: 'Haute',   color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
    MEDIUM: { label: 'Moyenne', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    LOW:    { label: 'Faible',  color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
};

const isOverdue = (dueDate?: string) =>
    dueDate && new Date(dueDate) < new Date() ? true : false;

export const ClientTaskList = ({ actorId, onAddClick }: ClientTaskListProps) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    useEffect(() => { loadTasks(); }, [actorId]);

    const loadTasks = async () => {
        try {
            const allTasks = await TaskService.getAll();
            setTasks(allTasks.filter(t => t.actorId === actorId));
        } catch (err) {
            console.error('Failed to load tasks', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (task: Task) => {
        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        try {
            await TaskService.updateStatus(task.id, newStatus);
        } catch (err) {
            console.error('Failed to update status', err);
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

    const done = tasks.filter(t => t.status === 'DONE').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #f3f4f6',
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckSquare size={16} color="#4f46e5" />
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                            Tâches
                        </h3>
                        {tasks.length > 0 && (
                            <span style={{
                                fontSize: '0.6875rem', fontWeight: 700,
                                padding: '0.125rem 0.5rem',
                                borderRadius: '9999px',
                                background: '#eef2ff', color: '#4f46e5',
                                border: '1px solid #c7d2fe',
                            }}>
                                {done}/{tasks.length}
                            </span>
                        )}
                    </div>
                    {tasks.length > 0 && (
                        <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.8125rem', color: '#9ca3af' }}>
                            {done === tasks.length && tasks.length > 0 ? 'Toutes terminées 🎉' : `${tasks.length - done} restante${tasks.length - done > 1 ? 's' : ''}`}
                        </p>
                    )}
                </div>
                <button
                    onClick={onAddClick}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 1rem',
                        background: '#4f46e5',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(79,70,229,0.3)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}
                >
                    <Plus size={15} />
                    Ajouter
                </button>
            </div>

            {/* List */}
            <div style={{ flex: 1, padding: '0.75rem 1rem' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                        Chargement...
                    </div>
                ) : tasks.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 2rem', textAlign: 'center' }}>
                        <div style={{
                            width: '3.5rem', height: '3.5rem',
                            background: '#f3f4f6', borderRadius: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '1rem',
                        }}>
                            <CheckSquare size={22} color="#d1d5db" />
                        </div>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9375rem', fontWeight: 600, color: '#111827' }}>
                            Aucune tâche
                        </h4>
                        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                            Ajoutez une tâche pour suivre les actions à faire.
                        </p>
                        <button
                            onClick={onAddClick}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.5rem 1rem',
                                background: '#eef2ff', color: '#4f46e5',
                                border: '1px solid #c7d2fe',
                                borderRadius: '0.5rem', fontSize: '0.875rem',
                                fontWeight: 500, cursor: 'pointer',
                            }}
                        >
                            <Plus size={14} /> Créer une tâche
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {tasks.map(task => {
                            const isDone = task.status === 'DONE';
                            const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG['MEDIUM'];
                            const overdue = !isDone && isOverdue(task.dueDate);
                            const isHovered = hoveredId === task.id;

                            return (
                                <div
                                    key={task.id}
                                    onMouseEnter={() => setHoveredId(task.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 0.875rem',
                                        borderRadius: '0.625rem',
                                        border: `1px solid ${isHovered ? '#e0e7ff' : '#f3f4f6'}`,
                                        background: isDone ? '#fafafa' : (isHovered ? '#fafbff' : '#fff'),
                                        transition: 'background 0.1s, border-color 0.1s',
                                        cursor: 'default',
                                    }}
                                >
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleStatus(task)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            padding: 0, flexShrink: 0,
                                            color: isDone ? '#10b981' : '#d1d5db',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'color 0.15s',
                                        }}
                                        onMouseEnter={e => { if (!isDone) e.currentTarget.style.color = '#4f46e5'; }}
                                        onMouseLeave={e => { if (!isDone) e.currentTarget.style.color = '#d1d5db'; }}
                                        title={isDone ? 'Marquer comme à faire' : 'Marquer comme terminée'}
                                    >
                                        {isDone
                                            ? <CheckCircle size={20} />
                                            : <Circle size={20} />
                                        }
                                    </button>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{
                                                fontSize: '0.9rem',
                                                fontWeight: 500,
                                                color: isDone ? '#9ca3af' : '#111827',
                                                textDecoration: isDone ? 'line-through' : 'none',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {task.title}
                                            </span>

                                            {/* Priority badge */}
                                            <span style={{
                                                fontSize: '0.625rem',
                                                fontWeight: 700,
                                                padding: '0.125rem 0.4rem',
                                                borderRadius: '9999px',
                                                background: isDone ? '#f3f4f6' : priority.bg,
                                                color: isDone ? '#9ca3af' : priority.color,
                                                border: `1px solid ${isDone ? '#e5e7eb' : priority.border}`,
                                                textTransform: 'uppercase' as const,
                                                letterSpacing: '0.04em',
                                                flexShrink: 0,
                                            }}>
                                                {priority.label}
                                            </span>
                                        </div>

                                        {task.dueDate && (
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                marginTop: '0.25rem',
                                                fontSize: '0.75rem',
                                                color: overdue ? '#ef4444' : '#9ca3af',
                                                fontWeight: overdue ? 600 : 400,
                                            }}>
                                                <Calendar size={11} />
                                                {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                {overdue && <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#ef4444' }}>En retard</span>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Delete */}
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            padding: '0.3rem', borderRadius: '0.375rem',
                                            color: '#d1d5db',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            opacity: isHovered ? 1 : 0,
                                            transition: 'opacity 0.15s, color 0.15s',
                                            flexShrink: 0,
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                                        onMouseLeave={e => (e.currentTarget.style.color = '#d1d5db')}
                                        title="Supprimer"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
