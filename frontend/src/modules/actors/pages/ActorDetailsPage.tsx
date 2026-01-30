import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ActorService, type Actor } from '../services/actor.service';
import { Timeline } from '../../interactions/components/Timeline';
import { DocumentList } from '../../documents/components/DocumentList';
import { ClientTaskList } from '../../tasks/components/ClientTaskList';
import { CreateTaskModal } from '../../tasks/components/CreateTaskModal';
import { CreateNoteModal } from '../components/CreateNoteModal';
import { ArrowLeft, MapPin, Mail, Phone, Globe, FolderOpen, CheckSquare, Plus, FileText } from 'lucide-react';

export const ActorDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [actor, setActor] = useState<Actor | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'deals' | 'tasks'>('timeline');

    // Modal States
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); // Force refresh of lists

    useEffect(() => {
        if (id) {
            ActorService.getById(id)
                .then(setActor)
                .catch(err => console.error('Failed to load actor', err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (loading) return <div>Chargement...</div>;
    if (!actor) return <div>Client introuvable</div>;

    const initials = actor.type === 'INDIVIDUAL'
        ? `${actor.firstName?.[0] || ''}${actor.lastName?.[0] || ''}`
        : actor.companyName?.[0] || '';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate('/actors')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium rounded-sm"
                >
                    <ArrowLeft size={16} />
                    Retour à la liste
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm rounded-sm"
                    >
                        <CheckSquare size={16} />
                        Tâche
                    </button>
                    <button
                        onClick={() => setIsNoteModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm rounded-sm"
                    >
                        <FileText size={16} />
                        Note
                    </button>
                    <button
                        onClick={() => navigate('/opportunities/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white text-sm font-medium hover:bg-indigo-800 transition-colors shadow-sm rounded-sm"
                    >
                        <Plus size={16} />
                        Opportunité
                    </button>
                </div>
            </div>

            {/* Modals */}
            <CreateTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                actorId={actor.id}
                onSuccess={() => {
                    handleRefresh();
                    setActiveTab('tasks');
                }}
            />
            <CreateNoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                actorId={actor.id}
                onSuccess={() => {
                    handleRefresh();
                    setActiveTab('timeline');
                }}
            />

            <div className="grid grid-cols-12 gap-6 items-start">

                {/* STRICT SIDEBAR */}
                <div className="col-span-12 lg:col-span-4 space-y-4">

                    {/* Main Identity Card */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-[4px]">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-700 border border-gray-300 rounded-[2px]">
                                        {initials.toUpperCase()}
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-bold text-gray-900 leading-tight">
                                            {actor.companyName || `${actor.firstName} ${actor.lastName}`}
                                        </h1>
                                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                            {actor.type === 'CORPORATE' ? 'Entreprise' : 'Particulier'}
                                            <span className="text-gray-300">•</span>
                                            ID: {actor.id.slice(0, 8)}
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border rounded-[2px] ${(actor.tags?.includes('Prospect') || actor.tags?.includes('prospect'))
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}>
                                    {(actor.tags?.includes('Prospect') || actor.tags?.includes('prospect')) ? 'Prospect' : 'Actif'}
                                </span>
                            </div>
                        </div>

                        {/* Details List */}
                        <div className="p-4 space-y-4">
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-1">Coordonnées</h3>
                                <div className="space-y-2">
                                    <DataRow label="Email" value={actor.email} isLink href={`mailto:${actor.email}`} icon={Mail} />
                                    <DataRow label="Téléphone" value={actor.phone} isLink href={`tel:${actor.phone}`} icon={Phone} />
                                    <DataRow label="Adresse" value={actor.address} icon={MapPin} />
                                    <DataRow label="Source" value={actor.source} icon={Globe} />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-1">Classification</h3>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {actor.tags && actor.tags.length > 0 ? (
                                        actor.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-[2px] text-xs font-medium border border-gray-200">
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-xs italic">Non classifié</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics (Dense) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-[4px] flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase">Chiffre d'affaires</span>
                            <span className="text-lg font-bold text-gray-900 mt-1">0,00 €</span>
                        </div>
                        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-[4px] flex flex-col">
                            <span className="text-xs font-medium text-gray-500 uppercase">Opportunités</span>
                            <span className="text-lg font-bold text-gray-900 mt-1">0</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT AREA */}
                <div className="col-span-12 lg:col-span-8">

                    {/* Tabs - Strict Underline */}
                    <div className="flex items-center gap-1 border-b border-gray-200 mb-6 bg-white px-1 pt-1 rounded-t-[4px] border-x border-t">
                        <TabButton
                            active={activeTab === 'timeline'}
                            onClick={() => setActiveTab('timeline')}
                            label="Activité"
                            count={null}
                        />
                        <TabButton
                            active={activeTab === 'deals'}
                            onClick={() => setActiveTab('deals')}
                            label="Opportunités"
                            count={0}
                        />
                        <TabButton
                            active={activeTab === 'documents'}
                            onClick={() => setActiveTab('documents')}
                            label="Documents"
                            count={0}
                        />
                        <TabButton
                            active={activeTab === 'tasks'}
                            onClick={() => setActiveTab('tasks')}
                            label="Tâches"
                            count={0}
                        />
                    </div>

                    {/* Tab Content Area */}
                    <div className="bg-white min-h-[400px]">
                        {activeTab === 'timeline' && <Timeline key={refreshKey} actorId={actor.id} />}
                        {activeTab === 'documents' && <DocumentList key={refreshKey} actorId={actor.id} />}
                        {activeTab === 'tasks' && <ClientTaskList key={refreshKey} actorId={actor.id} />}
                        {activeTab === 'deals' && (
                            <div className="bg-white p-12 border border-gray-200 border-dashed rounded-[4px] text-center">
                                <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <FolderOpen className="text-gray-400" size={24} />
                                </div>
                                <h3 className="text-base font-medium text-gray-900">Aucune opportunité</h3>
                                <p className="text-sm text-gray-500 mt-1 mb-4">Ce dossier est vide pour le moment.</p>
                                <button
                                    onClick={() => navigate('/opportunities/new')}
                                    className="text-sm font-medium text-indigo-700 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-300 bg-indigo-50 px-3 py-1.5 rounded-[2px]"
                                >
                                    + Créer une opportunité
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Strict Helper Components ---

const DataRow = ({ label, value, isLink, href }: any) => {
    if (!value) return null;
    return (
        <div className="grid grid-cols-[100px_1fr] items-start gap-2 py-1.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors px-2 -mx-2 rounded-[2px]">
            <span className="text-xs text-gray-500 font-semibold pt-0.5">{label}</span>
            <div className="flex items-center gap-2 min-w-0">
                {isLink ? (
                    <a href={href} className="text-sm text-indigo-700 hover:text-indigo-900 hover:underline truncate font-medium">
                        {value}
                    </a>
                ) : (
                    <span className="text-sm text-gray-800 font-medium truncate select-all">
                        {value}
                    </span>
                )}
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, label, count }: any) => (
    <button
        onClick={onClick}
        className={`
            px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 
            flex items-center gap-2
            ${active
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/10'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
        `}
    >
        {label}
        {(count !== null && count !== undefined) && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-[2px] font-bold ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                {count}
            </span>
        )}
    </button>
);
