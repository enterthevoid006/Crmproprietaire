import { useAuth } from '../lib/auth.context';

export const DashboardPage = () => {
    const { user } = useAuth();

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--text-1))' }}>Dashboard</h1>
                <p style={{ color: 'hsl(var(--text-2))' }}>Welcome back to your property management center.</p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>User Profile</h3>
                    <p style={{ color: 'hsl(var(--text-2))' }}>
                        Logged in as <strong>{user?.email}</strong>
                    </p>
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'hsl(var(--surface-3))', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                        Tenant ID: <code style={{ color: 'var(--color-primary)' }}>{user?.tenantId}</code>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Actions</h3>
                    <p style={{ color: 'hsl(var(--text-3))' }}>Coming soon...</p>
                </div>
            </div>
        </div>
    );
};
