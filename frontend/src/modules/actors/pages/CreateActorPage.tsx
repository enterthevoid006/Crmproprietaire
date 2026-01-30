import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActorService, ActorType } from '../services/actor.service';
import { ArrowLeft, Save, Building2, User, MapPin, Tag, Globe } from 'lucide-react';

export const CreateActorPage = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<{
        type: ActorType;
        firstName: string;
        lastName: string;
        companyName: string;
        email: string;
        phone: string;
        address: string;
        source: string;
        tags: string;
    }>({
        type: ActorType.INDIVIDUAL,
        firstName: '',
        lastName: '',
        companyName: '',
        email: '',
        phone: '',
        address: '',
        source: '',
        tags: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await ActorService.create({
                type: formData.type,
                // Only send relevant fields
                ...(formData.type === ActorType.INDIVIDUAL ? {
                    firstName: formData.firstName,
                    lastName: formData.lastName
                } : {
                    companyName: formData.companyName
                }),
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                source: formData.source,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
            });
            navigate('/actors');
        } catch (err) {
            setError('Failed to create actor. Please check your inputs.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button
                onClick={() => navigate('/actors')}
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
                <ArrowLeft size={20} /> Retour
            </button>

            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 700, color: 'hsl(var(--text-1))' }}>Nouveau Client / Prospect</h1>

            {error && (
                <div style={{
                    padding: '1rem',
                    background: 'hsl(var(--danger) / 0.1)',
                    color: 'hsl(var(--danger))',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '2rem'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>

                {/* Type Selection */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={labelStyle}>Type de compte</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <TypeCard
                            active={formData.type === ActorType.INDIVIDUAL}
                            onClick={() => setFormData(prev => ({ ...prev, type: ActorType.INDIVIDUAL }))}
                            icon={User}
                            label="Particulier"
                        />
                        <TypeCard
                            active={formData.type === ActorType.CORPORATE}
                            onClick={() => setFormData(prev => ({ ...prev, type: ActorType.CORPORATE }))}
                            icon={Building2}
                            label="Entreprise"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {formData.type === ActorType.INDIVIDUAL ? (
                        <>
                            <div>
                                <label style={labelStyle}>Prénom *</label>
                                <input
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                    placeholder="Jean"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Nom *</label>
                                <input
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                    placeholder="Dupont"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="col-span-2">
                            <label style={labelStyle}>Nom de l'entreprise *</label>
                            <input
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                placeholder="Acme Inc."
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label style={labelStyle}>Email</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="contact@exemple.com"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Téléphone</label>
                        <input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="+33 6 12 34 56 78"
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>
                        <div className="flex items-center gap-2">
                            <MapPin size={14} /> Adresse
                        </div>
                    </label>
                    <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="123 Rue de la République, 75001 Paris"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label style={labelStyle}>
                            <div className="flex items-center gap-2">
                                <Globe size={14} /> Source (Provenance)
                            </div>
                        </label>
                        <input
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="Ex: Site Web, Recommandation..."
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>
                            <div className="flex items-center gap-2">
                                <Tag size={14} /> Tags
                            </div>
                        </label>
                        <input
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="VIP, Prospect, A relancer (séparés par virgule)"
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-1)' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/actors')}
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
                            opacity: isSubmitting ? 0.7 : 1,
                            boxShadow: 'var(--shadow-md)'
                        }}
                    >
                        <Save size={18} />
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer le Client'}
                    </button>
                </div>

            </form>
        </div>
    );
};

const TypeCard = ({ active, onClick, icon: Icon, label }: any) => (
    <div
        onClick={onClick}
        style={{
            flex: 1,
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: `2px solid ${active ? 'var(--color-primary)' : 'var(--border-2)'}`,
            background: active ? 'hsla(var(--primary-hue), var(--primary-sat), 96%)' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            color: active ? 'var(--color-primary)' : 'hsl(var(--text-2))'
        }}
    >
        <Icon size={32} />
        <span style={{ fontWeight: 600 }}>{label}</span>
    </div>
);

const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
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
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
};
