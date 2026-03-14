import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuoteService, type Quote, QuoteStatus } from '../../finance/services/quote.service';
import { Plus, ExternalLink, FileText } from 'lucide-react';

// ─── Status badge config ───────────────────────────────────────────────────────

const QUOTE_STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    DRAFT:    { bg: '#f3f4f6', color: '#6b7280',  label: 'Brouillon' },
    SENT:     { bg: '#eff6ff', color: '#1d4ed8',  label: 'Envoyé'    },
    ACCEPTED: { bg: '#ecfdf5', color: '#047857',  label: 'Accepté'   },
    REJECTED: { bg: '#fef2f2', color: '#b91c1c',  label: 'Refusé'    },
    EXPIRED:  { bg: '#fff7ed', color: '#c2410c',  label: 'Expiré'    },
};

const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

// ─── Component ────────────────────────────────────────────────────────────────

export const ActorQuoteTab = ({ actorId }: { actorId: string }) => {
    const navigate = useNavigate();
    const [quotes, setQuotes]   = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        setLoading(true);
        QuoteService.getAll({ actorId })
            .then(setQuotes)
            .catch(() => setError('Impossible de charger les devis.'))
            .finally(() => setLoading(false));
    }, [actorId]);

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                    Devis{!loading && ` (${quotes.length})`}
                </span>
                <button
                    onClick={() => navigate(`/finance/quotes/new?actorId=${actorId}`)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.4rem 0.875rem',
                        background: '#eef2ff', border: '1px solid #c7d2fe',
                        borderRadius: '0.5rem', cursor: 'pointer',
                        fontSize: '0.8125rem', fontWeight: 600, color: '#4f46e5',
                    }}
                >
                    <Plus size={14} /> Nouveau devis
                </button>
            </div>

            {/* States */}
            {loading && (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                    Chargement…
                </div>
            )}

            {error && (
                <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#b91c1c', fontSize: '0.875rem' }}>
                    {error}
                </div>
            )}

            {!loading && !error && quotes.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center' }}>
                    <div style={{ width: '3rem', height: '3rem', background: '#f3f4f6', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>
                        <FileText size={20} color="#9ca3af" />
                    </div>
                    <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827', margin: '0 0 0.25rem 0' }}>Aucun devis</p>
                    <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0 0 1rem 0' }}>Aucun devis pour ce client.</p>
                    <button
                        onClick={() => navigate(`/finance/quotes/new?actorId=${actorId}`)}
                        style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#4f46e5', border: '1px solid #c7d2fe', background: '#eef2ff', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}
                    >
                        + Créer un devis
                    </button>
                </div>
            )}

            {!loading && !error && quotes.length > 0 && (
                <div style={{ border: '1px solid #f3f4f6', borderRadius: '0.625rem', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb' }}>
                                <th style={thStyle}>Numéro</th>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Montant TTC</th>
                                <th style={thStyle}>Statut</th>
                                <th style={{ ...thStyle, width: '60px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map(q => {
                                const s = QUOTE_STATUS_STYLES[q.status] ?? QUOTE_STATUS_STYLES.DRAFT;
                                return (
                                    <tr
                                        key={q.id}
                                        style={{ borderTop: '1px solid #f3f4f6' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#fafafa'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <td style={tdStyle}>
                                            <span style={{ fontWeight: 600, color: '#111827' }}>{q.number}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ color: '#6b7280' }}>
                                                {new Date(q.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ fontWeight: 600, color: '#111827' }}>{fmt.format(q.total)}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ padding: '0.125rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600, background: s.bg, color: s.color }}>
                                                {s.label}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => navigate(`/finance/quotes/${q.id}`)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: 'none', border: '1px solid #e5e7eb', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem', color: '#6b7280' }}
                                            >
                                                <ExternalLink size={11} /> Voir
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const thStyle: React.CSSProperties = {
    padding: '0.625rem 1rem',
    textAlign: 'left',
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #f3f4f6',
};

const tdStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
};
