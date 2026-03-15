import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth.context';
import api from '../../lib/api';
import {
    LayoutDashboard, Users, LogOut, Building2, FolderOpen,
    CheckSquare, Calendar, Euro, FileText, Settings, Bell,
    CheckCheck, AlertCircle, Clock, FileWarning, UserPlus, X,
    Search, Loader2, Menu,
} from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppNotification {
    id: string;
    type: 'TASK_DUE' | 'QUOTE_EXPIRING' | 'INVOICE_OVERDUE' | 'TEAM_INVITE';
    title: string;
    message: string;
    read: boolean;
    resourceId: string | null;
    resourceType: string | null;
    createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1)  return "À l'instant";
    if (m < 60) return `Il y a ${m}min`;
    if (h < 24) return `Il y a ${h}h`;
    if (d === 1) return 'Hier';
    return `Il y a ${d}j`;
};

const NOTIF_STYLES: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
    TASK_DUE:        { bg: '#fffbeb', color: '#b45309', icon: Clock },
    QUOTE_EXPIRING:  { bg: '#eff6ff', color: '#1d4ed8', icon: FileWarning },
    INVOICE_OVERDUE: { bg: '#fef2f2', color: '#b91c1c', icon: AlertCircle },
    TEAM_INVITE:     { bg: '#f0fdf4', color: '#166534', icon: UserPlus },
};

const getResourcePath = (n: AppNotification): string | null => {
    if (!n.resourceType) return null;
    if (n.resourceType === 'task')    return '/tasks';
    if (n.resourceType === 'quote')   return n.resourceId ? `/finance/quotes/${n.resourceId}` : '/finance/quotes';
    if (n.resourceType === 'invoice') return n.resourceId ? `/finance/invoices/${n.resourceId}` : '/finance/invoices';
    return '/settings';
};

// ─── Notification Bell component ──────────────────────────────────────────────

const NotificationBell: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get<AppNotification[]>('/notifications');
            setNotifications(res.data);
        } catch { /* silent — user may not be authenticated yet */ }
    }, []);

    // Initial fetch + polling every 30s
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30_000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const unreadCount = notifications.length;

    const handleMarkRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch { /* silent */ }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications([]);
        } catch { /* silent */ }
    };

    const handleClickNotification = async (n: AppNotification) => {
        await handleMarkRead(n.id);
        const path = getResourcePath(n);
        if (path) navigate(path);
        setOpen(false);
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* Bell button */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    position: 'relative',
                    width: '36px', height: '36px',
                    background: open ? '#eef2ff' : 'transparent',
                    border: '1px solid',
                    borderColor: open ? '#c7d2fe' : '#e5e7eb',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: open ? '#4f46e5' : '#6b7280',
                    transition: 'all 0.15s',
                }}
            >
                <Bell size={17} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-5px', right: '-5px',
                        background: '#dc2626', color: '#fff',
                        fontSize: '0.625rem', fontWeight: 700,
                        minWidth: '16px', height: '16px',
                        borderRadius: '9999px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 3px',
                        border: '2px solid #fff',
                        lineHeight: 1,
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 'min(360px, calc(100vw - 2rem))',
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                    zIndex: 100,
                    overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.875rem 1rem',
                        borderBottom: '1px solid #f3f4f6',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Bell size={15} color="#4f46e5" />
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                                Notifications
                            </span>
                            {unreadCount > 0 && (
                                <span style={{
                                    background: '#eef2ff', color: '#4f46e5',
                                    fontSize: '0.6875rem', fontWeight: 700,
                                    padding: '1px 6px', borderRadius: '9999px',
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    title="Tout marquer comme lu"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                                        padding: '0.25rem 0.5rem',
                                        background: 'none', border: 'none',
                                        color: '#4f46e5', fontSize: '0.75rem',
                                        fontWeight: 600, cursor: 'pointer',
                                        borderRadius: '0.25rem',
                                    }}
                                >
                                    <CheckCheck size={13} /> Tout lire
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{
                                padding: '2.5rem 1rem', textAlign: 'center',
                                color: '#9ca3af', fontSize: '0.875rem',
                            }}>
                                <Bell size={28} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.4 }} />
                                Aucune notification
                            </div>
                        ) : (
                            notifications.map(n => {
                                const s = NOTIF_STYLES[n.type] ?? NOTIF_STYLES.TASK_DUE;
                                const Icon = s.icon;
                                const isClickable = !!getResourcePath(n);
                                return (
                                    <div
                                        key={n.id}
                                        onClick={() => isClickable && handleClickNotification(n)}
                                        style={{
                                            display: 'flex', gap: '0.75rem',
                                            padding: '0.875rem 1rem',
                                            borderBottom: '1px solid #f9fafb',
                                            cursor: isClickable ? 'pointer' : 'default',
                                            transition: 'background 0.1s',
                                            background: '#fff',
                                        }}
                                        onMouseEnter={e => { if (isClickable) e.currentTarget.style.background = '#f9fafb'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                                    >
                                        {/* Icon */}
                                        <div style={{
                                            width: '34px', height: '34px', flexShrink: 0,
                                            borderRadius: '0.5rem',
                                            background: s.bg,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Icon size={16} color={s.color} />
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', marginBottom: '0.125rem' }}>
                                                {n.title}
                                            </div>
                                            <div style={{
                                                fontSize: '0.75rem', color: '#6b7280',
                                                lineHeight: 1.4,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical' as any,
                                                overflow: 'hidden',
                                            }}>
                                                {n.message}
                                            </div>
                                            <div style={{ fontSize: '0.6875rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                                {timeAgo(n.createdAt)}
                                            </div>
                                        </div>

                                        {/* Mark read button */}
                                        <button
                                            onClick={e => { e.stopPropagation(); handleMarkRead(n.id); }}
                                            title="Marquer comme lu"
                                            style={{
                                                flexShrink: 0, alignSelf: 'center',
                                                background: 'none', border: 'none',
                                                cursor: 'pointer', color: '#d1d5db',
                                                display: 'flex', padding: '0.25rem',
                                                borderRadius: '0.25rem',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.color = '#4f46e5'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = '#d1d5db'; }}
                                        >
                                            <X size={13} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Search Types ─────────────────────────────────────────────────────────────

interface SearchActor        { id: string; firstName: string; lastName: string; email: string | null; companyName: string | null; }
interface SearchOpportunity  { id: string; name: string; stage: string; amount: number | null; }
interface SearchInvoice      { id: string; number: string; status: string; total: number; }
interface SearchQuote        { id: string; number: string; status: string; total: number; }
interface SearchResults {
    actors:        SearchActor[];
    opportunities: SearchOpportunity[];
    invoices:      SearchInvoice[];
    quotes:        SearchQuote[];
}

// ─── Global Search component ──────────────────────────────────────────────────

const GlobalSearch: React.FC = () => {
    const navigate = useNavigate();
    const [query, setQuery]       = useState('');
    const [results, setResults]   = useState<SearchResults | null>(null);
    const [loading, setLoading]   = useState(false);
    const [open, setOpen]         = useState(false);
    const wrapperRef              = useRef<HTMLDivElement>(null);
    const timerRef                = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);

        if (timerRef.current) clearTimeout(timerRef.current);

        if (val.trim().length < 2) {
            setResults(null);
            setOpen(false);
            return;
        }

        timerRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await api.get<SearchResults>('/search', { params: { q: val.trim() } });
                setResults(res.data);
                setOpen(true);
            } catch {
                setResults(null);
            } finally {
                setLoading(false);
            }
        }, 300);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') { setOpen(false); setQuery(''); setResults(null); }
    };

    const go = (path: string) => {
        setOpen(false);
        setQuery('');
        setResults(null);
        navigate(path);
    };

    const totalResults = results
        ? results.actors.length + results.opportunities.length + results.invoices.length + results.quotes.length
        : 0;

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '300px' }}>
            {/* Input */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0 0.75rem',
                height: '36px',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                background: '#f9fafb',
            }}>
                {loading
                    ? <Loader2 size={15} color="#9ca3af" style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }} />
                    : <Search size={15} color="#9ca3af" style={{ flexShrink: 0 }} />
                }
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (results && totalResults > 0) setOpen(true); }}
                    placeholder="Rechercher…"
                    style={{
                        flex: 1, border: 'none', background: 'transparent',
                        outline: 'none', fontSize: '0.8125rem', color: '#111827',
                    }}
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults(null); setOpen(false); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}
                    >
                        <X size={13} />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {open && results && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                    width: 'min(380px, calc(100vw - 2rem))',
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                    zIndex: 100,
                    overflow: 'hidden',
                    maxHeight: '480px',
                    overflowY: 'auto',
                }}>
                    {totalResults === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                            Aucun résultat pour « {query} »
                        </div>
                    ) : (
                        <>
                            {results.actors.length > 0 && (
                                <Section label="Clients">
                                    {results.actors.map(a => (
                                        <ResultRow
                                            key={a.id}
                                            primary={`${a.firstName} ${a.lastName}`}
                                            secondary={a.companyName || a.email || ''}
                                            onClick={() => go(`/actors/${a.id}`)}
                                        />
                                    ))}
                                </Section>
                            )}
                            {results.opportunities.length > 0 && (
                                <Section label="Opportunités">
                                    {results.opportunities.map(o => (
                                        <ResultRow
                                            key={o.id}
                                            primary={o.name}
                                            secondary={o.stage}
                                            onClick={() => go('/opportunities')}
                                        />
                                    ))}
                                </Section>
                            )}
                            {results.invoices.length > 0 && (
                                <Section label="Factures">
                                    {results.invoices.map(i => (
                                        <ResultRow
                                            key={i.id}
                                            primary={i.number}
                                            secondary={`${i.status} — ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(i.total)}`}
                                            onClick={() => go(`/finance/invoices/${i.id}`)}
                                        />
                                    ))}
                                </Section>
                            )}
                            {results.quotes.length > 0 && (
                                <Section label="Devis">
                                    {results.quotes.map(q => (
                                        <ResultRow
                                            key={q.id}
                                            primary={q.number}
                                            secondary={`${q.status} — ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(q.total)}`}
                                            onClick={() => go(`/finance/quotes/${q.id}`)}
                                        />
                                    ))}
                                </Section>
                            )}
                        </>
                    )}
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <div style={{
            padding: '0.5rem 1rem 0.25rem',
            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.05em',
            color: '#9ca3af', textTransform: 'uppercase',
            borderBottom: '1px solid #f3f4f6',
        }}>
            {label}
        </div>
        {children}
    </div>
);

const ResultRow: React.FC<{ primary: string; secondary: string; onClick: () => void }> = ({ primary, secondary, onClick }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex', flexDirection: 'column', gap: '0.125rem',
            padding: '0.625rem 1rem',
            cursor: 'pointer',
            borderBottom: '1px solid #f9fafb',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
    >
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827' }}>{primary}</span>
        {secondary && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{secondary}</span>}
    </div>
);

// ─── Main Layout ──────────────────────────────────────────────────────────────

export const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Auto-close sidebar when navigating (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobile && sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobile, sidebarOpen]);

    const isFullWidthPage = location.pathname.startsWith('/opportunities') || location.pathname.startsWith('/actors');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Tableau de bord', path: '/', icon: LayoutDashboard },
        { label: 'Agenda', path: '/agenda', icon: Calendar },
        { label: 'Clients', path: '/actors', icon: Users },
        { label: 'Pipeline', path: '/opportunities', icon: FolderOpen },
        { label: 'Tâches', path: '/tasks', icon: CheckSquare },
        { label: 'Factures', path: '/finance/invoices', icon: Euro },
        { label: 'Devis', path: '/finance/quotes', icon: FileText },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(var(--surface-1))', overflowX: 'hidden' }}>

            {/* Mobile overlay */}
            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0,
                        width: '100vw', height: '100vh',
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 999,
                    }}
                />
            )}

            {/* Sidebar */}
            <aside style={{
                width: '260px',
                background: 'hsl(var(--surface-2))',
                borderRight: '1px solid var(--border-1)',
                display: 'flex', flexDirection: 'column',
                position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 1000,
                transform: isMobile
                    ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)')
                    : 'translateX(0)',
                transition: 'transform 0.3s ease',
            }}>

                <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px', height: '40px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                    }}>
                        <Building2 size={24} />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--text-1))' }}>
                        Bonjour
                    </span>
                </div>

                <nav style={{ flex: 1, padding: '1rem' }}>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {navItems.map(item => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    style={({ isActive }) => ({
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                                        color: isActive ? 'var(--color-primary)' : 'hsl(var(--text-2))',
                                        background: isActive ? 'hsla(var(--primary-hue), var(--primary-sat), 96%)' : 'transparent',
                                        fontWeight: isActive ? 600 : 500, transition: 'all 0.2s', textDecoration: 'none',
                                    })}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid var(--border-1)' }}>
                    <NavLink
                        to="/settings"
                        onClick={() => setSidebarOpen(false)}
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                            color: isActive ? 'var(--color-primary)' : 'hsl(var(--text-2))',
                            background: isActive ? 'hsla(var(--primary-hue), var(--primary-sat), 96%)' : 'transparent',
                            fontWeight: isActive ? 600 : 500, transition: 'all 0.2s',
                            textDecoration: 'none', marginBottom: '0.75rem', fontSize: '0.9375rem',
                        })}
                    >
                        <Settings size={20} />
                        Paramètres
                    </NavLink>

                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'hsl(var(--surface-3))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'hsl(var(--text-2))', fontWeight: 600,
                        }}>
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(var(--text-1))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.email}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-3))' }}>
                                Tenant: {user?.tenantId?.slice(0, 8)}…
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem', color: 'hsl(var(--danger))',
                            background: 'transparent', border: 'none',
                            fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                        }}
                    >
                        <LogOut size={16} /> Se déconnecter
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main style={{
                flex: 1,
                marginLeft: isMobile ? 0 : '260px',
                minHeight: '100vh',
                display: 'flex', flexDirection: 'column',
                minWidth: 0,
            }}>
                {/* Top bar */}
                <div style={{
                    height: '52px', flexShrink: 0,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 1rem 0 1.25rem', gap: '0.75rem',
                    background: '#fff',
                    borderBottom: '1px solid #f3f4f6',
                    position: 'sticky', top: 0, zIndex: 30,
                }}>
                    {isMobile ? (
                        <button
                            onClick={() => setSidebarOpen(o => !o)}
                            aria-label="Menu"
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center',
                                padding: '0.25rem', color: '#6b7280', flexShrink: 0,
                            }}
                        >
                            <Menu size={22} />
                        </button>
                    ) : (
                        <GlobalSearch />
                    )}
                    <NotificationBell />
                </div>

                <div style={isFullWidthPage
                    ? { width: '100%', flex: 1 }
                    : { padding: isMobile ? '1rem' : '2rem', maxWidth: '1200px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }
                }>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
