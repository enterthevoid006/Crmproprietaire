import { useEffect, useState } from 'react';
import { ActorService, ActorType } from '../services/actor.service';
import type { Actor } from '../services/actor.service';
import { Plus, Building2, User, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ImportCsvModal } from '../components/ImportCsvModal';
import { useIsMobile } from '../../../hooks/useIsMobile';

export const ActorsListPage = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [actors, setActors] = useState<Actor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showImport, setShowImport] = useState(false);

    useEffect(() => {
        loadActors();
    }, []);

    const loadActors = async () => {
        try {
            setIsLoading(true);
            const data = await ActorService.getAll();
            setActors(data);
        } catch (err) {
            setError('Impossible de charger les clients.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div>Chargement des clients...</div>;
    }

    if (error) {
        return (
            <div style={{ color: 'hsl(var(--danger))', padding: '1rem', background: 'hsl(var(--danger) / 0.1)', borderRadius: 'var(--radius-md)' }}>
                {error}
            </div>
        );
    }

    return (
        <><div>
            {/* Header */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: isMobile ? 'flex-start' : 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: '0.875rem',
                marginBottom: '2rem',
            }}>
                <div>
                    <h1 style={{ fontSize: isMobile ? '1.375rem' : '2rem', fontWeight: 700, color: 'hsl(var(--text-1))' }}>Clients</h1>
                    <p style={{ color: 'hsl(var(--text-2))' }}>Gérez vos clients, prospects et partenaires.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', width: isMobile ? '100%' : 'auto' }}>
                    <button
                        onClick={() => setShowImport(true)}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            background: '#fff', color: '#4f46e5',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid #c7d2fe',
                            fontWeight: 600, cursor: 'pointer', fontSize: '0.9375rem',
                            flex: isMobile ? 1 : undefined,
                        }}
                    >
                        <Upload size={18} />
                        Importer CSV
                    </button>
                    <Link
                        to="/actors/new"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            background: 'var(--color-primary)', color: 'var(--color-on-primary)',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none', fontWeight: 600,
                            boxShadow: 'var(--shadow-md)',
                            flex: isMobile ? 1 : undefined,
                        }}
                    >
                        <Plus size={20} />
                        Nouveau Client
                    </Link>
                </div>
            </div>

            {/* Empty State */}
            {actors.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '4rem 2rem',
                    background: 'hsl(var(--surface-2))', borderRadius: 'var(--radius-lg)',
                    border: '1px dashed var(--border-2)',
                }}>
                    <UsersIconPlaceholder />
                    <h3 style={{ marginTop: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Aucun client trouvé</h3>
                    <p style={{ color: 'hsl(var(--text-2))', maxWidth: '400px', margin: '0.5rem auto' }}>
                        Commencez par créer votre premier client (propriétaire, locataire ou entreprise).
                    </p>
                </div>
            ) : isMobile ? (
                /* ── Mobile: card list ── */
                <div style={{ background: 'hsl(var(--surface-2))', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-1)', overflow: 'hidden' }}>
                    {actors.map((actor, idx) => (
                        <div
                            key={actor.id}
                            onClick={() => navigate(`/actors/${actor.id}`)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.875rem',
                                padding: '0.875rem 1rem',
                                borderBottom: idx < actors.length - 1 ? '1px solid var(--border-1)' : 'none',
                                cursor: 'pointer', background: 'hsl(var(--surface-2))',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'hsl(var(--surface-3))')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'hsl(var(--surface-2))')}
                        >
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                background: actor.type === ActorType.CORPORATE ? 'hsl(200 80% 90%)' : 'hsl(150 80% 90%)',
                                color: actor.type === ActorType.CORPORATE ? 'hsl(200 80% 40%)' : 'hsl(150 80% 40%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {actor.type === ActorType.CORPORATE ? <Building2 size={20} /> : <User size={20} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, color: 'hsl(var(--text-1))', fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {actor.type === ActorType.CORPORATE ? actor.companyName : `${actor.firstName} ${actor.lastName}`}
                                </div>
                                <div style={{ fontSize: '0.8125rem', color: 'hsl(var(--text-3))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {actor.email || actor.phone || '—'}
                                </div>
                            </div>
                            <span style={{ padding: '0.2rem 0.625rem', borderRadius: 'var(--radius-full)', fontSize: '0.6875rem', fontWeight: 600, background: 'hsl(var(--surface-3))', color: 'hsl(var(--text-2))', flexShrink: 0 }}>
                                {actor.type === 'CORPORATE' ? 'Entreprise' : 'Particulier'}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                /* ── Desktop: table ── */
                <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'hsl(var(--surface-3))', textAlign: 'left' }}>
                                <th style={thStyle}>Nom</th>
                                <th style={thStyle}>Type</th>
                                <th style={thStyle}>Contact</th>
                                <th style={thStyle}>Créé le</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actors.map((actor) => (
                                <tr
                                    key={actor.id}
                                    onClick={() => navigate(`/actors/${actor.id}`)}
                                    style={{ borderBottom: '1px solid var(--border-1)', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--surface-2))'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                background: actor.type === ActorType.CORPORATE ? 'hsl(200 80% 90%)' : 'hsl(150 80% 90%)',
                                                color: actor.type === ActorType.CORPORATE ? 'hsl(200 80% 40%)' : 'hsl(150 80% 40%)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {actor.type === ActorType.CORPORATE ? <Building2 size={20} /> : <User size={20} />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'hsl(var(--text-1))' }}>
                                                    {actor.type === ActorType.CORPORATE ? actor.companyName : `${actor.firstName} ${actor.lastName}`}
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-3))' }}>{actor.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, background: 'hsl(var(--surface-3))', color: 'hsl(var(--text-2))', textTransform: 'lowercase' }}>
                                            {actor.type === 'CORPORATE' ? 'Entreprise' : 'Particulier'}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ color: 'hsl(var(--text-2))' }}>{actor.phone || '-'}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ color: 'hsl(var(--text-3))', fontSize: '0.875rem' }}>
                                            {new Date(actor.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {showImport && (
            <ImportCsvModal
                onClose={() => setShowImport(false)}
                onSuccess={() => { setShowImport(false); loadActors(); }}
            />
        )}
        </>
    );
};

const thStyle = {
    padding: '1rem 1.5rem',
    fontSize: '0.75rem', fontWeight: 600 as const,
    textTransform: 'uppercase' as const,
    color: 'hsl(var(--text-3))', letterSpacing: '0.05em',
};

const tdStyle = { padding: '1rem 1.5rem' };

const UsersIconPlaceholder = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--text-3))" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
