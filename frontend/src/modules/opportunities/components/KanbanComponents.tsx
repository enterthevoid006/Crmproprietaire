import { MoreHorizontal, Calendar, DollarSign, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Opportunity } from '../services/opportunity.service';

// --- Kanban Column ---
interface KanbanColumnProps {
    id: string;
    label: string;
    color: string;
    bg: string;
    count: number;
    totalAmount: number;
    children: React.ReactNode;
    isOver: boolean;
    formatCurrency: (amount: number) => string;
}

export const KanbanColumn = ({ label, color, bg, count, totalAmount, children, isOver, formatCurrency }: KanbanColumnProps) => (
    <div style={{
        width: '280px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '1rem',
        border: isOver ? `2px solid ${color}` : '1px solid #e5e7eb',
        background: isOver ? bg : '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'all 0.2s',
        overflow: 'hidden',
    }}>
        {/* Header */}
        <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa',
            flexShrink: 0,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                    width: '0.625rem', height: '0.625rem',
                    borderRadius: '50%', background: color,
                    boxShadow: `0 0 6px ${color}60`,
                    flexShrink: 0,
                }} />
                <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>{label}</span>
                <span style={{
                    background: '#f3f4f6', color: '#6b7280',
                    fontSize: '0.75rem', fontWeight: 700,
                    padding: '0.1rem 0.5rem', borderRadius: '9999px',
                }}>{count}</span>
            </div>
            {totalAmount > 0 && (
                <span style={{
                    fontSize: '0.75rem', fontWeight: 700, color: '#374151',
                    background: '#fff', border: '1px solid #e5e7eb',
                    padding: '0.25rem 0.5rem', borderRadius: '0.375rem',
                    fontFamily: 'monospace',
                }}>
                    {formatCurrency(totalAmount)}
                </span>
            )}
        </div>

        {/* Cards */}
        <div style={{
            padding: '0.75rem',
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
        }}>
            {children}
        </div>
    </div>
);

// --- Kanban Card ---
interface KanbanCardProps {
    opportunity: Opportunity;
    formatCurrency: (amount: number) => string;
    onDragStart: (e: React.DragEvent, id: string) => void;
}

export const KanbanCard = ({ opportunity, formatCurrency, onDragStart }: KanbanCardProps) => {
    const navigate = useNavigate();
    const isOverdue = opportunity.expectedCloseDate && new Date(opportunity.expectedCloseDate) < new Date();

    return (
        <div
            onClick={() => navigate(`/opportunities/${opportunity.id}`)}
            draggable
            onDragStart={(e) => onDragStart(e, opportunity.id)}
            style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1rem',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                (e.currentTarget as HTMLDivElement).style.borderColor = '#c7d2fe';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
        >
            {/* Client */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <div style={{ padding: '0.25rem', background: '#f3f4f6', borderRadius: '0.375rem' }}>
                        <Building2 size={11} color="#6b7280" />
                    </div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                        {opportunity.actor?.companyName || `${opportunity.actor?.firstName} ${opportunity.actor?.lastName}` || 'Sans nom'}
                    </span>
                </div>
                <button style={{ padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', borderRadius: '0.25rem' }}>
                    <MoreHorizontal size={14} />
                </button>
            </div>

            {/* Title */}
            <h4 style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>
                {opportunity.name}
            </h4>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>
                    <div style={{ background: '#d1fae5', padding: '0.25rem', borderRadius: '0.375rem' }}>
                        <DollarSign size={13} color="#059669" />
                    </div>
                    {formatCurrency(opportunity.amount)}
                </div>
                {opportunity.expectedCloseDate && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        fontSize: '0.6875rem', fontWeight: 600,
                        padding: '0.25rem 0.5rem', borderRadius: '0.375rem',
                        background: isOverdue ? '#fef2f2' : '#f9fafb',
                        color: isOverdue ? '#dc2626' : '#6b7280',
                        border: `1px solid ${isOverdue ? '#fecaca' : '#f3f4f6'}`,
                    }}>
                        <Calendar size={11} />
                        {new Date(opportunity.expectedCloseDate).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                    </div>
                )}
            </div>

            {/* Probability bar */}
            {opportunity.probability !== undefined && (
                <div style={{ marginTop: '0.75rem', height: '3px', background: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${opportunity.probability}%`,
                        borderRadius: '9999px',
                        background: opportunity.probability >= 80 ? '#10b981' : opportunity.probability >= 50 ? '#6366f1' : '#f59e0b',
                        transition: 'width 0.5s',
                    }} />
                </div>
            )}
        </div>
    );
};

// --- Empty State ---
export const KanbanEmptyState = () => (
    <div style={{
        height: '160px', border: '2px dashed #e5e7eb', borderRadius: '0.75rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '1.5rem', background: '#fafafa',
    }}>
        <div style={{ width: '2rem', height: '2rem', background: '#f3f4f6', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.625rem' }}>
            <div style={{ width: '0.75rem', height: '0.75rem', border: '1.5px dashed #d1d5db', borderRadius: '0.25rem' }} />
        </div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Cette étape est vide</span>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Glissez une carte ici</span>
    </div>
);

// --- Skeleton ---
export const KanbanSkeleton = () => (
    <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
        {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ width: '280px', flexShrink: 0, borderRadius: '1rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '1rem' }}>
                <div style={{ height: '1.5rem', background: '#e5e7eb', borderRadius: '0.5rem', width: '60%', marginBottom: '1rem', opacity: 0.6 }} />
                {[1, 2, 3].map(j => (
                    <div key={j} style={{ height: '6rem', background: '#fff', borderRadius: '0.75rem', border: '1px solid #e5e7eb', marginBottom: '0.75rem', opacity: 1 - j * 0.25 }} />
                ))}
            </div>
        ))}
    </div>
);
