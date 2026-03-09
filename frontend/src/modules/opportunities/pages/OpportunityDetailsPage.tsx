import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OpportunityService, type Opportunity } from '../services/opportunity.service';
import { ArrowLeft, DollarSign, Calendar, Building2, User, CheckSquare, FileText, Plus, TrendingUp, Activity, Target } from 'lucide-react';

const STAGE_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
    PROSPECTING:  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', label: 'Prospection' },
    QUALIFICATION:{ bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: 'Qualification' },
    PROPOSAL:     { bg: '#fefce8', text: '#a16207', border: '#fde68a', label: 'Proposition' },
    NEGOTIATION:  { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', label: 'Négociation' },
    CLOSED_WON:   { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', label: 'Gagné' },
    CLOSED_LOST:  { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'Perdu' },
};

const getStageColor = (stage: string) => STAGE_COLORS[stage] ?? { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb', label: stage };

export const OpportunityDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'activity' | 'quotes'>('activity');

    useEffect(() => {
        if (!id) return;
        loadOpportunity();
    }, [id]);

    const loadOpportunity = async () => {
        try {
            setIsLoading(true);
            const data = await OpportunityService.getById(id!);
            setOpportunity(data);
        } catch (err) {
            setError('Impossible de charger l\'opportunité.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
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

    const stageColor = getStageColor(opportunity.stage);
    const isOverdue = opportunity.expectedCloseDate && new Date(opportunity.expectedCloseDate) < new Date();
    const formattedAmount = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(opportunity.amount);
    const displayName = opportunity.actor?.companyName || (opportunity.actor ? `${opportunity.actor.firstName} ${opportunity.actor.lastName}` : null);

    return (
        <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>

            {/* Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <button
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => navigate('/opportunities')}
                >
                    <ArrowLeft size={15} /> Retour au pipeline
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                        <CheckSquare size={14} /> Tâche
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                        <FileText size={14} /> Note
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#4f46e5', border: '1px solid #4f46e5', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#fff', cursor: 'pointer' }}>
                        <Plus size={14} /> Action
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', alignItems: 'start' }}>

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
                                    <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>{opportunity.name}</h1>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem', flexWrap: 'wrap' as const }}>
                                        <span style={{ padding: '0.125rem 0.5rem', fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderRadius: '0.375rem', background: stageColor.bg, color: stageColor.text, border: `1px solid ${stageColor.border}` }}>
                                            {stageColor.label}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>{opportunity.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financier */}
                        <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
                            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 0.75rem 0' }}>Financier</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <InfoRow icon={DollarSign} label="Montant" value={formattedAmount} bold />
                                <InfoRow
                                    label="Probabilité"
                                    value={`${opportunity.probability}%`}
                                    valueColor={opportunity.probability > 70 ? '#059669' : '#374151'}
                                    bold={opportunity.probability > 70}
                                />
                                <InfoRow
                                    icon={Calendar}
                                    label="Clôture prévue"
                                    value={opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toLocaleDateString('fr-FR') : undefined}
                                    valueColor={isOverdue ? '#dc2626' : '#374151'}
                                />
                            </div>
                        </div>

                        {/* Client */}
                        <div style={{ padding: '0.75rem 1.25rem 1.25rem', borderTop: '1px solid #f3f4f6' }}>
                            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 0.75rem 0' }}>Client lié</p>
                            {opportunity.actor && displayName ? (
                                <div
                                    onClick={() => navigate(`/actors/${opportunity.actorId}`)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', cursor: 'pointer' }}
                                >
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
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 0.5rem', paddingTop: '0.5rem' }}>
                        <TabButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} label="Activité" icon={Activity} />
                        <TabButton active={activeTab === 'quotes'} onClick={() => setActiveTab('quotes')} label="Devis" icon={FileText} />
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.25rem', minHeight: '420px' }}>
                        {activeTab === 'activity' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
                                <div style={{ width: '3.5rem', height: '3.5rem', background: '#f3f4f6', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <Activity size={24} color="#9ca3af" />
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '0 0 0.25rem 0' }}>Aucune activité</h3>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1.25rem 0' }}>Les interactions et notes liées à cette opportunité apparaîtront ici.</p>
                                <button style={{ fontSize: '0.875rem', fontWeight: 500, color: '#4f46e5', border: '1px solid #c7d2fe', background: '#eef2ff', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                                    + Ajouter une note
                                </button>
                            </div>
                        )}
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

// ── Helpers ──

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

const TabButton = ({ active, onClick, label, icon: Icon }: any) => (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.625rem 1rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', borderBottom: active ? '2px solid #4f46e5' : '2px solid transparent', color: active ? '#4f46e5' : '#6b7280', marginBottom: '-1px' }}>
        <Icon size={13} />{label}
    </button>
);
