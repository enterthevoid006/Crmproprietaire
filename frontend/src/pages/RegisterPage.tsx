import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../lib/api';

export const RegisterPage = () => {
    const navigate = useNavigate();

    const [tenantName, setTenantName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post('/iam/register', { tenantName, email, password });
            navigate('/register/confirm', { state: { email } });
        } catch (err: any) {
            console.error('[Register] Erreur complète:', err);
            console.error('[Register] Status HTTP:', err.response?.status);
            console.error('[Register] Body réponse:', err.response?.data);
            console.error('[Register] Message:', err.message);
            const message = err.response?.data?.message;
            setError(typeof message === 'string' ? message : 'Une erreur est survenue. Veuillez réessayer.');
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
            background: '#f8fafc',
            padding: '1.5rem',
        }}>
            {/* Decorative blob */}
            <div style={{
                position: 'fixed',
                top: '-10rem',
                right: '-10rem',
                width: '30rem',
                height: '30rem',
                background: 'radial-gradient(circle, rgba(79,70,229,0.12), transparent 70%)',
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
                padding: '2.5rem',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '3rem', height: '3rem',
                        background: '#eef2ff', border: '1px solid #c7d2fe',
                        borderRadius: '0.875rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem',
                    }}>
                        <Building2 size={20} color="#4f46e5" />
                    </div>
                    <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', margin: '0 0 0.375rem 0' }}>
                        Créer votre espace de travail
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                        Essai gratuit — aucune carte bancaire requise
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '0.5rem',
                        color: '#dc2626',
                        fontSize: '0.875rem',
                        marginBottom: '1.25rem',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Nom de l'agence */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                            Nom de l'agence
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Building2 size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="text"
                                placeholder="Mon Agence Immo"
                                value={tenantName}
                                onChange={(e) => setTenantName(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.875rem 0.625rem 2.5rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: '#111827',
                                    background: '#fff',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                            Adresse email
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="email"
                                placeholder="vous@agence.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.875rem 0.625rem 2.5rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: '#111827',
                                    background: '#fff',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>
                    </div>

                    {/* Mot de passe */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                            Mot de passe
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="password"
                                placeholder="8 caractères minimum"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.875rem 0.625rem 2.5rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: '#111827',
                                    background: '#fff',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>
                    </div>

                    {/* Confirmation */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                            Confirmation du mot de passe
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="password"
                                placeholder="Répétez le mot de passe"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.875rem 0.625rem 2.5rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: '#111827',
                                    background: '#fff',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            marginTop: '0.5rem',
                            padding: '0.75rem',
                            background: isSubmitting ? '#a5b4fc' : '#4f46e5',
                            border: 'none',
                            borderRadius: '0.5rem',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'background 0.15s',
                        }}
                    >
                        {isSubmitting
                            ? <><Loader2 size={16} /> Création en cours...</>
                            : <><ArrowRight size={16} /> Créer mon espace de travail</>
                        }
                    </button>
                </form>

                {/* Footer */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8125rem', color: '#9ca3af' }}>
                    Déjà un compte ?{' '}
                    <a href="/login" style={{ color: '#4f46e5', fontWeight: 500, textDecoration: 'none' }}>
                        Se connecter
                    </a>
                </div>
            </div>
        </div>
    );
};
