import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { ActorService, type Actor } from '../services/actor.service';
import { Timeline } from '../../interactions/components/Timeline';
import { DocumentList } from '../../documents/components/DocumentList';
import { ClientTaskList } from '../../tasks/components/ClientTaskList';
import { CreateTaskModal } from '../../tasks/components/CreateTaskModal';
import { CreateNoteModal } from '../components/CreateNoteModal';
import { ActorQuoteTab } from '../components/ActorQuoteTab';
import { ActorInvoiceTab } from '../components/ActorInvoiceTab';
import {
    ArrowLeft, Mail, Phone, MapPin, Globe, FolderOpen,
    CheckSquare, Plus, FileText, TrendingUp, Activity,
    Building2, User, Edit2, X, Check, Euro,
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
    const isMobile = useIsMobile();
    const [actor, setActor] = useState<Actor | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'deals' | 'tasks' | 'quotes' | 'invoices'>('timeline');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        companyName: '',
        email: '',
        phone: '',
        address: '',
        source: '',
        tagsInput: '',
        inactive: false,
    });

    useEffect(() => {
        if (id) {
            ActorService.getById(id)
                .then(setActor)
                .catch(err => console.error('Failed to load actor', err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleRefresh = () => setRefreshKey(prev => prev + 1);

    const startEdit = () => {
        if (!actor) return;
        const tags = actor.tags ?? [];
        setEditForm({
            firstName: actor.firstName ?? '',
            lastName: actor.lastName ?? '',
            companyName: actor.companyName ?? '',
            email: actor.email ?? '',
            phone: actor.phone ?? '',
            address: actor.address ?? '',
            source: actor.source ?? '',
            tagsInput: tags.filter(t => t.toLowerCase() !== 'inactif').join(', '),
            inactive: tags.some(t => t.toLowerCase() === 'inactif'),
        });
        setIsEditing(true);
    };

    const cancelEdit = () => setIsEditing(false);

    const handleSave = async () => {
        if (!actor || !id) return;
        setSaving(true);
        try {
            const baseTags = editForm.tagsInput
                .split(',')
                .map(t => t.trim())
                .filter(Boolean);
            const tags = editForm.inactive ? [...baseTags, 'inactif'] : baseTags;

            const updated = await ActorService.update(id, {
                firstName: editForm.firstName || undefined,
                lastName: editForm.lastName || undefined,
                companyName: editForm.companyName || undefined,
                email: editForm.email || undefined,
                phone: editForm.phone || undefined,
                address: editForm.address || undefined,
                source: editForm.source || undefined,
                tags,
            });
            setActor(updated);
            setIsEditing(false);
            setSuccessMsg('Modifications enregistrées');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Failed to update actor', err);
        } finally {
            setSaving(false);
        }
    };

    const setField = (key: keyof typeof editForm, value: string | boolean) =>
        setEditForm(prev => ({ ...prev, [key]: value }));

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
    const isInactive = actor.tags?.some(t => t.toLowerCase() === 'inactif');

    return (
        <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>

            {/* Success toast */}
            {successMsg && (
                <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '0.625rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.875rem', fontWeight: 500, color: '#065f46' }}>
                    <Check size={15} color="#059669" /> {successMsg}
                </div>
            )}

            {/* Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => navigate('/actors')}>
                    <ArrowLeft size={15} /> Retour à la liste
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isEditing ? (
                        <>
                            <button onClick={cancelEdit} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280', cursor: 'pointer' }}>
                                <X size={14} /> Annuler
                            </button>
                            <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#4f46e5', border: '1px solid #4f46e5', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                                <Check size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={startEdit} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                                <Edit2 size={14} /> Modifier
                            </button>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }} onClick={() => setIsTaskModalOpen(true)}>
                                <CheckSquare size={14} /> Tâche
                            </button>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }} onClick={() => setIsNoteModalOpen(true)}>
                                <FileText size={14} /> Note
                            </button>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#4f46e5', border: '1px solid #4f46e5', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: '#fff', cursor: 'pointer' }} onClick={() => navigate('/opportunities/new')}>
                                <Plus size={14} /> Opportunité
                            </button>
                        </>
                    )}
                </div>
            </div>

            <CreateTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} actorId={actor.id}
                onSuccess={() => { handleRefresh(); setActiveTab('tasks'); }} />
            <CreateNoteModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} actorId={actor.id}
                onSuccess={() => { handleRefresh(); setActiveTab('timeline'); }} />

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: '1.25rem', alignItems: 'start' }}>

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
                                    <span style={{ padding: '0.125rem 0.5rem', fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderRadius: '0.375rem', background: isInactive ? '#f3f4f6' : isProspect ? '#fffbeb' : '#ecfdf5', color: isInactive ? '#6b7280' : isProspect ? '#d97706' : '#059669', border: `1px solid ${isInactive ? '#e5e7eb' : isProspect ? '#fde68a' : '#a7f3d0'}` }}>
                                        {isInactive ? 'Inactif' : isProspect ? 'Prospect' : 'Actif'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
                            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 0.75rem 0' }}>Coordonnées</p>
                            {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                    {actor.type === 'INDIVIDUAL' ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <EditField label="Prénom" value={editForm.firstName} onChange={v => setField('firstName', v)} />
                                            <EditField label="Nom" value={editForm.lastName} onChange={v => setField('lastName', v)} />
                                        </div>
                                    ) : (
                                        <EditField label="Raison sociale" value={editForm.companyName} onChange={v => setField('companyName', v)} />
                                    )}
                                    <EditField label="Email" value={editForm.email} onChange={v => setField('email', v)} type="email" />
                                    <EditField label="Téléphone" value={editForm.phone} onChange={v => setField('phone', v)} type="tel" />
                                    <EditField label="Adresse" value={editForm.address} onChange={v => setField('address', v)} />
                                    <EditField label="Source" value={editForm.source} onChange={v => setField('source', v)} />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <ContactRow icon={Mail} label="Email" value={actor.email} href={`mailto:${actor.email}`} isLink />
                                    <ContactRow icon={Phone} label="Tél" value={actor.phone} href={`tel:${actor.phone}`} isLink />
                                    <ContactRow icon={MapPin} label="Adresse" value={actor.address} />
                                    <ContactRow icon={Globe} label="Source" value={actor.source} />
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        <div style={{ padding: '0.75rem 1.25rem 1.25rem', borderTop: '1px solid #f3f4f6' }}>
                            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 0.75rem 0' }}>Tags & Statut</p>
                            {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                    <EditField label="Tags (séparés par virgule)" value={editForm.tagsInput} onChange={v => setField('tagsInput', v)} placeholder="ex: vip, partenaire" />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#374151', fontWeight: 500 }}>
                                        <input
                                            type="checkbox"
                                            checked={editForm.inactive}
                                            onChange={e => setField('inactive', e.target.checked)}
                                            style={{ width: '1rem', height: '1rem', accentColor: '#ef4444', cursor: 'pointer' }}
                                        />
                                        Marquer comme inactif
                                    </label>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.375rem' }}>
                                    {actor.tags && actor.tags.length > 0 ? actor.tags.map(tag => (
                                        <span key={tag} style={{ padding: '0.125rem 0.5rem', background: '#f3f4f6', color: '#4b5563', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 500, border: '1px solid #e5e7eb' }}>{tag}</span>
                                    )) : <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>Non classifié</span>}
                                </div>
                            )}
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
                    {/* Tabs — scrollable horizontally on mobile */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 0.5rem', paddingTop: '0.5rem', overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                        {([
                            { key: 'timeline',  label: 'Activité',      icon: Activity,    count: null },
                            { key: 'deals',     label: 'Opportunités',  icon: TrendingUp,  count: 0 },
                            { key: 'quotes',    label: 'Devis',         icon: FileText,    count: null },
                            { key: 'invoices',  label: 'Factures',      icon: Euro,        count: null },
                            { key: 'documents', label: 'Documents',     icon: FileText,    count: 0 },
                            { key: 'tasks',     label: 'Tâches',        icon: CheckSquare, count: 0 },
                        ] as const).map(tab => (
                            <TabButton key={tab.key} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key as any)} label={tab.label} icon={tab.icon} count={tab.count} />
                        ))}
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.25rem', minHeight: '420px' }}>
                        {activeTab === 'timeline' && <Timeline key={refreshKey} actorId={actor.id} />}
                        {activeTab === 'documents' && <DocumentList key={refreshKey} actorId={actor.id} />}
                        {activeTab === 'tasks' && <ClientTaskList key={refreshKey} actorId={actor.id} onAddClick={() => setIsTaskModalOpen(true)} />}
                        {activeTab === 'quotes' && <ActorQuoteTab actorId={actor.id} />}
                        {activeTab === 'invoices' && <ActorInvoiceTab actorId={actor.id} />}
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
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.625rem 0.75rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', borderBottom: active ? '2px solid #4f46e5' : '2px solid transparent', color: active ? '#4f46e5' : '#6b7280', marginBottom: '-1px', whiteSpace: 'nowrap', flexShrink: 0 }}>
        <Icon size={13} />{label}
        {count !== null && count !== undefined && (
            <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', borderRadius: '0.375rem', fontWeight: 700, background: active ? '#e0e7ff' : '#f3f4f6', color: active ? '#4f46e5' : '#6b7280' }}>{count}</span>
        )}
    </button>
);

const EditField = ({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
    <div>
        <label style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '0.25rem' }}>{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ width: '100%', padding: '0.4rem 0.625rem', fontSize: '0.8125rem', color: '#111827', background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box' as const }}
        />
    </div>
);

