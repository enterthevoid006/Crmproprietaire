import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Save, Plus, Send, CheckCircle, Lock,
    Download, Trash2,
} from 'lucide-react';
import { InvoiceService, type InvoiceItem, InvoiceStatus, type Invoice } from '../services/invoice.service';
import { ActorService, type Actor } from '../../actors/services/actor.service';
import { TenantService, type TenantProfile } from '../../../lib/tenant.service';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bg: string; border: string }> = {
    DRAFT:     { label: 'Brouillon', color: '#374151', bg: '#f3f4f6', border: '#d1d5db' },
    SENT:      { label: 'Envoyée',   color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
    PAID:      { label: 'Payée',     color: '#065f46', bg: '#ecfdf5', border: '#6ee7b7' },
    OVERDUE:   { label: 'En retard', color: '#991b1b', bg: '#fef2f2', border: '#fca5a5' },
    CANCELLED: { label: 'Annulée',   color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

// ── Main component ─────────────────────────────────────────────────────────────
const InvoiceEditorPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    // Invoice state
    const [loading, setLoading] = useState(false);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [actors, setActors] = useState<Actor[]>([]);
    const [actorId, setActorId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState<InvoiceItem[]>([
        { description: '', quantity: 1, unitPrice: 0, total: 0 },
    ]);

    // Tenant profile — read-only in this page
    const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(null);
    const [profileIncomplete, setProfileIncomplete] = useState(false);

    // Destinataire — editable per-document copy, does NOT persist to actor record
    const [recipientName, setRecipientName] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');

    useEffect(() => {
        ActorService.getAll().then(setActors).catch(console.error);
        TenantService.getProfile().then(p => {
            setTenantProfile(p);
            setProfileIncomplete(!p.name || !p.siret || !p.address);
        }).catch(console.error);
        if (isEditMode) loadInvoice();
    }, [id]);

    // When actorId changes, pre-fill destinataire fields from the actor list.
    // These fields are editable inline on the document without touching the DB.
    useEffect(() => {
        const actor = actors.find(a => a.id === actorId);
        if (actor) {
            setRecipientName(
                actor.type === 'CORPORATE'
                    ? (actor.companyName ?? '')
                    : `${actor.firstName ?? ''} ${actor.lastName ?? ''}`.trim()
            );
            setRecipientAddress(actor.address ?? '');
            setRecipientEmail(actor.email ?? '');
            setRecipientPhone(actor.phone ?? '');
        } else {
            setRecipientName('');
            setRecipientAddress('');
            setRecipientEmail('');
            setRecipientPhone('');
        }
    }, [actorId, actors]);

    const loadInvoice = async () => {
        try {
            const data = await InvoiceService.getById(id!);
            setInvoice(data);
            setActorId(data.actorId);
            setDueDate(data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '');
            setItems(data.items);
        } catch (err) {
            console.error(err);
            navigate('/finance/invoices');
        }
    };

    // ── Invoice logic ─────────────────────────────────────────────────────────
    const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const tax = subtotal * 0.20;
    const total = subtotal + tax;
    const isReadOnly = isEditMode && invoice?.status !== InvoiceStatus.DRAFT;

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        if (isReadOnly) return;
        const next = [...items];
        const item = { ...next[index], [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
            item.total = Number(item.quantity) * Number(item.unitPrice);
        }
        next[index] = item;
        setItems(next);
    };

    const handleSave = async () => {
        if (!actorId) { alert('Veuillez sélectionner un client.'); return; }
        setLoading(true);
        try {
            await InvoiceService.create({
                actorId,
                items,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            });
            navigate('/finance/invoices');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Erreur inconnue';
            alert(`Erreur : ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: InvoiceStatus) => {
        if (!invoice || !confirm(`Confirmer le passage au statut "${STATUS_CONFIG[newStatus].label}" ?`)) return;
        try {
            await InvoiceService.updateStatus(invoice.id, newStatus);
            await loadInvoice();
        } catch { alert('Erreur lors de la mise à jour du statut.'); }
    };

    // ── Styles ────────────────────────────────────────────────────────────────
    const btn = (bg: string, _hoverBg: string, extra?: React.CSSProperties): React.CSSProperties => ({
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
        padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem',
        fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
        background: bg, color: '#fff',
        transition: 'background 0.15s',
        ...extra,
    });

    const statusCfg = invoice ? STATUS_CONFIG[invoice.status] : null;

    return (
        <div style={{ padding: '1.5rem 2rem', background: '#f8fafc', minHeight: '100vh' }}>

            {/* ── Incomplete profile banner ── */}
            {profileIncomplete && !isReadOnly && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 16px', marginBottom: '1rem',
                    background: '#fffbeb', border: '1px solid #fcd34d',
                    borderLeft: '4px solid #f59e0b', borderRadius: '0 8px 8px 0',
                    gap: '12px',
                }}>
                    <span style={{ fontSize: '0.875rem', color: '#92400e' }}>
                        ⚠️ Complétez votre profil agence pour pré-remplir vos documents automatiquement.
                    </span>
                    <button
                        onClick={() => navigate('/settings')}
                        style={{
                            flexShrink: 0, padding: '4px 12px',
                            background: '#f59e0b', color: '#fff',
                            border: 'none', borderRadius: '6px',
                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        → Paramètres
                    </button>
                </div>
            )}

            {/* ── Top bar ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', color: '#6b7280', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', padding: 0 }}
                    >
                        <ArrowLeft size={16} /> Retour
                    </button>
                    {statusCfg && (
                        <span style={{
                            padding: '0.25rem 0.75rem', borderRadius: '9999px',
                            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const,
                            background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`,
                        }}>
                            {statusCfg.label}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {isEditMode && invoice?.status === InvoiceStatus.DRAFT && (
                        <button style={btn('#2563eb', '#1d4ed8')} onClick={() => handleStatusChange(InvoiceStatus.SENT)}
                            onMouseEnter={e => (e.currentTarget.style.background = '#1d4ed8')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#2563eb')}>
                            <Send size={15} /> Marquer envoyée
                        </button>
                    )}
                    {isEditMode && (invoice?.status === InvoiceStatus.SENT || invoice?.status === InvoiceStatus.OVERDUE) && (
                        <button style={btn('#059669', '#047857')} onClick={() => handleStatusChange(InvoiceStatus.PAID)}
                            onMouseEnter={e => (e.currentTarget.style.background = '#047857')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#059669')}>
                            <CheckCircle size={15} /> Marquer payée
                        </button>
                    )}
                    {isEditMode && invoice && (
                        <button style={btn('#374151', '#1f2937', { background: '#f3f4f6', color: '#374151' })}
                            onClick={() => InvoiceService.downloadPdf(invoice.id)}
                            onMouseEnter={e => (e.currentTarget.style.background = '#e5e7eb')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#f3f4f6')}>
                            <Download size={15} /> PDF
                        </button>
                    )}
                    {!isReadOnly && (
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            style={btn(loading ? '#a5b4fc' : '#4f46e5', '#4338ca', {
                                background: loading ? '#a5b4fc' : '#4f46e5',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 2px 6px rgba(79,70,229,0.3)',
                            })}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#4338ca'; }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#4f46e5'; }}
                        >
                            <Save size={15} />
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Locked warning ── */}
            {isReadOnly && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem 1.25rem', marginBottom: '1.25rem',
                    background: '#fffbeb', border: '1px solid #fde68a',
                    borderLeft: '4px solid #f59e0b', borderRadius: '0.5rem',
                }}>
                    <Lock size={18} color="#d97706" />
                    <div>
                        <p style={{ margin: 0, fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>Facture verrouillée</p>
                        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#b45309' }}>Ce document ne peut plus être modifié.</p>
                    </div>
                </div>
            )}

            {/* ── Document card ── */}
            <div style={{
                background: '#fff',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.04)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
            }}>

                {/* ── Brand header ── */}
                <div style={{
                    padding: '2rem 2.5rem',
                    borderBottom: '2px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '2rem',
                    flexWrap: 'wrap',
                }}>
                    {/* Left: logo + agency info (read-only) */}
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flex: '1 1 260px' }}>
                        {/* Logo — read-only */}
                        <div style={{
                            width: '80px', height: '60px', flexShrink: 0,
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            overflow: 'hidden',
                            background: '#f9fafb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {tenantProfile?.logoUrl ? (
                                <img src={tenantProfile.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Logo" />
                            ) : (
                                <div style={{ fontSize: '0.5625rem', color: '#d1d5db', fontWeight: 600, textAlign: 'center' }}>
                                    LOGO
                                </div>
                            )}
                        </div>

                        {/* Agency info — static display */}
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>
                                {tenantProfile?.name || <span style={{ color: '#d1d5db', fontStyle: 'italic' }}>Nom agence</span>}
                            </div>
                            {tenantProfile?.address && (
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{tenantProfile.address}</div>
                            )}
                            {(tenantProfile?.postalCode || tenantProfile?.city) && (
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    {[tenantProfile.postalCode, tenantProfile.city].filter(Boolean).join(' ')}
                                </div>
                            )}
                            <button
                                onClick={() => navigate('/settings')}
                                style={{ marginTop: '4px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.72rem', color: '#4f46e5', textDecoration: 'underline', textAlign: 'left', fontFamily: 'inherit' }}
                            >
                                Modifier dans les paramètres →
                            </button>
                        </div>
                    </div>

                    {/* Right: invoice title + date */}
                    <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5', letterSpacing: '-0.02em' }}>
                            FACTURE
                        </h2>
                        {isEditMode && invoice && (
                            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                                N° {invoice.number}
                            </p>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.06em', display: 'block', marginBottom: '0.25rem' }}>
                                    Date d'échéance
                                </label>
                                <input
                                    type="date"
                                    disabled={isReadOnly}
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    style={{
                                        padding: '0.4rem 0.625rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                        color: '#374151',
                                        outline: 'none',
                                        background: isReadOnly ? '#f9fafb' : '#fff',
                                        cursor: isReadOnly ? 'not-allowed' : 'pointer',
                                    }}
                                    onFocus={e => { e.currentTarget.style.borderColor = '#4f46e5'; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Vendor / Client ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '2rem',
                    padding: '1.75rem 2.5rem',
                    borderBottom: '1px solid #f3f4f6',
                }}>
                    {/* Vendor — read-only, from tenantProfile */}
                    <div>
                        <p style={{ margin: '0 0 0.625rem 0', fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                            Émetteur
                        </p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem', color: '#111827' }}>
                            {tenantProfile?.name || '—'}
                        </p>
                        {tenantProfile?.address && (
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>{tenantProfile.address}</p>
                        )}
                        {(tenantProfile?.postalCode || tenantProfile?.city) && (
                            <p style={{ margin: '0.125rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                                {[tenantProfile.postalCode, tenantProfile.city].filter(Boolean).join(' ')}
                            </p>
                        )}
                        {tenantProfile?.siret && (
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>
                                SIRET : {tenantProfile.siret}
                            </p>
                        )}
                        {tenantProfile?.vatNumber && (
                            <p style={{ margin: '0.125rem 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>
                                TVA : {tenantProfile.vatNumber}
                            </p>
                        )}
                    </div>

                    {/* Destinataire — independent state, editable per-document */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                            <p style={{ margin: 0, fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                                Destinataire
                            </p>
                            {!isReadOnly && (
                                <button
                                    onClick={() => navigate('/actors')}
                                    style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '0.2rem 0.625rem', fontSize: '0.72rem', fontWeight: 600, color: '#4f46e5', cursor: 'pointer', fontFamily: 'inherit' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                                >
                                    + Nouveau client
                                </button>
                            )}
                        </div>

                        {/* Dropdown — only in edit mode */}
                        {!isReadOnly && (
                            <select
                                value={actorId}
                                onChange={e => setActorId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    outline: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: actorId ? 600 : 400,
                                    color: actorId ? '#111827' : '#9ca3af',
                                    background: '#fff',
                                    cursor: 'pointer',
                                    marginBottom: actorId ? '0.75rem' : 0,
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = '#4f46e5'; }}
                                onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                            >
                                <option value="">— Sélectionner un destinataire —</option>
                                {actors.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.type === 'CORPORATE' ? a.companyName : `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim()}
                                        {a.email ? ` (${a.email})` : ''}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Recipient fields — editable inline, do NOT persist to actor record */}
                        {(actorId || isReadOnly) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <input
                                    disabled={isReadOnly}
                                    value={recipientName}
                                    onChange={e => setRecipientName(e.target.value)}
                                    placeholder="Nom du destinataire"
                                    style={{
                                        background: 'transparent', border: '1px solid transparent', borderRadius: '0.25rem',
                                        outline: 'none', padding: '0.2rem 0.25rem', margin: '-0.2rem -0.25rem',
                                        fontFamily: 'inherit', fontSize: '0.9375rem', fontWeight: 700, color: '#111827',
                                        width: '100%', boxSizing: 'border-box' as const,
                                    }}
                                    onFocus={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#4f46e5'; }}
                                    onBlur={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                                />
                                <input
                                    disabled={isReadOnly}
                                    value={recipientAddress}
                                    onChange={e => setRecipientAddress(e.target.value)}
                                    placeholder="Adresse"
                                    style={{
                                        background: 'transparent', border: '1px solid transparent', borderRadius: '0.25rem',
                                        outline: 'none', padding: '0.2rem 0.25rem', margin: '-0.2rem -0.25rem',
                                        fontFamily: 'inherit', fontSize: '0.875rem', color: '#6b7280',
                                        width: '100%', boxSizing: 'border-box' as const,
                                    }}
                                    onFocus={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#4f46e5'; }}
                                    onBlur={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                                />
                                <input
                                    disabled={isReadOnly}
                                    value={recipientEmail}
                                    onChange={e => setRecipientEmail(e.target.value)}
                                    placeholder="Email"
                                    style={{
                                        background: 'transparent', border: '1px solid transparent', borderRadius: '0.25rem',
                                        outline: 'none', padding: '0.2rem 0.25rem', margin: '-0.2rem -0.25rem',
                                        fontFamily: 'inherit', fontSize: '0.875rem', color: '#6b7280',
                                        width: '100%', boxSizing: 'border-box' as const,
                                    }}
                                    onFocus={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#4f46e5'; }}
                                    onBlur={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                                />
                                <input
                                    disabled={isReadOnly}
                                    value={recipientPhone}
                                    onChange={e => setRecipientPhone(e.target.value)}
                                    placeholder="Téléphone"
                                    style={{
                                        background: 'transparent', border: '1px solid transparent', borderRadius: '0.25rem',
                                        outline: 'none', padding: '0.2rem 0.25rem', margin: '-0.2rem -0.25rem',
                                        fontFamily: 'inherit', fontSize: '0.875rem', color: '#6b7280',
                                        width: '100%', boxSizing: 'border-box' as const,
                                    }}
                                    onFocus={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#4f46e5'; }}
                                    onBlur={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Line items ── */}
                <div style={{ padding: '1.75rem 2.5rem' }}>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', fontWeight: 700, color: '#111827' }}>
                        Prestations & Produits
                    </p>

                    {/* Table header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 72px 110px 110px 36px',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        borderBottom: '2px solid #f3f4f6',
                        marginBottom: '0.375rem',
                    }}>
                        {['Description', 'Qté', 'Prix unitaire', 'Total HT', ''].map((h, i) => (
                            <div key={i} style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.06em', textAlign: i > 0 ? 'right' : 'left' as const }}>
                                {h}
                            </div>
                        ))}
                    </div>

                    {/* Rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {items.map((item, index) => (
                            <ItemRow
                                key={index}
                                item={item}
                                isReadOnly={isReadOnly}
                                onChange={(field, value) => handleItemChange(index, field, value)}
                                onRemove={() => setItems(items.filter((_, i) => i !== index))}
                            />
                        ))}
                    </div>

                    {!isReadOnly && (
                        <button
                            onClick={() => setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }])}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                marginTop: '0.75rem', padding: '0.5rem 0.75rem',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#4f46e5', fontSize: '0.875rem', fontWeight: 600,
                                borderRadius: '0.375rem',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#eef2ff')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                            <Plus size={15} /> Ajouter une ligne
                        </button>
                    )}
                </div>

                {/* ── Totals ── */}
                <div style={{
                    padding: '1.5rem 2.5rem 2rem',
                    borderTop: '2px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}>
                    <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6b7280' }}>
                            <span>Sous-total HT</span>
                            <span style={{ fontWeight: 500 }}>{subtotal.toFixed(2)} €</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6b7280' }}>
                            <span>TVA (20 %)</span>
                            <span style={{ fontWeight: 500 }}>{tax.toFixed(2)} €</span>
                        </div>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            paddingTop: '0.75rem',
                            borderTop: '2px solid #e5e7eb',
                            fontSize: '1.125rem', fontWeight: 800, color: '#111827',
                        }}>
                            <span>Total TTC</span>
                            <span style={{ color: '#4f46e5' }}>{total.toFixed(2)} €</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Item row ──────────────────────────────────────────────────────────────────
interface ItemRowProps {
    item: InvoiceItem;
    isReadOnly: boolean;
    onChange: (field: keyof InvoiceItem, value: string | number) => void;
    onRemove: () => void;
}

const ItemRow = ({ item, isReadOnly, onChange, onRemove }: ItemRowProps) => {
    const [hovered, setHovered] = useState(false);

    const cellInput = (extra?: React.CSSProperties): React.CSSProperties => ({
        width: '100%',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        fontFamily: 'inherit',
        fontSize: '0.9rem',
        color: '#111827',
        padding: '0.375rem 0',
        ...extra,
    });

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr 72px 110px 110px 36px',
                gap: '0.5rem',
                alignItems: 'center',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                background: hovered && !isReadOnly ? '#fafbff' : 'transparent',
                border: `1px solid ${hovered && !isReadOnly ? '#e0e7ff' : 'transparent'}`,
                transition: 'background 0.1s, border-color 0.1s',
            }}
        >
            <input
                type="text"
                disabled={isReadOnly}
                value={item.description}
                onChange={e => onChange('description', e.target.value)}
                placeholder="Description du service..."
                style={cellInput({ fontWeight: 500 })}
            />
            <input
                type="number"
                disabled={isReadOnly}
                value={item.quantity}
                min={0}
                onChange={e => onChange('quantity', Number(e.target.value))}
                style={cellInput({ textAlign: 'right' })}
            />
            <input
                type="number"
                disabled={isReadOnly}
                value={item.unitPrice}
                min={0}
                step={0.01}
                onChange={e => onChange('unitPrice', Number(e.target.value))}
                style={cellInput({ textAlign: 'right' })}
            />
            <div style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: 700, color: '#111827', paddingRight: '0.25rem' }}>
                {(item.quantity * item.unitPrice).toFixed(2)} €
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                {!isReadOnly && (
                    <button
                        onClick={onRemove}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '0.25rem', borderRadius: '0.25rem',
                            color: '#d1d5db',
                            opacity: hovered ? 1 : 0,
                            transition: 'opacity 0.15s, color 0.15s',
                            display: 'flex', alignItems: 'center',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#d1d5db')}
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default InvoiceEditorPage;
