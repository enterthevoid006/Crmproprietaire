import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ActorService, type Actor } from '../services/actor.service';
import { Timeline } from '../../interactions/components/Timeline';
import { DocumentList } from '../../documents/components/DocumentList';
import { ClientTaskList } from '../../tasks/components/ClientTaskList';
import { CreateTaskModal } from '../../tasks/components/CreateTaskModal';
import { CreateNoteModal } from '../components/CreateNoteModal';
import {
    ArrowLeft, Mail, Phone, MapPin, Globe, FolderOpen,
    CheckSquare, Plus, FileText, TrendingUp, Activity,
    Building2, User, MoreHorizontal,
} from 'lucide-react';

const AVATAR_COLORS = [
    { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' },
    { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
    { bg: '#d1fae5', text: '#047857', border: '#6ee7b7' },
    { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
    { bg: '#ffe4e6', text: '#be123c', border: '#fda4af' },
    { bg: '#cffafe', text: '#0e7490', border: '#67e8f9' },
];

const getAvatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export const ActorDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [actor, setActor] = useState<Actor | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'deals' | 'tasks'>('timeline');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (id) {
            ActorService.getById(id)
                .then(setActor)
                .catch(err => console.error('Failed to load actor', err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleRefresh = () => setRefreshKey(prev => prev + 1);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Chargement...</span>
        </div>
    );

    if (!actor) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 500, color: '#111827' }}>Client introuvable</p>
                <button onClick={() => navigate('/actors')} style={{ fontSize: '0.875rem', color: '#4f46e5', marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Retour à la liste
                </button>
            </div>
        </div>
    );

    const displayName = actor.companyName || `${actor.firstName} ${actor.lastName}`;
    const initials = actor.type === 'INDIVIDUAL'
        ? `${actor.firstName?.[0] || ''}${actor.lastName?.[0] || ''}`
        : actor.companyName?.[0] || '';
    const avatarColor = getAvatarColor(displayName);
    const isProspect = actor.tags?.some(t => t.toLowerCase() === 'prospect');

    return (
        <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>

            {/* Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => navigate('/actors')}>
                    <ArrowLeft size={15} /> Retour à la liste
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }} onClick={() => setIsTaskModalOpen(true)}>
                        <CheckSquare size={14} /> Tâche
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }} onClick={() => setIsNoteModalOpen(true)}>
                        <FileText size={14} /> Note
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#4f46e5', border: '1px solid #4f46e5', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#fff', cursor: 'pointer' }} onClick={() => navigate('/opportunities/new')}>
                        <Plus size={14} /> Opportunité
                    </button>
                </div>
            </div>

            <CreateTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} actorId={actor.id}
                onSuccess={() => { handleRefresh(); setActiveTab('tasks'); }} />
            <CreateNoteModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} actorId={actor.id}
                onSuccess={() => { handleRefresh(); setActiveTab('timeline'); }} />

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', alignItems: 'start' }}>

                {/* ── SIDEBAR ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Identity Card */}
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        {/* Header */}
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid #f3f4f6', background: 'linear-gradient(to bottom, #f9fafb, #fff)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, flexShrink: 0, background: avatarColor.bg, color: avatarColor.text, border: `1px solid ${avatarColor.border}` }}>
                                        {initials.toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>{displayName}</h1>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
                                            {actor.type === 'CORPORATE' ? <Building2 size={11} color="#9ca3af" /> : <User size={11} color="#9ca3af" />}
                                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{actor.type === 'CORPORATE' ? 'Entreprise' : 'Particulier'}</span>
                                            <span style={{ color: '#d1d5db' }}>·</span>
                                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>{actor.id.slice(0, 8)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                                    <span style={{ padding: '0.125rem 0.5rem', fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderRadius: '0.375rem', background: isProspect ? '#fffbeb' : '#ecfdf5', color: isProspect ? '#d97706' : '#059669', border: `1px solid ${isProspect ? '#fde68a' : '#a7f3d0'}` }}>
                                        {isProspect ? 'Prospect' : 'Actif'}
                                    </span>
                                    <button style={{ padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', borderRadius: '0.375rem' }}>
                                        <MoreHorizontal size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
                            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 0.75rem 0' }}>Coordonnées</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <ContactRow icon={Mail} label="Email" value={actor.email} href={`mailto:${actor.email}`} isLink />
                                <ContactRow icon={Phone} label="Tél" value={actor.phone} href={`tel:${actor.phone}`} isLink />
                                <ContactRow icon={MapPin} label="Adresse" value={actor.address} />
                                <ContactRow icon={Globe} label="Source" value={actor.source} />
                            </div>
                        </div>

                        {/* Tags */}
                        <div style={{ padding: '0.75rem 1.25rem 1.25rem', borderTop: '1px solid #f3f4f6' }}>
                            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 0.75rem 0' }}>Tags</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.375rem' }}>
                                {actor.tags && actor.tags.length > 0 ? actor.tags.map(tag => (
                                    <span key={tag} style={{ padding: '0.125rem 0.5rem', background: '#f3f4f6', color: '#4b5563', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 500, border: '1px solid #e5e7eb' }}>{tag}</span>
                                )) : <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>Non classifié</span>}
                            </div>
                        </div>
                    </div>

                    {/* Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <MetricCard label="Chiffre d'affaires" value="0,00 €" icon={TrendingUp} color="#4f46e5" bgColor="#eef2ff" />
                        <MetricCard label="Opportunités" value="0" icon={FolderOpen} color="#7c3aed" bgColor="#f5f3ff" />
                    </div>

                    {/* Quick Actions */}
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '1.25rem' }}>
                        <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 0.75rem 0' }}>Actions rapides</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <QuickAction icon={CheckSquare} label="Créer une tâche" onClick={() => setIsTaskModalOpen(true)} />
                            <QuickAction icon={FileText} label="Ajouter une note" onClick={() => setIsNoteModalOpen(true)} />
                            <QuickAction icon={Plus} label="Nouvelle opportunité" onClick={() => navigate('/opportunities/new')} primary />
                        </div>
                    </div>
                </div>

                {/* ── MAIN CONTENT ── */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 0.5rem', paddingTop: '0.5rem' }}>
                        {([
                            { key: 'timeline', label: 'Activité', icon: Activity, count: null },
                            { key: 'deals', label: 'Opportunités', icon: TrendingUp, count: 0 },
                            { key: 'documents', label: 'Documents', icon: FileText, count: 0 },
                            { key: 'tasks', label: 'Tâches', icon: CheckSquare, count: 0 },
                        ] as const).map(tab => (
                            <TabButton key={tab.key} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} label={tab.label} icon={tab.icon} count={tab.count} />
                        ))}
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.25rem', minHeight: '420px' }}>
                        {activeTab === 'timeline' && <Timeline key={refreshKey} actorId={actor.id} />}
                        {activeTab === 'documents' && <DocumentList key={refreshKey} actorId={actor.id} />}
                        {activeTab === 'tasks' && <ClientTaskList key={refreshKey} actorId={actor.id} />}
                        {activeTab === 'deals' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
                                <div style={{ width: '3.5rem', height: '3.5rem', background: '#f3f4f6', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <FolderOpen size={24} color="#9ca3af" />
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '0 0 0.25rem 0' }}>Aucune opportunité</h3>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1.25rem 0' }}>Aucune opportunité liée à ce contact.</p>
                                <button onClick={() => navigate('/opportunities/new')} style={{ fontSize: '0.875rem', fontWeight: 500, color: '#4f46e5', border: '1px solid #c7d2fe', background: '#eef2ff', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
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

const ContactRow = ({ icon: Icon, label, value, isLink, href }: any) => {
    if (!value) return null;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.375rem 0' }}>
            <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={11} color="#6b7280" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.625rem', color: '#9ca3af', display: 'block', lineHeight: 1 }}>{label}</span>
                {isLink
                    ? <a href={href} style={{ fontSize: '0.8125rem', color: '#4f46e5', textDecoration: 'none', fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</a>
                    : <span style={{ fontSize: '0.8125rem', color: '#374151', fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                }
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
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', display: 'block', lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: '0.6875rem', color: '#9ca3af', marginTop: '0.25rem', display: 'block' }}>{label}</span>
        </div>
    </div>
);

const QuickAction = ({ icon: Icon, label, onClick, primary }: any) => (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left', background: primary ? '#eef2ff' : 'transparent', color: primary ? '#4f46e5' : '#4b5563', border: primary ? '1px solid #c7d2fe' : '1px solid transparent' }}>
        <Icon size={14} />{label}
    </button>
);

const TabButton = ({ active, onClick, label, icon: Icon, count }: any) => (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.625rem 1rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', borderBottom: active ? '2px solid #4f46e5' : '2px solid transparent', color: active ? '#4f46e5' : '#6b7280', marginBottom: '-1px' }}>
        <Icon size={13} />{label}
        {count !== null && count !== undefined && (
            <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', borderRadius: '0.375rem', fontWeight: 700, background: active ? '#e0e7ff' : '#f3f4f6', color: active ? '#4f46e5' : '#6b7280' }}>{count}</span>
        )}
    </button>
);

