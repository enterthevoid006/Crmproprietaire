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

    useEffect(() => { loadOpportunities(); }, []);

    const loadOpportunities = async () => {
        try {
            setIsLoading(true);
            const data = await OpportunityService.getAll();
            setOpportunities(data);
        } catch (err) {
            setError('Impossible de charger le pipeline.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStage: string) => {
        setOpportunities(prev => prev.map(op => op.id === id ? { ...op, stage: newStage as any } : op));
        try {
            await OpportunityService.update(id, { stage: newStage as any });
        } catch {
            loadOpportunities();
        }
    };

    if (isLoading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Chargement du pipeline...</span>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '1.5rem 1.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>Pipeline Commercial</h1>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>Gérez vos opportunités et suivez vos performances.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* View toggle */}
                    <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '0.5rem', padding: '0.25rem', gap: '0.25rem' }}>
                        <button
                            onClick={() => setViewMode('kanban')}
                            style={{ padding: '0.375rem 0.625rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', background: viewMode === 'kanban' ? '#fff' : 'transparent', color: viewMode === 'kanban' ? '#4f46e5' : '#6b7280', boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{ padding: '0.375rem 0.625rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', background: viewMode === 'list' ? '#fff' : 'transparent', color: viewMode === 'list' ? '#4f46e5' : '#6b7280', boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}
                        >
                            <List size={16} />
                        </button>
                    </div>
                    <Link
                        to="/opportunities/new"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#4f46e5', color: '#fff', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}
                    >
                        <Plus size={16} /> Nouvelle Opportunité
                    </Link>
                </div>
            </div>

            {error && (
                <div style={{ margin: '1rem 1.5rem 0', padding: '0.75rem 1rem', background: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', fontSize: '0.875rem' }}>{error}</div>
            )}

            {/* Content */}
            <div style={{ flex: 1, overflow: 'hidden', padding: '1.25rem 1.5rem' }}>
                {viewMode === 'kanban' ? (
                    <PipelineKanbanBoard
                        opportunities={opportunities}
                        isLoading={isLoading}
                        onStatusChange={handleStatusChange}
                    />
                ) : (
                    <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    {['Opportunité', 'Client', 'Montant', 'Étape', 'Probabilité'].map(h => (
                                        <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {opportunities.map(opp => (
                                    <tr key={opp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>{opp.name}</td>
                                        <td style={{ padding: '0.875rem 1.25rem', color: '#6b7280', fontSize: '0.875rem' }}>{opp.actor?.companyName || 'N/A'}</td>
                                        <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(opp.amount)}</td>
                                        <td style={{ padding: '0.875rem 1.25rem' }}>
                                            <span style={{ padding: '0.25rem 0.625rem', background: '#f3f4f6', color: '#374151', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>{opp.stage}</span>
                                        </td>
                                        <td style={{ padding: '0.875rem 1.25rem', color: '#6b7280', fontSize: '0.875rem' }}>{opp.probability}%</td>
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