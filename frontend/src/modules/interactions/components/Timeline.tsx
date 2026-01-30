import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { InteractionService, type Interaction } from '../services/interaction.service';
import { TaskService, type Task } from '../../tasks/services/task.service';
import { Mail, Phone, Users, FileText, Plus, MessageSquare, Trash2, CheckSquare } from 'lucide-react';

interface TimelineProps {
    actorId?: string;
    opportunityId?: string;
}

// Union type for the list
type TimelineItem = (Interaction & { kind: 'INTERACTION' }) | (Task & { kind: 'TASK', date: string, details?: string, summary: string, type: 'TASK' });

export const Timeline = ({ actorId, opportunityId }: TimelineProps) => {
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [formType, setFormType] = useState('NOTE');
    const [formSummary, setFormSummary] = useState('');
    const [formDetails, setFormDetails] = useState('');
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadData();
    }, [actorId, opportunityId]);

    const loadData = async () => {
        try {
            // 1. Fetch Interactions
            let interactions: Interaction[] = [];
            if (actorId) {
                interactions = await InteractionService.getByActor(actorId);
            } else if (opportunityId) {
                interactions = await InteractionService.getByOpportunity(opportunityId);
            }

            // 2. Fetch Tasks (Manually filtered for now)
            let tasks: Task[] = [];
            if (actorId) {
                const allTasks = await TaskService.getAll();
                tasks = allTasks.filter(t => t.actorId === actorId);
            }

            // 3. Normalize and Merge
            const normalizedInteractions = interactions.map(i => ({ ...i, kind: 'INTERACTION' as const }));

            const normalizedTasks = tasks.map(t => ({
                ...t,
                kind: 'TASK' as const,
                type: 'TASK' as const, // For switch case compatibility
                date: t.createdAt,      // Use creation date for timeline
                summary: t.title,
                details: t.description || undefined
            }));

            const combined = [...normalizedInteractions, ...normalizedTasks];

            // 4. Sort by Date Descending
            setItems(combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

        } catch (err) {
            console.error('Failed to load timeline data', err);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await InteractionService.create({
                type: formType as any,
                summary: formSummary,
                details: formDetails,
                date: new Date(formDate).toISOString(),
                actorId,
                opportunityId
            });
            setIsAdding(false);
            setFormSummary('');
            setFormDetails('');
            loadData();
        } catch (err) {
            console.error('Failed to add interaction', err);
        }
    };

    const getTypeConfig = (type: string, item?: TimelineItem) => {
        switch (type) {
            case 'EMAIL': return { icon: Mail, label: 'Email', color: 'text-blue-700 bg-blue-50 border-blue-200' };
            case 'CALL': return { icon: Phone, label: 'Appel', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
            case 'MEETING': return { icon: Users, label: 'Réunion', color: 'text-amber-700 bg-amber-50 border-amber-200' };
            case 'NOTE': return { icon: FileText, label: 'Note', color: 'text-gray-700 bg-gray-100 border-gray-200' };
            case 'TASK': {
                const isDone = item?.kind === 'TASK' && item.status === 'DONE';
                return {
                    icon: CheckSquare,
                    label: isDone ? 'Tâche (Terminée)' : 'Tâche',
                    color: isDone ? 'text-green-700 bg-green-50 border-green-200' : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                };
            }
            default: return { icon: MessageSquare, label: 'Autre', color: 'text-gray-700 bg-gray-100 border-gray-200' };
        }
    };

    const handleDelete = async (item: TimelineItem) => {
        if (!confirm('Supprimer cet élément ?')) return;
        try {
            if (item.kind === 'INTERACTION') {
                await InteractionService.delete(item.id);
            } else {
                await TaskService.delete(item.id);
            }
            loadData();
        } catch (err) {
            console.error('Failed to delete item', err);
        }
    };

    return (
        <div className="border border-gray-200 border-t-0 bg-white min-h-[500px] flex flex-col">

            {/* Toolbar */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Flux d'activités</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 shadow-sm text-gray-700 font-semibold text-xs hover:bg-gray-50 hover:border-gray-400 transition-all rounded-[2px]"
                >
                    <Plus size={14} /> Ajouter une note
                </button>
            </div>

            {/* Add Form Block */}
            {isAdding && (
                <div className="p-6 bg-gray-50 border-b border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                    <form onSubmit={handleSubmit} className="bg-white border border-gray-300 shadow-sm p-4 rounded-[2px]">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type d'activité</label>
                                <select
                                    value={formType}
                                    onChange={(e) => setFormType(e.target.value)}
                                    className="w-full pl-2 pr-8 py-1.5 bg-white border border-gray-300 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-[2px]"
                                >
                                    <option value="NOTE">Note Interne</option>
                                    <option value="CALL">Appel Téléphonique</option>
                                    <option value="EMAIL">Email Envoyé</option>
                                    <option value="MEETING">Rendez-vous Client</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                                <input
                                    type="date"
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    className="w-full px-2 py-1.5 bg-white border border-gray-300 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-[2px]"
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <input
                                placeholder="Titre de l'activité (ex: CR appel qualification)"
                                value={formSummary}
                                onChange={(e) => setFormSummary(e.target.value)}
                                required
                                className="w-full px-2 py-1.5 font-bold text-gray-800 placeholder-gray-400 border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm rounded-[2px]"
                            />
                        </div>

                        <div className="mb-4">
                            <textarea
                                placeholder="Détails complets..."
                                value={formDetails}
                                onChange={(e) => setFormDetails(e.target.value)}
                                rows={4}
                                className="w-full p-2 bg-white border border-gray-300 text-sm text-gray-700 resize-y focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-[2px]"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-3 py-1.5 text-gray-600 hover:text-gray-900 font-medium text-xs uppercase"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-1.5 bg-gray-900 text-white font-bold text-xs uppercase hover:bg-gray-800 transition shadow-sm rounded-[2px]"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="flex-1 bg-gray-50/30 p-6 overflow-y-auto">
                {items.length === 0 ? (
                    <div className="text-center py-12 border border-gray-200 border-dashed bg-gray-50 rounded-[2px]">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-white border border-gray-200 shadow-sm mb-2 rounded-[2px]">
                            <MessageSquare className="text-gray-400" size={20} />
                        </div>
                        <h4 className="text-gray-900 font-bold text-sm">Vide</h4>
                        <p className="text-xs text-gray-500">Aucune activité enregistrée.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => {
                            const config = getTypeConfig(item.type, item);
                            const Icon = config.icon;

                            return (
                                <div key={`${item.kind}-${item.id}`} className="relative flex gap-4 group">
                                    {/* Timeline Line */}
                                    <div className="absolute left-[15px] top-8 bottom-[-16px] w-[1px] bg-gray-200 group-last:hidden"></div>

                                    {/* Icon Marker */}
                                    <div className={`
                                        z-10 w-8 h-8 flex items-center justify-center border text-[10px] shadow-sm rounded-[2px] shrink-0
                                        ${config.color} bg-white
                                    `}>
                                        <Icon size={14} />
                                    </div>

                                    {/* Content Card */}
                                    <div className="flex-1 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-0 rounded-[2px] overflow-hidden">
                                        <div className="bg-gray-50 border-b border-gray-100 px-3 py-2 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{config.label}</span>
                                                <span className="text-gray-300">|</span>
                                                <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                                    {new Date(item.date).toLocaleDateString()}
                                                    <span className="text-gray-300">•</span>
                                                    {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="text-gray-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        <div className="p-3">
                                            <h4 className={`font-bold text-sm text-gray-900 mb-1 ${item.kind === 'TASK' && 'status' in item && item.status === 'DONE' ? 'line-through text-gray-500' : ''}`}>
                                                {item.summary}
                                            </h4>
                                            {item.details && (
                                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-mono text-[13px]">
                                                    {item.details}
                                                </p>
                                            )}
                                        </div>
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
