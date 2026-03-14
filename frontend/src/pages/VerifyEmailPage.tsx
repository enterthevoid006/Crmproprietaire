import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

type Status = 'loading' | 'success' | 'error';

export const VerifyEmailPage = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<Status>('loading');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }
        const controller = new AbortController();
        api.get(`/iam/verify/${token}`, { signal: controller.signal })
            .then(() => setStatus('success'))
            .catch((err) => {
                if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
                setStatus('error');
            });
        return () => controller.abort();
    }, [token]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            padding: '1.5rem',
        }}>
            {/* Decorative blob */}
            <div style={{
                position: 'fixed',
                top: '-8rem',
                right: '-8rem',
                width: '28rem',
                height: '28rem',
                background: 'radial-gradient(circle, rgba(79,70,229,0.1), transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
            }} />

            <div style={{
                width: '100%',
                maxWidth: '440px',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '1rem',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                padding: '3rem 2.5rem',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
            }}>

                {/* Loading */}
                {status === 'loading' && (
                    <>
                        <div style={{
                            width: '4rem', height: '4rem',
                            background: '#eef2ff',
                            borderRadius: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                        }}>
                            <Loader2 size={28} color="#4f46e5" style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem 0' }}>
                            Vérification en cours…
                        </h1>
                        <p style={{ fontSize: '0.9375rem', color: '#6b7280', margin: 0 }}>
                            Nous activons votre compte, merci de patienter.
                        </p>
                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    </>
                )}

                {/* Success */}
                {status === 'success' && (
                    <>
                        <div style={{
                            width: '5rem', height: '5rem',
                            background: '#ecfdf5',
                            border: '2px solid #6ee7b7',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.75rem',
                            animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        }}>
                            {/* Animated checkmark */}
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <path
                                    d="M8 16.5L13.5 22L24 11"
                                    stroke="#059669"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{
                                        strokeDasharray: 28,
                                        strokeDashoffset: 0,
                                        animation: 'drawCheck 0.5s ease 0.2s both',
                                    }}
                                />
                            </svg>
                        </div>

                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 0.75rem 0' }}>
                            Votre compte est activé !
                        </h1>
                        <p style={{ fontSize: '0.9375rem', color: '#6b7280', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
                            Félicitations, votre espace de travail est prêt.<br />
                            Connectez-vous pour commencer à utiliser votre CRM.
                        </p>

                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.75rem',
                                background: '#4f46e5',
                                border: 'none',
                                borderRadius: '0.625rem',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.9375rem',
                                cursor: 'pointer',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                                boxShadow: '0 4px 12px rgba(79,70,229,0.35)',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(79,70,229,0.45)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.35)';
                            }}
                        >
                            Accéder à mon CRM →
                        </button>

                        <style>{`
                            @keyframes popIn {
                                from { transform: scale(0.5); opacity: 0; }
                                to   { transform: scale(1);   opacity: 1; }
                            }
                            @keyframes drawCheck {
                                from { stroke-dashoffset: 28; }
                                to   { stroke-dashoffset: 0; }
                            }
                        `}</style>
                    </>
                )}

                {/* Error */}
                {status === 'error' && (
                    <>
                        <div style={{
                            width: '4.5rem', height: '4.5rem',
                            background: '#fef2f2',
                            border: '2px solid #fca5a5',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.75rem',
                        }}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                <path d="M9 9l10 10M19 9L9 19" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>

                        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', margin: '0 0 0.75rem 0' }}>
                            Lien invalide ou expiré
                        </h1>
                        <p style={{ fontSize: '0.9375rem', color: '#6b7280', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
                            Ce lien d'activation n'est plus valide. Il a peut-être déjà été utilisé
                            ou a expiré. Veuillez vous réinscrire ou contacter le support.
                        </p>

                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                fontSize: '0.9375rem',
                                fontWeight: 500,
                                color: '#4f46e5',
                                background: '#eef2ff',
                                border: '1px solid #c7d2fe',
                                borderRadius: '0.625rem',
                                padding: '0.625rem 1.25rem',
                                cursor: 'pointer',
                                transition: 'background 0.15s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#e0e7ff'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#eef2ff'}
                        >
                            <ArrowLeft size={15} /> Retour à l'inscription
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
