import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskService, type Task } from '../services/task.service';
import { Plus, CheckCircle, Circle, Calendar, AlertCircle, Users } from 'lucide-react';

export const TasksListPage = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Quick create state
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        loadTasks();
    }, []);

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

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await TaskService.create({
                title: newTaskTitle,
                priority: 'MEDIUM',
                dueDate: new Date().toISOString()
            });
            setNewTaskTitle('');
            setIsCreating(false);
            loadTasks();
        } catch (err) {
            console.error('Failed to create task', err);
        }
    };

    const toggleStatus = async (task: Task) => {
        try {
            const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
            // Optimistic update
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
            await TaskService.updateStatus(task.id, newStatus);
        } catch (err) {
            console.error('Failed to update task', err);
            loadTasks(); // Revert on error
        }
    };

    if (isLoading) return <div>Chargement des tâches...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--text-1))' }}>Tâches</h1>
                    <p style={{ color: 'hsl(var(--text-2))' }}>Gérez vos priorités.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'var(--color-primary)',
                        color: 'white',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-md)'
                    }}
                >
                    <Plus size={20} />
                    Nouvelle Tâche
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreateTask} className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            autoFocus
                            placeholder="Que devez-vous faire ?"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-2)',
                                background: 'hsl(var(--surface-1))',
                                fontSize: '1rem'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!newTaskTitle}
                            style={{
                                padding: '0px 1.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                background: 'hsl(var(--surface-3))',
                                color: 'hsl(var(--text-1))',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Ajouter
                        </button>
                    </div>
                </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className="glass-panel"
                        style={{
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            opacity: task.status === 'DONE' ? 0.6 : 1,
                            transition: 'all 0.2s',
                            boxShadow: 'none',
                            border: '1px solid var(--border-2)'
                        }}
                    >
                        <button
                            onClick={() => toggleStatus(task)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: task.status === 'DONE' ? 'hsl(var(--valid))' : 'hsl(var(--text-3))',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {task.status === 'DONE' ? <CheckCircle size={24} /> : <Circle size={24} />}
                        </button>

                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => task.actorId && navigate(`/actors/${task.actorId}`)}>
                            <div style={{
                                fontSize: '1rem',
                                fontWeight: 500,
                                color: 'hsl(var(--text-1))',
                                textDecoration: task.status === 'DONE' ? 'line-through' : 'none'
                            }}>
                                {task.title}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                                {task.dueDate && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'hsl(var(--text-2))' }}>
                                        <Calendar size={12} />
                                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {task.actor && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'hsl(var(--primary))', fontWeight: 600 }}>
                                        <Users size={12} />
                                        <span>{task.actor.companyName || `${task.actor.firstName || ''} ${task.actor.lastName || ''}`}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            background: task.priority === 'HIGH' ? 'hsl(0 80% 90%)' : 'hsl(var(--surface-3))',
                            color: task.priority === 'HIGH' ? 'hsl(0 80% 40%)' : 'hsl(var(--text-3))'
                        }}>
                            {task.priority === 'HIGH' && <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                            {task.priority}
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && !isCreating && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--text-3))' }}>
                        Aucune tâche en cours. Profitez-en !
                    </div>
                )}
            </div>
        </div>
    );
};
