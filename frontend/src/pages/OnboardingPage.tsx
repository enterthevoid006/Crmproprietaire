import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActorService, ActorType } from '../modules/actors/services/actor.service';
import { OpportunityService } from '../modules/opportunities/services/opportunity.service';
import { Loader2, ArrowRight, Building2 } from 'lucide-react';

// Steps definition
const STEPS = [
    { id: 1, label: 'Votre agence',   emoji: '🏢' },
    { id: 2, label: 'Premier client', emoji: '👤' },
    { id: 3, label: 'Première opportunité', emoji: '🎯' },
];

export const OnboardingPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Step 2 — actor
    const [actorFirstName, setActorFirstName] = useState('');
    const [actorLastName, setActorLastName]   = useState('');
    const [actorEmail, setActorEmail]         = useState('');
    const [createdActorId, setCreatedActorId] = useState<string | null>(null);

    // Step 3 — opportunity
    const [dealName, setDealName]       = useState('');
    const [dealAmount, setDealAmount]   = useState('');

    const totalSteps = STEPS.length;
    const progress   = ((step - 1) / totalSteps) * 100;

    const goNext = () => {
        setError('');
        setStep(s => Math.min(s + 1, totalSteps + 1));
    };

    const finish = () => navigate('/');

    // Step 1 — just confirm, no API call
    const handleStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        goNext();
    };

    // Step 2 — create actor
    const handleStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const actor = await ActorService.create({
                type: ActorType.INDIVIDUAL,
                firstName: actorFirstName,
                lastName:  actorLastName,
                email:     actorEmail || undefined,
            });
            setCreatedActorId(actor.id);
            goNext();
        } catch {
            setError('Impossible de créer le client. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 2 skip — go without creating actor
    const skipStep2 = () => {
        setCreatedActorId(null);
        goNext();
    };

    // Step 3 — create opportunity
    const handleStep3 = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createdActorId) {
            // no actor — skip creating opportunity too
            finish();
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await OpportunityService.create({
                name:    dealName,
                actorId: createdActorId,
                amount:  dealAmount ? Number(dealAmount) : 0,
                stage:   'NEW',
            });
            finish();
        } catch {
            setError('Impossible de créer l\'opportunité. Vous pourrez le faire plus tard.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // If step > totalSteps, redirect (shouldn't happen but safeguard)
    if (step > totalSteps) {
        finish();
        return null;
    }

    const currentStep = STEPS[step - 1];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem 1.5rem',
        }}>
            {/* Blob décoration */}
            <div style={{
                position: 'fixed', top: '-6rem', right: '-6rem',
                width: '24rem', height: '24rem',
                background: 'radial-gradient(circle, rgba(79,70,229,0.1), transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'fixed', bottom: '-6rem', left: '-4rem',
                width: '20rem', height: '20rem',
                background: 'radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />

            {/* Header */}
            <div style={{ width: '100%', maxWidth: '520px', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building2 size={20} color="#4f46e5" />
                        <span style={{ fontWeight: 700, color: '#4f46e5', fontSize: '0.9375rem' }}>CRM</span>
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
                        Étape {step} sur {totalSteps}
                    </span>
                </div>

                {/* Progress bar */}
                <div style={{
                    width: '100%', height: '6px',
                    background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progress + (100 / totalSteps)}%`,
                        background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
                        borderRadius: '999px',
                        transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }} />
                </div>

                {/* Steps labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    {STEPS.map(s => (
                        <span key={s.id} style={{
                            fontSize: '0.75rem',
                            color: s.id <= step ? '#4f46e5' : '#d1d5db',
                            fontWeight: s.id === step ? 600 : 400,
                            transition: 'color 0.3s',
                        }}>
                            {s.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Card */}
            <div style={{
                width: '100%', maxWidth: '520px',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '1.25rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.07)',
                padding: '2.5rem',
                position: 'relative', zIndex: 1,
                animation: 'fadeSlideIn 0.35s ease',
            }}>
                <style>{`
                    @keyframes fadeSlideIn {
                        from { opacity: 0; transform: translateY(12px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                `}</style>

                {/* Step icon */}
                <div style={{
                    fontSize: '2.5rem', marginBottom: '1rem', lineHeight: 1,
                }}>
                    {currentStep.emoji}
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        background: '#fef2f2', border: '1px solid #fecaca',
                        borderRadius: '0.5rem', color: '#dc2626',
                        fontSize: '0.875rem', marginBottom: '1.25rem',
                    }}>
                        {error}
                    </div>
                )}

                {/* ── STEP 1 ── */}
                {step === 1 && (
                    <form onSubmit={handleStep1}>
                        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem 0' }}>
                            Bienvenue !
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '0.9375rem', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
                            Votre espace de travail est prêt. Nous allons configurer votre CRM
                            en quelques étapes rapides.
                        </p>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={labelStyle}>Nom de votre agence</label>
                            <div style={{
                                padding: '0.75rem 1rem',
                                background: '#f9fafb', border: '1px solid #e5e7eb',
                                borderRadius: '0.625rem',
                                color: '#374151', fontSize: '0.9375rem',
                                fontWeight: 500,
                            }}>
                                {/* We don't have tenantName in JWT by default, show a placeholder */}
                                Mon Agence
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: '0.375rem' }}>
                                Vous pourrez modifier ce nom dans les paramètres.
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" style={primaryBtnStyle}>
                                C'est parti ! <ArrowRight size={16} />
                            </button>
                        </div>
                    </form>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                    <form onSubmit={handleStep2}>
                        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem 0' }}>
                            Ajoutez votre premier client
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '0.9375rem', lineHeight: 1.6, margin: '0 0 1.75rem 0' }}>
                            Commencez à construire votre base de contacts. Vous pourrez en ajouter autant que vous voulez ensuite.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Prénom *</label>
                                <input
                                    value={actorFirstName}
                                    onChange={e => setActorFirstName(e.target.value)}
                                    required
                                    placeholder="Jean"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Nom *</label>
                                <input
                                    value={actorLastName}
                                    onChange={e => setActorLastName(e.target.value)}
                                    required
                                    placeholder="Dupont"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={labelStyle}>Email (optionnel)</label>
                            <input
                                type="email"
                                value={actorEmail}
                                onChange={e => setActorEmail(e.target.value)}
                                placeholder="jean.dupont@exemple.com"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button type="button" onClick={skipStep2} style={skipBtnStyle}>
                                Passer cette étape
                            </button>
                            <button type="submit" disabled={isSubmitting} style={primaryBtnStyle}>
                                {isSubmitting
                                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> En cours…</>
                                    : <>Ajouter le client <ArrowRight size={16} /></>
                                }
                            </button>
                        </div>
                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    </form>
                )}

                {/* ── STEP 3 ── */}
                {step === 3 && (
                    <form onSubmit={handleStep3}>
                        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem 0' }}>
                            Créez votre première opportunité
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '0.9375rem', lineHeight: 1.6, margin: '0 0 1.75rem 0' }}>
                            {createdActorId
                                ? `Associez un deal commercial à ${actorFirstName} ${actorLastName}.`
                                : "Décrivez votre première piste commerciale."
                            }
                        </p>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>Nom du deal *</label>
                            <input
                                value={dealName}
                                onChange={e => setDealName(e.target.value)}
                                required={!!createdActorId}
                                placeholder="Ex: Vente appartement T3, Mission SEO..."
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={labelStyle}>Montant estimé (€)</label>
                            <input
                                type="number"
                                value={dealAmount}
                                onChange={e => setDealAmount(e.target.value)}
                                placeholder="5 000"
                                min="0"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button type="button" onClick={finish} style={skipBtnStyle}>
                                Passer cette étape
                            </button>
                            <button type="submit" disabled={isSubmitting} style={primaryBtnStyle}>
                                {isSubmitting
                                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> En cours…</>
                                    : <>Terminer la configuration ✓</>
                                }
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Reassurance footer */}
            <p style={{ marginTop: '2rem', fontSize: '0.8125rem', color: '#9ca3af', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                Vous pouvez modifier toutes ces informations à tout moment depuis le CRM.
            </p>
        </div>
    );
};

// Shared styles
const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '0.375rem',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: '#111827',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
};

const primaryBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: '#4f46e5',
    border: 'none',
    borderRadius: '0.625rem',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.9375rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
    transition: 'transform 0.15s, box-shadow 0.15s',
};

const skipBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '0.875rem',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '0.5rem 0',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
};
