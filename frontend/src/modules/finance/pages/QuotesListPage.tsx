import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { QuoteService, type Quote, QuoteStatus } from '../services/quote.service';
import { InvoiceService } from '../services/invoice.service';
import { ActorService, type Actor } from '../../actors/services/actor.service';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; bg: string; border: string }> = {
    DRAFT:    { label: 'Brouillon', color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
    SENT:     { label: 'Envoyé',    color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
    ACCEPTED: { label: 'Accepté',   color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
    REJECTED: { label: 'Refusé',    color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    EXPIRED:  { label: 'Expiré',    color: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb' },
};

const actorDisplayName = (actor: Actor): string =>
    actor.type === 'CORPORATE'
        ? (actor.companyName || '—')
        : `${actor.firstName ?? ''} ${actor.lastName ?? ''}`.trim() || '—';

// ── Component ──────────────────────────────────────────────────────────────────
const QuotesListPage = () => {
    const navigate = useNavigate();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [actorMap, setActorMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [converting, setConverting] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            QuoteService.getAll({}),
            ActorService.getAll(),
        ]).then(([quotesData, actorsData]) => {
            setQuotes(quotesData);
            const map: Record<string, string> = {};
            actorsData.forEach((a: Actor) => { map[a.id] = actorDisplayName(a); });
            setActorMap(map);
        }).catch(err => {
            console.error(err);
            setError('Impossible de charger les devis');
        }).finally(() => setLoading(false));
    }, []);

    const handleConvertToInvoice = async (quote: Quote, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Convertir le devis ${quote.number} en facture ?`)) return;
        setConverting(quote.id);
        try {
            await InvoiceService.create({
                actorId: quote.actorId,
                items: quote.items,
            });
            navigate('/finance/invoices');
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la conversion en facture.');
        } finally {
            setConverting(null);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Chargement...</span>
        </div>
    );

    // ── KPI computations ──────────────────────────────────────────────────────
    const pipeline   = quotes.filter(q => q.status === 'SENT').reduce((s, q) => s + q.total, 0);
    const accepted   = quotes.filter(q => q.status === 'ACCEPTED').reduce((s, q) => s + q.total, 0);

    return (
        <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>

            {/* ── Header ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                gap: '1rem',
            }}>
                <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                        Devis
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                        Gérez vos propositions commerciales
                    </p>
                </div>
                <button
                    onClick={() => navigate('/finance/quotes/new')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.625rem 1.25rem',
                        background: '#4f46e5',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(79,70,229,0.3)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}
                >
                    <Plus size={16} />
                    Créer un Devis
                </button>
            </div>

            {/* ── KPI Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <KpiCard
                    icon={TrendingUp}
                    label="Pipeline (Envoyés)"
                    value={fmt(pipeline)}
                    iconColor="#1d4ed8"
                    iconBg="#eff6ff"
                    valueColor="#1d4ed8"
                />
                <KpiCard
                    icon={CheckCircle}
                    label="Acceptés"
                    value={fmt(accepted)}
                    iconColor="#047857"
                    iconBg="#ecfdf5"
                    valueColor="#047857"
                />
                <KpiCard
                    icon={FileText}
                    label="Total Devis"
                    value={String(quotes.length)}
                    iconColor="#7c3aed"
                    iconBg="#f5f3ff"
                />
            </div>

            {/* ── Error ── */}
            {error && (
                <div style={{
                    padding: '0.75rem 1rem', marginBottom: '1rem',
                    background: '#fef2f2', color: '#dc2626',
                    border: '1px solid #fecaca', borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                }}>
                    {error}
                </div>
            )}

            {/* ── Table ── */}
            <div style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                overflow: 'hidden',
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            {[
                                { label: 'Référence',  align: 'left'  },
                                { label: 'Date',       align: 'left'  },
                                { label: 'Client',     align: 'left'  },
                                { label: 'Statut',     align: 'left'  },
                                { label: 'Montant',    align: 'right' },
                                { label: 'Actions',    align: 'right' },
                            ].map(h => (
                                <th key={h.label} style={{
                                    padding: '0.75rem 1.25rem',
                                    textAlign: h.align as 'left' | 'right',
                                    fontSize: '0.6875rem',
                                    fontWeight: 700,
                                    color: '#6b7280',
                                    textTransform: 'uppercase' as const,
                                    letterSpacing: '0.05em',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {h.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {quotes.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '4rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '3.5rem', height: '3.5rem',
                                            background: '#f3f4f6', borderRadius: '1rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <FileText size={22} color="#d1d5db" />
                                        </div>
                                        <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem', margin: 0 }}>
                                            Aucun devis pour le moment
                                        </p>
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                                            Créez votre première proposition commerciale.
                                        </p>
                                        <button
                                            onClick={() => navigate('/finance/quotes/new')}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                padding: '0.5rem 1rem',
                                                background: '#eef2ff', color: '#4f46e5',
                                                border: '1px solid #c7d2fe', borderRadius: '0.5rem',
                                                fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                                            }}
                                        >
                                            <Plus size={14} /> Créer un devis
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : quotes.map(quote => {
                            const status = STATUS_CONFIG[quote.status] ?? STATUS_CONFIG.DRAFT;
                            const isHovered = hoveredId === quote.id;
                            const isAccepted = quote.status === 'ACCEPTED';
                            const isConverting = converting === quote.id;

                            return (
                                <tr
                                    key={quote.id}
                                    onClick={() => navigate(`/finance/quotes/${quote.id}`)}
                                    onMouseEnter={() => setHoveredId(quote.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    style={{
                                        borderBottom: '1px solid #f3f4f6',
                                        cursor: 'pointer',
                                        background: isHovered ? '#f9fafb' : '#fff',
                                        transition: 'background 0.1s',
                                    }}
                                >
                                    {/* Référence */}
                                    <td style={{ padding: '0.875rem 1.25rem' }}>
                                        <span style={{
                                            fontWeight: 700,
                                            color: isHovered ? '#4f46e5' : '#111827',
                                            fontSize: '0.875rem',
                                            transition: 'color 0.1s',
                                        }}>
                                            {quote.number}
                                        </span>
                                    </td>

                                    {/* Date */}
                                    <td style={{ padding: '0.875rem 1.25rem', color: '#6b7280', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                        {new Date(quote.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>

                                    {/* Client — résolu depuis actorMap */}
                                    <td style={{ padding: '0.875rem 1.25rem', color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>
                                        {actorMap[quote.actorId] ?? `—`}
                                    </td>

                                    {/* Statut */}
                                    <td style={{ padding: '0.875rem 1.25rem' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.2rem 0.625rem',
                                            background: status.bg,
                                            color: status.color,
                                            border: `1px solid ${status.border}`,
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {status.label}
                                        </span>
                                    </td>

                                    {/* Montant */}
                                    <td style={{
                                        padding: '0.875rem 1.25rem',
                                        textAlign: 'right',
                                        fontWeight: 700,
                                        color: '#111827',
                                        fontSize: '0.9375rem',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {fmt(quote.total)}
                                    </td>

                                    {/* Actions */}
                                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            gap: '0.5rem',
                                            opacity: isHovered ? 1 : 0,
                                            transition: 'opacity 0.15s',
                                        }}>
                                            {isAccepted && (
                                                <button
                                                    disabled={isConverting}
                                                    onClick={e => handleConvertToInvoice(quote, e)}
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                        padding: '0.3rem 0.75rem',
                                                        background: isConverting ? '#6ee7b7' : '#10b981',
                                                        color: '#fff',
                                                        border: 'none', borderRadius: '0.375rem',
                                                        fontSize: '0.75rem', fontWeight: 600,
                                                        cursor: isConverting ? 'not-allowed' : 'pointer',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                    onMouseEnter={e => { if (!isConverting) e.currentTarget.style.background = '#059669'; }}
                                                    onMouseLeave={e => { if (!isConverting) e.currentTarget.style.background = '#10b981'; }}
                                                >
                                                    <ArrowRight size={12} />
                                                    {isConverting ? 'Conversion...' : 'Convertir'}
                                                </button>
                                            )}
                                            <button
                                                onClick={e => { e.stopPropagation(); navigate(`/finance/quotes/${quote.id}`); }}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                    padding: '0.3rem 0.75rem',
                                                    background: '#f3f4f6', color: '#374151',
                                                    border: '1px solid #e5e7eb', borderRadius: '0.375rem',
                                                    fontSize: '0.75rem', fontWeight: 500,
                                                    cursor: 'pointer', whiteSpace: 'nowrap',
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.background = '#e5e7eb')}
                                                onMouseLeave={e => (e.currentTarget.style.background = '#f3f4f6')}
                                            >
                                                Voir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ── KPI Card ───────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, iconColor, iconBg, valueColor }: {
    icon: React.ComponentType<{ size: number; color: string }>;
    label: string;
    value: string;
    iconColor: string;
    iconBg: string;
    valueColor?: string;
}) => (
    <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{
                fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af',
                textTransform: 'uppercase' as const, letterSpacing: '0.08em', margin: 0,
            }}>
                {label}
            </p>
            <div style={{
                width: '2.25rem', height: '2.25rem',
                background: iconBg, borderRadius: '0.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={15} color={iconColor} />
            </div>
        </div>
        <p style={{
            fontSize: '1.75rem', fontWeight: 700,
            color: valueColor ?? '#111827',
            margin: 0, lineHeight: 1,
        }}>
            {value}
        </p>
    </div>
);

export default QuotesListPage;
