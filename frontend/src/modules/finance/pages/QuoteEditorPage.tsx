import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, Send, CheckCircle, XCircle, Lock, Download } from 'lucide-react';
import { QuoteService, type QuoteItem, QuoteStatus, type Quote } from '../services/quote.service';
import { ActorService, type Actor } from '../../actors/services/actor.service';
import { TenantService, type TenantProfile } from '../../../lib/tenant.service';

// Local extension to support per-line TVA
interface QuoteItemLocal extends QuoteItem {
    taxRate: number;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
    DRAFT:    { bg: '#f3f4f6', color: '#374151', label: 'Brouillon' },
    SENT:     { bg: '#dbeafe', color: '#1d4ed8', label: 'Envoyé' },
    ACCEPTED: { bg: '#d1fae5', color: '#065f46', label: 'Accepté' },
    REJECTED: { bg: '#fee2e2', color: '#991b1b', label: 'Refusé' },
    EXPIRED:  { bg: '#fef3c7', color: '#92400e', label: 'Expiré' },
};

const actorDisplayName = (a: Actor) =>
    a.type === 'CORPORATE' ? (a.companyName ?? '') : `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim();

const DEFAULT_TAX = 20;

const QuoteEditorPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    // Stable preview number for create mode
    const previewNumber = useRef(
        `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
    ).current;

    const [loading, setLoading] = useState(false);
    const [saved] = useState(false);
    const [quote, setQuote] = useState<Quote | null>(null);
    const [actors, setActors] = useState<Actor[]>([]);
    const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(null);
    const [profileIncomplete, setProfileIncomplete] = useState(false);

    // Form state
    const [actorId, setActorId] = useState('');
    const [validUntil, setValidUntil] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
    });
    const [paymentTerms, setPaymentTerms] = useState('');  // local copy, editable per-doc
    const [globalTaxRate, setGlobalTaxRate] = useState(DEFAULT_TAX);
    const [items, setItems] = useState<QuoteItemLocal[]>([
        { description: '', quantity: 1, unitPrice: 0, total: 0, taxRate: DEFAULT_TAX },
    ]);
    const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

    useEffect(() => {
        Promise.allSettled([
            ActorService.getAll(),
            TenantService.getProfile(),
            isEditMode ? QuoteService.getById(id!) : Promise.resolve(null),
        ]).then(([actorsResult, tenantResult, quoteResult]) => {
            if (actorsResult.status === 'fulfilled') setActors(actorsResult.value);

            if (tenantResult.status === 'fulfilled') {
                const p = tenantResult.value;
                setTenantProfile(p);
                if (p.paymentTerms) setPaymentTerms(p.paymentTerms);
                if (!isEditMode && p.quoteValidityDays) {
                    const d = new Date();
                    d.setDate(d.getDate() + p.quoteValidityDays);
                    setValidUntil(d.toISOString().split('T')[0]);
                }
                setProfileIncomplete(!p.name || !p.siret || !p.address);
            }

            if (quoteResult.status === 'fulfilled' && quoteResult.value) {
                const quoteData = quoteResult.value;
                setQuote(quoteData);
                setActorId(quoteData.actorId);
                setValidUntil(
                    quoteData.validUntil
                        ? new Date(quoteData.validUntil).toISOString().split('T')[0]
                        : ''
                );
                setItems(quoteData.items.map((it) => ({ ...it, taxRate: DEFAULT_TAX })));
            } else if (quoteResult.status === 'rejected' && isEditMode) {
                alert('Impossible de charger le devis');
                navigate('/finance/quotes');
            }
        });
    }, [id]);

    // Computed totals
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice * (item.taxRate / 100),
        0
    );
    const total = subtotal + taxAmount;

    const isReadOnly = isEditMode && quote?.status !== QuoteStatus.DRAFT;

    const handleItemChange = (
        index: number,
        field: keyof QuoteItemLocal,
        value: string | number
    ) => {
        if (isReadOnly) return;
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
            item.total = Number(item.quantity) * Number(item.unitPrice);
        }
        newItems[index] = item;
        setItems(newItems);
    };

    const applyGlobalTax = (rate: number) => {
        setGlobalTaxRate(rate);
        setItems((prev) => prev.map((it) => ({ ...it, taxRate: rate })));
    };

    const addItem = () => {
        if (isReadOnly) return;
        setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0, taxRate: globalTaxRate }]);
    };

    const removeItem = (index: number) => {
        if (isReadOnly || items.length <= 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!actorId) return alert('Veuillez sélectionner un client');
        setLoading(true);
        try {
            // Strip local-only taxRate field before sending
            const payload = items.map(({ taxRate: _tr, ...rest }) => rest);
            await QuoteService.create({
                actorId,
                items: payload,
                validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
            });
            navigate('/finance/quotes');
        } catch (err) {
            console.error(err);
            alert("Impossible d'enregistrer le devis");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: QuoteStatus) => {
        if (!quote) return;
        const labels: Record<string, string> = {
            SENT: 'marquer comme envoyé',
            ACCEPTED: 'accepter',
            REJECTED: 'refuser',
        };
        if (!confirm(`Voulez-vous vraiment ${labels[newStatus] ?? newStatus} ce devis ?`)) return;
        try {
            await QuoteService.updateStatus(quote.id, newStatus);
            const updated = await QuoteService.getById(quote.id);
            setQuote(updated);
        } catch {
            alert('Impossible de modifier le statut');
        }
    };

    const statusCfg = quote ? STATUS_CONFIG[quote.status] : null;

    // ── Shared button base
    const actionBtn = (extra: React.CSSProperties): React.CSSProperties => ({
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        borderRadius: '8px', padding: '11px 16px',
        fontSize: '0.875rem', fontWeight: 600,
        cursor: 'pointer', width: '100%', border: 'none',
        ...extra,
    });

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* ── Page header bar ── */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                    flexWrap: 'nowrap', gap: '16px',
                }}>
                    {/* Left: back + status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                        <button
                            onClick={() => navigate('/finance/quotes')}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, padding: 0, flexShrink: 0 }}
                        >
                            <ArrowLeft size={18} />
                            Retour
                        </button>
                        {statusCfg && (
                            <span style={{ padding: '3px 12px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: statusCfg.bg, color: statusCfg.color, flexShrink: 0 }}>
                                {statusCfg.label}
                            </span>
                        )}
                    </div>

                    {/* Center: title */}
                    <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', margin: 0, textAlign: 'center', flex: 1 }}>
                        {isEditMode && quote ? quote.number : 'Nouveau Devis'}
                    </h1>

                    {/* Right: saved indicator + save button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                        {saved && (
                            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, whiteSpace: 'nowrap' }}>✓ Sauvegardé</span>
                        )}
                        {!isReadOnly && (
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff',
                                    border: 'none', borderRadius: '8px', padding: '9px 18px',
                                    fontSize: '0.875rem', fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    flexShrink: 0, whiteSpace: 'nowrap',
                                    transition: 'background 0.15s',
                                }}
                            >
                                <Save size={16} />
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        )}
                    </div>
                </div>

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

                {/* ── Lock banner ── */}
                {isReadOnly && (
                    <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '0 8px 8px 0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                        <Lock size={20} color="#d97706" />
                        <div>
                            <p style={{ fontWeight: 700, color: '#92400e', margin: 0, fontSize: '0.875rem' }}>Devis verrouillé</p>
                            <p style={{ color: '#b45309', margin: '2px 0 0', fontSize: '0.8rem' }}>Ce document a été envoyé ou clôturé et ne peut plus être modifié.</p>
                        </div>
                    </div>
                )}

                {/* ── Two-column layout ── */}
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

                    {/* ── LEFT: document paper (60%) ── */}
                    <div style={{ flex: '1 1 60%', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', padding: '2.5rem', opacity: isReadOnly ? 0.92 : 1 }}>

                        {/* Agency header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f3f4f6', paddingBottom: '1.75rem', marginBottom: '2rem' }}>

                            {/* Logo + read-only agency info */}
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                {/* Logo */}
                                <div style={{ width: '80px', height: '80px', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, background: '#f9fafb' }}>
                                    {tenantProfile?.logoUrl ? (
                                        <img src={tenantProfile.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#d1d5db', fontSize: '0.6rem', padding: '4px' }}>
                                            Logo
                                        </div>
                                    )}
                                </div>

                                {/* Agency text info */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                                        {tenantProfile?.name || <span style={{ color: '#d1d5db', fontStyle: 'italic' }}>Nom agence</span>}
                                    </div>
                                    {tenantProfile?.address && (
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{tenantProfile.address}</div>
                                    )}
                                    {(tenantProfile?.postalCode || tenantProfile?.city) && (
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                            {[tenantProfile.postalCode, tenantProfile.city].filter(Boolean).join(' ')}
                                        </div>
                                    )}
                                    {tenantProfile?.siret && (
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                                            SIRET : {tenantProfile.siret}
                                        </div>
                                    )}
                                    {tenantProfile?.vatNumber && (
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                            TVA : {tenantProfile.vatNumber}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => navigate('/settings')}
                                        style={{ marginTop: '6px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.72rem', color: '#4f46e5', textDecoration: 'underline', textAlign: 'left', fontFamily: 'inherit' }}
                                    >
                                        Modifier dans les paramètres →
                                    </button>
                                </div>
                            </div>

                            {/* Dates + quote number */}
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {/* Quote number badge */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        background: '#eef2ff', color: '#4f46e5',
                                        padding: '4px 14px', borderRadius: '9999px',
                                        fontSize: '0.8125rem', fontWeight: 700,
                                        letterSpacing: '0.06em',
                                    }}>
                                        {isEditMode && quote ? quote.number : previewNumber}
                                    </span>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                        Date de création
                                    </label>
                                    <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>
                                        {new Date().toLocaleDateString('fr-FR')}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                        Valide jusqu'au
                                    </label>
                                    <input
                                        type="date"
                                        disabled={isReadOnly}
                                        value={validUntil}
                                        onChange={(e) => setValidUntil(e.target.value)}
                                        style={{ padding: '6px 10px', border: '1.5px solid #e5e7eb', borderRadius: '7px', fontSize: '0.8rem', outline: 'none', background: isReadOnly ? '#f9fafb' : '#fff', color: '#374151', cursor: isReadOnly ? 'not-allowed' : 'default' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Client selector */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                Destinataire (Client)
                            </label>
                            <select
                                disabled={isReadOnly}
                                value={actorId}
                                onChange={(e) => setActorId(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', background: isReadOnly ? '#f9fafb' : '#fff', border: '1.5px solid #e5e7eb', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', fontWeight: 500, color: actorId ? '#111827' : '#9ca3af', cursor: isReadOnly ? 'not-allowed' : 'pointer' }}
                            >
                                <option value="">— Sélectionner un client —</option>
                                {actors.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {actorDisplayName(a)}{a.email ? ` — ${a.email}` : ''}
                                    </option>
                                ))}
                            </select>

                            {/* Selected client details */}
                            {actorId && (() => {
                                const actor = actors.find((a) => a.id === actorId);
                                if (!actor) return null;
                                return (
                                    <div style={{ marginTop: '10px', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                                            {actorDisplayName(actor)}
                                        </div>
                                        {actor.address && (
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{actor.address}</div>
                                        )}
                                        {actor.email && (
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{actor.email}</div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Line items */}
                        <div>
                            {/* Table header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px 72px 90px 36px', gap: '8px', padding: '0 12px', marginBottom: '6px' }}>
                                {['Description', 'Qté', 'Prix unit.', 'TVA %', 'Total HT', ''].map((h, i) => (
                                    <div key={i} style={{ fontSize: '0.68rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i >= 1 && i <= 4 ? 'right' : 'left' }}>
                                        {h}
                                    </div>
                                ))}
                            </div>

                            {/* Rows */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        onMouseEnter={() => setHoveredRowIndex(index)}
                                        onMouseLeave={() => setHoveredRowIndex(null)}
                                        style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px 72px 90px 36px', gap: '8px', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', background: hoveredRowIndex === index ? '#f9fafb' : 'transparent', border: `1px solid ${hoveredRowIndex === index ? '#e5e7eb' : 'transparent'}`, transition: 'all 0.12s' }}
                                    >
                                        <input
                                            type="text"
                                            disabled={isReadOnly}
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            placeholder="Description du service..."
                                            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', color: '#111827', width: '100%', fontFamily: 'inherit' }}
                                        />
                                        <input
                                            type="number"
                                            disabled={isReadOnly}
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', color: '#374151', textAlign: 'right', width: '100%', fontFamily: 'inherit' }}
                                        />
                                        <input
                                            type="number"
                                            disabled={isReadOnly}
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                                            placeholder="0.00"
                                            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', color: '#374151', textAlign: 'right', width: '100%', fontFamily: 'inherit' }}
                                        />
                                        <input
                                            type="number"
                                            disabled={isReadOnly}
                                            value={item.taxRate}
                                            onChange={(e) => handleItemChange(index, 'taxRate', Number(e.target.value))}
                                            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', color: '#374151', textAlign: 'right', width: '100%', fontFamily: 'inherit' }}
                                        />
                                        <div style={{ textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                                            {(item.quantity * item.unitPrice).toFixed(2)} €
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            {!isReadOnly && (
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    style={{ background: 'none', border: 'none', cursor: items.length <= 1 ? 'not-allowed' : 'pointer', padding: '4px', borderRadius: '4px', opacity: hoveredRowIndex === index && items.length > 1 ? 1 : 0, transition: 'opacity 0.12s', color: '#ef4444', display: 'flex', alignItems: 'center' }}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {!isReadOnly && (
                                <button
                                    onClick={addItem}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#eef2ff'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                                    style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontSize: '0.875rem', fontWeight: 600, padding: '6px 12px', borderRadius: '6px', transition: 'background 0.12s' }}
                                >
                                    <Plus size={15} />
                                    Ajouter une ligne
                                </button>
                            )}
                        </div>

                        {/* ── Conditions de paiement ── */}
                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6' }}>
                            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                Conditions de paiement
                            </label>
                            <textarea
                                disabled={isReadOnly}
                                value={paymentTerms}
                                onChange={(e) => setPaymentTerms(e.target.value)}
                                placeholder="Ex : Paiement à 30 jours à compter de la date d'émission..."
                                rows={3}
                                style={{
                                    width: '100%', boxSizing: 'border-box',
                                    padding: '8px 10px',
                                    background: isReadOnly ? '#f9fafb' : '#fff',
                                    border: '1px solid #e5e7eb', borderRadius: '6px',
                                    outline: 'none', resize: 'vertical',
                                    fontSize: '0.8rem', color: '#374151',
                                    fontFamily: 'inherit', lineHeight: 1.5,
                                }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                            />
                        </div>

                        {/* ── Bon pour accord ── */}
                        <div style={{
                            marginTop: '2rem', paddingTop: '1.5rem',
                            borderTop: '2px dashed #e5e7eb',
                        }}>
                            <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1.25rem' }}>
                                Bon pour accord
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.5rem' }}>Le client</p>
                                    <div style={{ borderBottom: '1px solid #d1d5db', height: '2rem', marginBottom: '0.375rem' }} />
                                    <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>Signature et date</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.5rem' }}>L'émetteur</p>
                                    <div style={{ borderBottom: '1px solid #d1d5db', height: '2rem', marginBottom: '0.375rem' }} />
                                    <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>Signature et cachet</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: summary + actions (40%) ── */}
                    <div style={{ flex: '0 0 calc(40% - 24px)', position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Financial summary */}
                        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1rem' }}>
                                Récapitulatif
                            </h3>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Sous-total HT</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>{subtotal.toFixed(2)} €</span>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>TVA</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>{taxAmount.toFixed(2)} €</span>
                                </div>
                                {!isReadOnly && (
                                    <div>
                                        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '0 0 6px' }}>Appliquer à toutes les lignes :</p>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {[0, 5.5, 10, 20].map((rate) => (
                                                <button
                                                    key={rate}
                                                    onClick={() => applyGlobalTax(rate)}
                                                    style={{ padding: '4px 10px', borderRadius: '20px', border: `1.5px solid ${globalTaxRate === rate ? '#4f46e5' : '#e5e7eb'}`, background: globalTaxRate === rate ? '#4f46e5' : '#fff', color: globalTaxRate === rate ? '#fff' : '#6b7280', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s' }}
                                                >
                                                    {rate}%
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ borderTop: '2px solid #f3f4f6', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Total TTC</span>
                                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4f46e5', letterSpacing: '-0.02em' }}>
                                    {total.toFixed(2)} €
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                            {!isReadOnly && (
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    style={actionBtn({ background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer' })}
                                >
                                    <Save size={16} />
                                    {loading ? 'Enregistrement...' : 'Enregistrer le devis'}
                                </button>
                            )}

                            {isEditMode && quote?.status === QuoteStatus.DRAFT && (
                                <button
                                    onClick={() => handleStatusChange(QuoteStatus.SENT)}
                                    style={actionBtn({ background: '#eff6ff', color: '#1d4ed8', border: '1.5px solid #bfdbfe', cursor: 'pointer' })}
                                >
                                    <Send size={16} />
                                    Marquer comme envoyé
                                </button>
                            )}

                            {isEditMode && (quote?.status === QuoteStatus.SENT || quote?.status === QuoteStatus.EXPIRED) && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange(QuoteStatus.ACCEPTED)}
                                        style={actionBtn({ background: '#f0fdf4', color: '#166534', border: '1.5px solid #bbf7d0', cursor: 'pointer' })}
                                    >
                                        <CheckCircle size={16} />
                                        Accepter le devis
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(QuoteStatus.REJECTED)}
                                        style={actionBtn({ background: '#fff5f5', color: '#991b1b', border: '1.5px solid #fecaca', cursor: 'pointer' })}
                                    >
                                        <XCircle size={16} />
                                        Refuser le devis
                                    </button>
                                </>
                            )}

                            {isEditMode && quote && (
                                <button
                                    onClick={() => QuoteService.downloadPdf(quote.id)}
                                    style={actionBtn({ background: '#f9fafb', color: '#374151', border: '1.5px solid #e5e7eb', cursor: 'pointer' })}
                                >
                                    <Download size={16} />
                                    Télécharger en PDF
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteEditorPage;
