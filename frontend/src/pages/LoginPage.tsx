import React, { useState } from 'react';
import { useAuth } from '../lib/auth.context';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { ActorService } from '../modules/actors/services/actor.service';

export const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login(email, password);
            // Redirect to onboarding if no actors exist yet (first login)
            try {
                const actors = await ActorService.getAll();
                if (actors.length === 0) {
                    navigate('/onboarding');
                } else {
                    navigate('/');
                }
            } catch {
                navigate('/');
            }
        } catch (err: any) {
            setError('Identifiants invalides. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top right, hsl(var(--primary-hue) 80% 90%), transparent 40%), radial-gradient(circle at bottom left, hsl(200 80% 90%), transparent 40%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Blur Blobs */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '20%',
                width: '300px',
                height: '300px',
                background: 'hsla(var(--primary-hue), 80%, 60%, 0.2)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                zIndex: 0
            }} />

            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '2.5rem',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 1,
                position: 'relative'
            }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Bonjour</h1>
                    <p style={{ color: 'hsl(var(--text-2))' }}>Connectez-vous pour accéder à votre CRM.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'hsl(var(--danger) / 0.1)',
                            color: 'hsl(var(--danger))',
                            fontSize: '0.875rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-3))' }} />
                        <input
                            type="email"
                            placeholder="Adresse email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem 0.875rem 2.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-2)',
                                background: 'hsl(var(--surface-2) / 0.5)',
                                color: 'hsl(var(--text-1))',
                                transition: 'all 0.2s'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-3))' }} />
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem 0.875rem 2.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-2)',
                                background: 'hsl(var(--surface-2) / 0.5)',
                                color: 'hsl(var(--text-1))'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            padding: '0.875rem',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            background: 'var(--color-primary)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginTop: '0.5rem',
                            boxShadow: 'var(--shadow-md)',
                            transition: 'transform 0.1s, box-shadow 0.1s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Se connecter <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'hsl(var(--text-3))' }}>
                    Pas encore de compte ?{' '}
                    <a href="/register" style={{ color: '#4f46e5', fontWeight: 500 }}>
                        Créer un espace de travail
                    </a>
                </div>
            </div>
        </div>
    );
};
