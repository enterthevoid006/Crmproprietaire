import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

export const RegisterConfirmPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email: string = (location.state as any)?.email ?? '';

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            padding: '1.5rem',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '440px',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '1rem',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                padding: '2.5rem',
                textAlign: 'center',
            }}>
                {/* Icon */}
                <div style={{
                    width: '4rem', height: '4rem',
                    background: '#ecfdf5', border: '1px solid #a7f3d0',
                    borderRadius: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                }}>
                    <Mail size={24} color="#059669" />
                </div>

                <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', margin: '0 0 0.75rem 0' }}>
                    Vérifiez votre email
                </h1>

                <p style={{ fontSize: '0.9375rem', color: '#6b7280', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                    Un lien d'activation a été envoyé à{' '}
                    {email && (
                        <strong style={{ color: '#111827' }}>{email}</strong>
                    )}
                    . Cliquez sur le lien pour activer votre compte.
                </p>

                <div style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '0.5rem',
                    padding: '0.875rem 1rem',
                    fontSize: '0.8125rem',
                    color: '#92400e',
                    marginBottom: '1.5rem',
                    textAlign: 'left',
                }}>
                    <strong>En développement :</strong> le token est affiché dans les logs du backend{' '}
                    (<code style={{ background: '#fef3c7', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>console.log</code>).{' '}
                    Consultez la console du serveur et appelez{' '}
                    <code style={{ background: '#fef3c7', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>GET /iam/verify/:token</code>.
                </div>

                <button
                    onClick={() => navigate('/login')}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                        fontSize: '0.875rem', fontWeight: 500, color: '#4f46e5',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}
                >
                    <ArrowLeft size={14} /> Retour à la connexion
                </button>
            </div>
        </div>
    );
};
