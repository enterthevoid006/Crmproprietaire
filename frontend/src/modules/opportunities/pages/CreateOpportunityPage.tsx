import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { OpportunityService } from '../services/opportunity.service';
import { ActorService, type Actor } from '../../actors/services/actor.service';
import { ArrowLeft, Save } from 'lucide-react';

export const CreateOpportunityPage = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actors, setActors] = useState<Actor[]>([]);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        actorId: '',
        amount: '',
        stage: 'NEW',
        closeDate: ''
    });

    useEffect(() => {
        ActorService.getAll()
            .then(data => setActors(data))
            .catch(err => console.error('Failed to load actors', err));
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.actorId) {
            setError('Veuillez sélectionner un client.');
            return;
        }

        setIsSubmitting(true);

        try {
            await OpportunityService.create({
                name: formData.name,
                actorId: formData.actorId,
                amount: formData.amount ? Number(formData.amount) : 0,
                stage: formData.stage as any,
                closeDate: formData.closeDate ? new Date(formData.closeDate).toISOString() : undefined,
            });
            navigate('/opportunities');
        } catch (err) {
            setError('Impossible de créer l\'opportunité.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <button
                onClick={() => navigate('/opportunities')}
                style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'hsl(var(--text-3))',
                    cursor: 'pointer',
                    marginBottom: '1.5rem',
                    padding: 0
                }}
            >
                <ArrowLeft size={20} /> Retour au Pipeline
            </button>

            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Nouvelle Opportunité</h1>

            {error && <div style={{ marginBottom: '1rem', color: 'hsl(var(--danger))' }}>{error}</div>}

            <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>Nom du deal</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Ex: Projet Refonte Site Web"
                        style={inputStyle}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>Client / Prospect</label>
                    <select name="actorId" value={formData.actorId} onChange={handleChange} required style={inputStyle}>
                        <option value="">-- Sélectionner --</option>
                        {actors.map(actor => (
                            <option key={actor.id} value={actor.id}>
                                {actor.companyName || `${actor.firstName} ${actor.lastName}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>Montant Estimé (€)</label>
                        <input
                            name="amount"
                            type="number"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="5000"
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Étape</label>
                        <select name="stage" value={formData.stage} onChange={handleChange} style={inputStyle}>
                            <option value="NEW">Nouvelle</option>
                            <option value="QUALIFIED">Qualifiée</option>
                            <option value="PROPOSAL">Proposition envoyée</option>
                            <option value="NEGOTIATION">Négociation</option>
                            <option value="WON">Gagnée</option>
                            <option value="LOST">Perdue</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={labelStyle}>Date de clôture prévue</label>
                    <input
                        name="closeDate"
                        type="date"
                        value={formData.closeDate}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/opportunities')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-2)',
                            background: 'transparent',
                            color: 'hsl(var(--text-2))',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            background: 'var(--color-primary)',
                            color: 'var(--color-on-primary)',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            opacity: isSubmitting ? 0.7 : 1
                        }}
                    >
                        <Save size={18} />
                        Créer
                    </button>
                </div>
            </form>
        </div>
    );
};

const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'hsl(var(--text-2))',
    marginBottom: '0.5rem'
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-2)',
    background: 'hsl(var(--surface-2))',
    color: 'hsl(var(--text-1))',
    fontSize: '1rem'
};
