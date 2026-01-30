import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OpportunityService, type Opportunity } from '../services/opportunity.service';
import { ArrowLeft, DollarSign, Calendar, Building2, User, CheckSquare, FileText, Plus } from 'lucide-react';

export const OpportunityDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

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

    if (isLoading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;
    if (error || !opportunity) return <div className="p-8 text-center text-red-600">{error || 'Opportunité introuvable'}</div>;

    const isOverdue = opportunity.expectedCloseDate && new Date(opportunity.expectedCloseDate) < new Date();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate('/opportunities')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium rounded-sm"
                >
                    <ArrowLeft size={16} />
                    Retour au Pipeline
                </button>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm rounded-sm">
                        <CheckSquare size={16} />
                        Tâche
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm rounded-sm">
                        <FileText size={16} />
                        Note
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white text-sm font-medium hover:bg-indigo-800 transition-colors shadow-sm rounded-sm"
                    >
                        <Plus size={16} />
                        Action
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 items-start">

                {/* STRICT SIDEBAR - Left (Context) */}
                <div className="col-span-12 lg:col-span-4 space-y-4">

                    {/* Main Identity Card */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-[4px]">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h1 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                                {opportunity.name}
                            </h1>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-[2px] font-mono font-bold">
                                    {opportunity.stage}
                                </span>
                                <span>• ID: {opportunity.id.slice(0, 8)}</span>
                            </div>
                        </div>

                        {/* Details List */}
                        <div className="p-4 space-y-4">
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-1">Financier</h3>
                                <div className="space-y-2">
                                    <DataRow
                                        label="Montant"
                                        value={new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(opportunity.amount)}
                                        icon={DollarSign}
                                        valueClass="font-bold text-gray-900"
                                    />
                                    <DataRow
                                        label="Probabilité"
                                        value={`${opportunity.probability}%`}
                                        valueClass={opportunity.probability > 70 ? 'text-emerald-600 font-bold' : 'text-gray-700'}
                                    />
                                    <DataRow
                                        label="Clôture"
                                        value={opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toLocaleDateString() : '-'}
                                        icon={Calendar}
                                        valueClass={isOverdue ? 'text-red-600 font-bold' : 'text-gray-700'}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-1">Client</h3>
                                {opportunity.actor ? (
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-[2px] hover:bg-gray-100 transition-colors cursor-pointer group" onClick={() => navigate(`/actors/${opportunity.actorId}`)}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-white border border-gray-200 flex items-center justify-center rounded-[2px] text-gray-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                                                {opportunity.actor.companyName ? <Building2 size={16} /> : <User size={16} />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                                    {opportunity.actor.companyName || `${opportunity.actor.firstName} ${opportunity.actor.lastName}`}
                                                </div>
                                                <div className="text-xs text-gray-500">Client lié</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-400 italic">Aucun client lié</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT AREA - History */}
                <div className="col-span-12 lg:col-span-8">
                    {/* Placeholder for Tabs/Timeline */}
                    <div className="flex items-center gap-1 border-b border-gray-200 mb-6 bg-white px-1 pt-1 rounded-t-[4px] border-x border-t">
                        <button className="px-4 py-2.5 text-sm font-semibold border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50/10 flex items-center gap-2">
                            Historique
                        </button>
                        <button className="px-4 py-2.5 text-sm font-semibold border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2">
                            Devis
                        </button>
                    </div>

                    <div className="bg-white p-6 border border-gray-200 rounded-[4px] min-h-[400px] flex items-center justify-center text-gray-400 text-sm">
                        Construction de l'historique en cours...
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- Strict Helper Components ---

const DataRow = ({ label, value, valueClass = "text-gray-800 font-medium" }: any) => {
    if (!value) return null;
    return (
        <div className="grid grid-cols-[100px_1fr] items-center gap-2 py-1.5 border-b border-gray-50 last:border-0 px-2 -mx-2">
            <span className="text-xs text-gray-500 font-semibold">{label}</span>
            <span className={`text-sm truncate select-all ${valueClass}`}>
                {value}
            </span>
        </div>
    );
};
