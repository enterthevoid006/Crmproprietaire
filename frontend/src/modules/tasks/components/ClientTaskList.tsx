import { useState, useEffect } from 'react';
import { TaskService, type Task } from '../services/task.service';
import { CheckCircle, Circle, Trash2, Plus, Calendar } from 'lucide-react';

interface ClientTaskListProps {
    actorId: string;
}

export const ClientTaskList = ({ actorId }: ClientTaskListProps) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');

    useEffect(() => {
        loadTasks();
    }, [actorId]);

    const loadTasks = async () => {
        try {
            const allTasks = await TaskService.getAll();
            // Filter by actorId manually since backend getAll returns all tenant tasks
            const clientTasks = allTasks.filter(t => t.actorId === actorId);
            setTasks(clientTasks);
        } catch (err) {
            console.error('Failed to load tasks', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await TaskService.create({
                title: newTitle,
                dueDate: newDate ? new Date(newDate).toISOString() : undefined,
                actorId,
                priority: 'MEDIUM'
            });
            setNewTitle('');
            setNewDate('');
            setIsAdding(false);
            loadTasks();
        } catch (err) {
            console.error('Failed to create task', err);
        }
    };

    const toggleStatus = async (task: Task) => {
        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        try {
            await TaskService.updateStatus(task.id, newStatus);
            // Optimistic update
            setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        } catch (err) {
            console.error('Failed to update status', err);
            loadTasks(); // Revert on error
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer cette tâche ?')) return;
        try {
            await TaskService.delete(id);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (err) {
            console.error('Failed to delete task', err);
        }
    };

    if (loading) return <div>Chargement des tâches...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <CheckCircle size={18} />
                    Tâches
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={16} />
                    Ajouter
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleCreate} className="p-4 border-b border-gray-100 bg-blue-50/50">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Nouvelle tâche..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            autoFocus
                            required
                        />
                        <input
                            type="date"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newDate}
                            onChange={e => setNewDate(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                            OK
                        </button>
                    </div>
                </form>
            )}

            <div className="divide-y divide-gray-100">
                {tasks.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        Aucune tâche pour ce client.
                    </div>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="p-3 hover:bg-gray-50 flex items-center justify-between group transition">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => toggleStatus(task)}
                                    className={`transition-colors ${task.status === 'DONE' ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'}`}
                                >
                                    {task.status === 'DONE' ? <CheckCircle size={20} /> : <Circle size={20} />}
                                </button>
                                <div>
                                    <div className={`text-sm font-medium ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                        {task.title}
                                    </div>
                                    {task.dueDate && (
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                            <Calendar size={12} />
                                            {new Date(task.dueDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(task.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition"
                                title="Supprimer"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
