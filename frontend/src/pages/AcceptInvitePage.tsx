import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Lock, User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../lib/api';

type PageState = 'loading' | 'form' | 'existing_user' | 'error' | 'success';

export const AcceptInvitePage = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [pageState, setPageState] = useState<PageState>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [tenantName, setTenantName] = useState('');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!token) { setErrorMsg('Token manquant.'); setPageState('error'); return; }

        api.get(`/iam/accept-invite/${token}`)
            .then(res => {
                setInviteEmail(res.data.email);
                setTenantName(res.data.tenantName);
                if (res.data.existingUser) {
                    setPageState('existing_user');
                } else {
                    setPageState('form');
                }
            })
            .catch(err => {
                setErrorMsg(err.response?.data?.message ?? 'Invitation invalide ou expirée.');
                setPageState('error');
            });
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (password.length < 8) {
            setFormError('Le mot de passe doit contenir au moins 8 caractères.'); return;
        }
        if (password !== confirmPassword) {
            setFormError('Les mots de passe ne correspondent pas.'); return;
        }

        setSubmitting(true);
        try {
            const res = await api.post('/iam/accept-invite', {
                token,
                password,
                firstName: firstName.trim() || undefined,
                lastName: lastName.trim() || undefined,
            });
            localStorage.setItem('accessToken', res.data.accessToken);
            setPageState('success');
            setTimeout(() => { window.location.href = '/'; }, 1500);
        } catch (err: any) {
            setFormError(err.response?.data?.message ?? 'Une erreur est survenue.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.625rem 0.875rem 0.625rem 2.5rem',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        color: '#111827',
        background: '#fff',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: '#374151',
        marginBottom: '0.375rem',
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
                position: 'fixed', top: '-10rem', right: '-10rem',
                width: '30rem', height: '30rem',
                background: 'radial-gradient(circle, rgba(79,70,229,0.12), transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />

            <div style={{
                width: '100%', maxWidth: '440px',
                background: '#fff', border: '1px solid #e5e7eb',
                borderRadius: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                padding: '2.5rem', position: 'relative', zIndex: 1,
            }}>

                {/* ── Loading ── */}
                {pageState === 'loading' && (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: '#6b7280' }}>
                        <Loader2 size={32} style={{ margin: '0 auto 1rem', display: 'block', animation: 'spin 1s linear infinite' }} />
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>Vérification de l'invitation...</p>
                    </div>
                )}

                {/* ── Error ── */}
                {pageState === 'error' && (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{
                            width: '3rem', height: '3rem', background: '#fef2f2',
                            border: '1px solid #fecaca', borderRadius: '0.875rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                        }}>
                            <AlertCircle size={20} color="#dc2626" />
                        </div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem' }}>
                            Invitation invalide
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
                            {errorMsg}
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '0.625rem 1.5rem', background: '#4f46e5', color: '#fff',
                                border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem',
                                fontWeight: 600, cursor: 'pointer',
                            }}
                        >
                            Aller à la connexion
                        </button>
                    </div>
                )}

                {/* ── Existing user ── */}
                {pageState === 'existing_user' && (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{
                            width: '3rem', height: '3rem', background: '#eef2ff',
                            border: '1px solid #c7d2fe', borderRadius: '0.875rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                        }}>
                            <Users size={20} color="#4f46e5" />
                        </div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem' }}>
                            Compte déjà existant
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem', lineHeight: 1.6 }}>
                            Vous avez été invité à rejoindre <strong style={{ color: '#111827' }}>{tenantName}</strong>.
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
                            Un compte existe déjà pour <strong style={{ color: '#111827' }}>{inviteEmail}</strong>. Connectez-vous pour accéder à votre espace.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '0.625rem 1.5rem', background: '#4f46e5', color: '#fff',
                                border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem',
                                fontWeight: 600, cursor: 'pointer',
                            }}
                        >
                            Se connecter
                        </button>
                    </div>
                )}

                {/* ── Success ── */}
                {pageState === 'success' && (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{
                            width: '3rem', height: '3rem', background: '#ecfdf5',
                            border: '1px solid #a7f3d0', borderRadius: '0.875rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                        }}>
                            <CheckCircle size={20} color="#047857" />
                        </div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem' }}>
                            Bienvenue dans l'équipe !
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                            Vous rejoignez <strong style={{ color: '#111827' }}>{tenantName}</strong>. Redirection en cours…
                        </p>
                    </div>
                )}

                {/* ── Form ── */}
                {pageState === 'form' && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '3rem', height: '3rem', background: '#eef2ff',
                                border: '1px solid #c7d2fe', borderRadius: '0.875rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem',
                            }}>
                                <Users size={20} color="#4f46e5" />
                            </div>
                            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', margin: '0 0 0.375rem' }}>
                                Rejoindre {tenantName}
                            </h1>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                                Créez votre compte pour accéder à l'espace de travail.
                            </p>
                        </div>

                        {formError && (
                            <div style={{
                                padding: '0.75rem 1rem', background: '#fef2f2',
                                border: '1px solid #fecaca', borderRadius: '0.5rem',
                                color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem',
                            }}>
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Email (readonly) */}
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    readOnly
                                    style={{ ...inputStyle, paddingLeft: '0.875rem', background: '#f9fafb', color: '#6b7280', cursor: 'default' }}
                                />
                            </div>

                            {/* Name */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={labelStyle}>Prénom</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                        <input
                                            type="text"
                                            placeholder="Jean"
                                            value={firstName}
                                            onChange={e => setFirstName(e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Nom</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                        <input
                                            type="text"
                                            placeholder="Dupont"
                                            value={lastName}
                                            onChange={e => setLastName(e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label style={labelStyle}>Mot de passe <span style={{ color: '#ef4444' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                    <input
                                        type="password"
                                        placeholder="8 caractères minimum"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label style={labelStyle}>Confirmation <span style={{ color: '#ef4444' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                    <input
                                        type="password"
                                        placeholder="Répétez le mot de passe"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    marginTop: '0.25rem',
                                    padding: '0.75rem',
                                    background: submitting ? '#a5b4fc' : '#4f46e5',
                                    border: 'none', borderRadius: '0.5rem',
                                    color: '#fff', fontWeight: 600, fontSize: '0.9375rem',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    transition: 'background 0.15s',
                                }}
                            >
                                {submitting
                                    ? <><Loader2 size={16} /> Création du compte...</>
                                    : 'Rejoindre l\'équipe'
                                }
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
