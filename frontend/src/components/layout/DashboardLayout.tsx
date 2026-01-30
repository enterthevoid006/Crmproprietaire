import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth.context';
import {
    LayoutDashboard,
    Users,
    LogOut,
    Building2,
    FolderOpen,
    CheckSquare,
    Calendar,

    Euro,
    FileText
} from 'lucide-react';

export const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Pages that should take up the full width/height without padding constraints
    const isFullWidthPage = location.pathname.startsWith('/opportunities');

    // const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false); // Enable later for mobile


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Agenda', path: '/agenda', icon: Calendar },
        { label: 'Clients', path: '/actors', icon: Users },
        { label: 'Pipeline', path: '/opportunities', icon: FolderOpen },
        { label: 'Tâches', path: '/tasks', icon: CheckSquare },
        { label: 'Factures', path: '/finance/invoices', icon: Euro },
        { label: 'Devis', path: '/finance/quotes', icon: FileText },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(var(--surface-1))' }}>
            {/* Sidebar (Desktop) */}
            <aside style={{
                width: '260px',
                background: 'hsl(var(--surface-2))',
                borderRight: '1px solid var(--border-1)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 20,
                transform: 'translateX(0)', // Handle mobile logic differently via CSS media queries if needed, but for now strict desktop/mobile separation
            }} className="hidden-mobile">

                <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <Building2 size={24} />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--text-1))' }}>
                        Bonjour
                    </span>
                </div>

                <nav style={{ flex: 1, padding: '1rem' }}>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    style={({ isActive }) => ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        color: isActive ? 'var(--color-primary)' : 'hsl(var(--text-2))',
                                        background: isActive ? 'hsla(var(--primary-hue), var(--primary-sat), 96%)' : 'transparent',
                                        fontWeight: isActive ? 600 : 500,
                                        transition: 'all 0.2s',
                                        textDecoration: 'none'
                                    })}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-1)' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'hsl(var(--surface-3))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'hsl(var(--text-2))',
                            fontWeight: 600
                        }}>
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(var(--text-1))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.email}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-3))' }}>
                                Tenant: {user?.tenantId}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            color: 'hsl(var(--danger))',
                            background: 'transparent',
                            border: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        <LogOut size={16} /> Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                marginLeft: '260px', // Matches sidebar width
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={isFullWidthPage ? { width: '100%' } : { padding: '2rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
