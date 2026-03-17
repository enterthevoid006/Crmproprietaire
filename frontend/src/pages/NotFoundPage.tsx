import { useNavigate } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';

export const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
            <div style={{ textAlign: 'center', maxWidth: '420px' }}>
                {/* Icon */}
                <div style={{
                    width: '5rem', height: '5rem',
                    background: '#eef2ff',
                    border: '1px solid #c7d2fe',
                    borderRadius: '1.25rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                }}>
                    <SearchX size={32} color="#4f46e5" />
                </div>

                {/* 404 number */}
                <div style={{
                    fontSize: '5rem', fontWeight: 800,
                    color: '#4f46e5', lineHeight: 1,
                    margin: '0 0 0.75rem',
                    letterSpacing: '-0.05em',
                }}>
                    404
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: '1.25rem', fontWeight: 700,
                    color: '#111827', margin: '0 0 0.75rem',
                }}>
                    Page introuvable
                </h1>

                {/* Subtitle */}
                <p style={{
                    fontSize: '0.875rem', color: '#6b7280',
                    margin: '0 0 2rem', lineHeight: 1.6,
                }}>
                    La page que vous cherchez n'existe pas ou a été déplacée.
                </p>

                {/* CTA */}
                <button
                    onClick={() => navigate('/')}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.625rem 1.5rem',
                        background: '#4f46e5', border: 'none',
                        borderRadius: '0.625rem',
                        fontSize: '0.875rem', fontWeight: 600,
                        color: '#fff', cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(79,70,229,0.3)',
                    }}
                >
                    <Home size={15} /> Retour au tableau de bord
                </button>
            </div>
        </div>
    );
};
