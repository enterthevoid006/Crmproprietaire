import { useEffect, useState } from 'react';
import { OpportunityService, type Opportunity } from '../services/opportunity.service';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PipelineKanbanBoard } from '../components/PipelineKanbanBoard';

export const OpportunitiesListPage = () => {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [error, setError] = useState('');

    useEffect(() => {
        loadOpportunities();
    }, []);

    const loadOpportunities = async () => {
        try {
            setIsLoading(true);
            const data = await OpportunityService.getAll();
            setOpportunities(data);
        } catch (err) {
            setError('Impossible de charger le pipeline.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStage: string) => {
        // Optimistic update
        setOpportunities(prev => prev.map(op =>
            op.id === id ? { ...op, stage: newStage as any } : op
        ));

        try {
            await OpportunityService.update(id, { stage: newStage as any });
        } catch (err) {
            console.error('Failed to update stage', err);
            // Revert on error
            loadOpportunities();
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Chargement du pipeline...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="h-screen flex flex-col overflow-hidden relative bg-[#F8FAFC]">
            {/* Vibrant Background Mesh Gradient */}
            <div className="absolute inset-0 pointer-events-none z-0" style={{
                backgroundImage: `
                    radial-gradient(at 0% 0%, hsla(250,90%,96%,1) 0, transparent 55%), 
                    radial-gradient(at 50% 0%, hsla(225,95%,94%,1) 0, transparent 50%), 
                    radial-gradient(at 100% 0%, hsla(340,90%,96%,1) 0, transparent 55%),
                    radial-gradient(at 0% 100%, hsla(200,90%,96%,1) 0, transparent 50%),
                    radial-gradient(at 100% 100%, hsla(280,90%,96%,1) 0, transparent 50%)
                `,
                backgroundSize: '120% 120%',
                opacity: 1,
            }}></div>

            <div className="absolute inset-0 z-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

            {/* Header */}
            <div className="flex-none p-6 pb-0 flex justify-between items-center z-20 relative">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pipeline Commercial</h1>
                    <p className="text-gray-500 text-sm">Gérez vos opportunités et suivez vos performances.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-md transition ${viewMode === 'kanban' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                    <Link
                        to="/opportunities/new"
                        className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-200/50 font-semibold text-base"
                    >
                        <Plus size={20} />
                        <span>Nouvelle Opportunité</span>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-6">
                {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">{error}</div>}

                {viewMode === 'kanban' ? (
                    <PipelineKanbanBoard
                        opportunities={opportunities}
                        isLoading={isLoading}
                        onStatusChange={handleStatusChange}
                    />
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Opportunité</th>
                                    <th className="px-6 py-3">Client</th>
                                    <th className="px-6 py-3">Montant</th>
                                    <th className="px-6 py-3">Étape</th>
                                    <th className="px-6 py-3">Probabilité</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {opportunities.map((opp) => (
                                    <tr key={opp.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{opp.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{opp.actor?.companyName || 'N/A'}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(opp.amount)}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">{opp.stage}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{opp.probability}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
