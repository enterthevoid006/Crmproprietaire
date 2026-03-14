import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, Clock, FileText } from 'lucide-react';
import { InvoiceService, type Invoice } from '../services/invoice.service';
import { useIsMobile } from '../../../hooks/useIsMobile';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    DRAFT: { label: 'Brouillon', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
    SENT: { label: 'Envoyée', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
    PAID: { label: 'Payée', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
    OVERDUE: { label: 'Retard', color: '#be123c', bg: '#fef2f2', border: '#fecaca' },
    CANCELLED: { label: 'Annulée', color: '#9ca3af', bg: '#f3f4f6', border: '#e5e7eb' },
};

const InvoicesListPage = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { fetchInvoices(); }, []);

    const fetchInvoices = async () => {
        try {
            const data = await InvoiceService.getAll({});
            setInvoices(data);
        } catch {
            setError('Impossible de charger les factures');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Chargement...</span>
        </div>
    );

    const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0);
    const pendingAmount = invoices.filter(i => i.status === 'SENT').reduce((sum, i) => sum + i.total, 0);

    return (
        <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>

            {/* Header */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                marginBottom: '1.5rem',
            }}>
                <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>Facturation</h1>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>Vos finances en un coup d'œil</p>
                </div>
                <button
                    onClick={() => navigate('/finance/invoices/new')}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.375rem', padding: '0.5rem 1rem',
                        background: '#4f46e5', color: '#fff', border: 'none',
                        borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600,
                        cursor: 'pointer',
                        width: isMobile ? '100%' : 'auto',
                    }}
                >
                    <Plus size={16} /> Créer une Facture
                </button>
            </div>

            {/* KPI Cards — 3 cols desktop / 2 cols mobile */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem',
            }}>
                <KpiCard icon={TrendingUp} label="Chiffre d'affaires" value={fmt(totalRevenue)} iconColor="#047857" iconBg="#ecfdf5" />
                <KpiCard icon={Clock} label="En attente" value={fmt(pendingAmount)} iconColor="#1d4ed8" iconBg="#eff6ff" valueColor="#4f46e5" />
                <KpiCard icon={FileText} label="Factures" value={String(invoices.length)} iconColor="#7c3aed" iconBg="#f5f3ff" />
            </div>

            {error && (
                <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    {error}
                </div>
            )}

            {/* Content */}
            {isMobile ? (
                /* ── Mobile cards ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {invoices.length === 0 ? (
                        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '3rem 1.5rem', textAlign: 'center' }}>
                            <div style={{ width: '3rem', height: '3rem', background: '#f3f4f6', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                                <FileText size={20} color="#9ca3af" />
                            </div>
                            <p style={{ fontWeight: 500, color: '#374151', fontSize: '0.9375rem', margin: '0 0 0.5rem 0' }}>Aucune facture pour le moment</p>
                            <button onClick={() => navigate('/finance/invoices/new')}
                                style={{ color: '#4f46e5', background: 'none', border: 'none', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' }}>
                                Créer la première
                            </button>
                        </div>
                    ) : invoices.map(invoice => {
                        const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG['DRAFT'];
                        return (
                            <div
                                key={invoice.id}
                                onClick={() => navigate(`/finance/invoices/${invoice.id}`)}
                                style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 700, color: '#4f46e5', fontSize: '0.875rem' }}>{invoice.number}</span>
                                    <span style={{ padding: '0.15rem 0.5rem', background: status.bg, color: status.color, border: `1px solid ${status.border}`, borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 600 }}>
                                        {status.label}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 500, margin: 0 }}>
                                            {invoice.actorName || `Client ${invoice.actorId ? invoice.actorId.substring(0, 8) : 'Inconnu'}`}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.125rem 0 0 0' }}>
                                            {new Date(invoice.date).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{fmt(invoice.total)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ── Desktop table ── */
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                {['Référence', 'Date', 'Client', 'Statut', 'Montant'].map((h, i) => (
                                    <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: i === 4 ? 'right' : 'left', fontSize: '0.6875rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '4rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '3rem', height: '3rem', background: '#f3f4f6', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FileText size={20} color="#9ca3af" />
                                            </div>
                                            <p style={{ fontWeight: 500, color: '#374151', fontSize: '0.9375rem', margin: 0 }}>Aucune facture pour le moment</p>
                                            <button onClick={() => navigate('/finance/invoices/new')}
                                                style={{ color: '#4f46e5', background: 'none', border: 'none', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' }}>
                                                Créer la première
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : invoices.map(invoice => {
                                const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG['DRAFT'];
                                return (
                                    <tr key={invoice.id}
                                        onClick={() => navigate(`/finance/invoices/${invoice.id}`)}
                                        style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.1s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                                        onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                                    >
                                        <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: '#4f46e5', fontSize: '0.875rem' }}>{invoice.number}</td>
                                        <td style={{ padding: '0.875rem 1.25rem', color: '#6b7280', fontSize: '0.875rem' }}>{new Date(invoice.date).toLocaleDateString('fr-FR')}</td>
                                        <td style={{ padding: '0.875rem 1.25rem', color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>
                                            {invoice.actorName || `Client ${invoice.actorId ? invoice.actorId.substring(0, 8) : 'Inconnu'}`}
                                        </td>
                                        <td style={{ padding: '0.875rem 1.25rem' }}>
                                            <span style={{ padding: '0.2rem 0.625rem', background: status.bg, color: status.color, border: `1px solid ${status.border}`, borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right', fontWeight: 700, color: '#111827', fontSize: '0.9375rem' }}>
                                            {fmt(invoice.total)}
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

const KpiCard = ({ icon: Icon, label, value, iconColor, iconBg, valueColor }: any) => (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{label}</p>
            <div style={{ width: '2rem', height: '2rem', background: iconBg, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} color={iconColor} />
            </div>
        </div>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: valueColor || '#111827', margin: 0 }}>{value}</p>
    </div>
);

export default InvoicesListPage;
