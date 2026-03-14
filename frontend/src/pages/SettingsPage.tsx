import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, Check, Building2, FileText, ImageIcon, Users, Trash2, Send, UserPlus } from 'lucide-react';
import { TenantService, type TenantProfile } from '../lib/tenant.service';
import { useAuth } from '../lib/auth.context';
import api from '../lib/api';

interface TeamMember {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const field = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: '100%',
    padding: '0.625rem 0.75rem',
    border: '1.5px solid #e5e7eb',
    borderRadius: '0.5rem',
    outline: 'none',
    fontSize: '0.875rem',
    color: '#111827',
    background: '#fff',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s',
    ...extra,
});

const focusField = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#4f46e5';
};
const blurField = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#e5e7eb';
};

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label style={{
        display: 'block',
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: '#374151',
        marginBottom: '0.375rem',
    }}>
        {children}
        {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
    </label>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '2rem' }}>
        <h3 style={{
            fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            margin: '0 0 1.25rem', paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6',
        }}>
            {title}
        </h3>
        {children}
    </div>
);

const TAX_RATES = [0, 5.5, 10, 20];

// ── Component ─────────────────────────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
    OWNER: 'Propriétaire', ADMIN: 'Administrateur',
    MANAGER: 'Manager', USER: 'Utilisateur', VIEWER: 'Lecteur',
};
const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    OWNER:   { bg: '#fdf4ff', color: '#7e22ce' },
    ADMIN:   { bg: '#eef2ff', color: '#4f46e5' },
    MANAGER: { bg: '#eff6ff', color: '#1d4ed8' },
    USER:    { bg: '#f0fdf4', color: '#166534' },
    VIEWER:  { bg: '#f9fafb', color: '#6b7280' },
};

const getCurrentUserRole = (): string | null => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1])).role ?? null;
    } catch { return null; }
};

const SettingsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'agency' | 'billing' | 'team'>('agency');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [logoHovered, setLogoHovered] = useState(false);

    // Agency fields
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [siret, setSiret] = useState('');
    const [vatNumber, setVatNumber] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('France');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    // Billing fields
    const [paymentTerms, setPaymentTerms] = useState('');
    const [quoteValidityDays, setQuoteValidityDays] = useState(30);
    const [defaultTaxRate, setDefaultTaxRate] = useState(20);

    // Team tab state
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [teamLoading, setTeamLoading] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('USER');
    const [inviting, setInviting] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState('');
    const [inviteError, setInviteError] = useState('');
    const [removingId, setRemovingId] = useState<string | null>(null);
    const currentUserRole = getCurrentUserRole();
    const canManageTeam = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

    useEffect(() => {
        if (activeTab === 'team') loadTeamMembers();
    }, [activeTab]);

    const loadTeamMembers = async () => {
        setTeamLoading(true);
        try {
            const res = await api.get('/iam/team/members');
            setTeamMembers(res.data);
        } catch (err) {
            console.error('Failed to load team members', err);
        } finally {
            setTeamLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteSuccess('');
        setInviteError('');
        setInviting(true);
        try {
            await api.post('/iam/team/invite', { email: inviteEmail, role: inviteRole });
            setInviteSuccess(`Invitation envoyée à ${inviteEmail}`);
            setInviteEmail('');
        } catch (err: any) {
            setInviteError(err.response?.data?.message ?? 'Erreur lors de l\'envoi.');
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveMember = async (memberId: string, memberEmail: string) => {
        if (!confirm(`Retirer ${memberEmail} de l'équipe ?`)) return;
        setRemovingId(memberId);
        try {
            await api.delete(`/iam/team/members/${memberId}`);
            setTeamMembers(prev => prev.filter(m => m.id !== memberId));
        } catch (err: any) {
            alert(err.response?.data?.message ?? 'Erreur lors de la suppression.');
        } finally {
            setRemovingId(null);
        }
    };

    const getInitials = (m: TeamMember) =>
        m.firstName && m.lastName
            ? `${m.firstName[0]}${m.lastName[0]}`.toUpperCase()
            : m.email[0].toUpperCase();

    useEffect(() => {
        TenantService.getProfile()
            .then(p => {
                setName(p.name ?? '');
                setCompanyName(p.companyName ?? '');
                setSiret(p.siret ?? '');
                setVatNumber(p.vatNumber ?? '');
                setAddress(p.address ?? '');
                setCity(p.city ?? '');
                setPostalCode(p.postalCode ?? '');
                setCountry(p.country ?? 'France');
                setPhone(p.phone ?? '');
                setEmail(p.email ?? '');
                setLogoUrl(p.logoUrl ?? '');
                setPaymentTerms(p.paymentTerms ?? '');
                setQuoteValidityDays(p.quoteValidityDays ?? 30);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('Logo trop volumineux. Maximum : 2 Mo.');
            return;
        }
        const reader = new FileReader();
        reader.onload = evt => setLogoUrl(evt.target?.result as string);
        reader.readAsDataURL(file);
        if (logoInputRef.current) logoInputRef.current.value = '';
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await TenantService.updateProfile({
                name,
                companyName,
                siret,
                vatNumber,
                address,
                city,
                postalCode,
                country,
                phone,
                email,
                logoUrl,
                paymentTerms,
                quoteValidityDays,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    const tabs: { key: 'agency' | 'billing' | 'team'; label: string; icon: React.ElementType }[] = [
        { key: 'agency', label: 'Mon Agence', icon: Building2 },
        { key: 'billing', label: 'Facturation', icon: FileText },
        { key: 'team', label: 'Équipe', icon: Users },
    ];

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '12rem', color: '#6b7280', fontSize: '0.875rem' }}>
            Chargement...
        </div>
    );

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem' }}>
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                        Paramètres
                    </h1>
                    <p style={{ margin: '0.375rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                        Configurez le profil de votre agence et les paramètres de facturation.
                    </p>
                </div>

                {/* ── Tabs ── */}
                <div style={{
                    display: 'flex',
                    gap: '0.25rem',
                    marginBottom: '1.5rem',
                    background: '#f1f5f9',
                    borderRadius: '0.625rem',
                    padding: '0.25rem',
                    width: 'fit-content',
                }}>
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    background: isActive ? '#fff' : 'transparent',
                                    color: isActive ? '#4f46e5' : '#6b7280',
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <tab.icon size={15} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Card ── */}
                <div style={{
                    background: '#fff',
                    borderRadius: '0.75rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    border: '1px solid #e5e7eb',
                    padding: '2rem',
                }}>

                    {/* ══ TAB: Mon Agence ══ */}
                    {activeTab === 'agency' && (
                        <>
                            <Section title="Logo de l'agence">
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                                    {/* Logo preview / upload zone */}
                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        onMouseEnter={() => setLogoHovered(true)}
                                        onMouseLeave={() => setLogoHovered(false)}
                                        style={{
                                            width: '100px', height: '80px', flexShrink: 0,
                                            border: `2px dashed ${logoHovered ? '#4f46e5' : '#d1d5db'}`,
                                            borderRadius: '0.625rem',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            background: logoHovered ? '#eef2ff' : '#f9fafb',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'border-color 0.15s, background 0.15s',
                                            position: 'relative',
                                        }}
                                        title="Cliquer pour changer le logo"
                                    >
                                        {logoUrl ? (
                                            <>
                                                <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                {logoHovered && (
                                                    <div style={{
                                                        position: 'absolute', inset: 0,
                                                        background: 'rgba(79,70,229,0.15)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <ImageIcon size={20} color="#4f46e5" />
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div style={{ textAlign: 'center', color: logoHovered ? '#4f46e5' : '#9ca3af' }}>
                                                <Upload size={20} />
                                                <div style={{ fontSize: '0.625rem', marginTop: '0.25rem', fontWeight: 600, letterSpacing: '0.04em' }}>LOGO</div>
                                            </div>
                                        )}
                                    </div>
                                    <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />

                                    <div>
                                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>
                                            Logo de votre agence
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.5 }}>
                                            Affiché sur vos devis et factures.<br />
                                            Format PNG ou SVG recommandé. Max 2 Mo.
                                        </p>
                                        {logoUrl && (
                                            <button
                                                onClick={() => setLogoUrl('')}
                                                style={{
                                                    marginTop: '0.625rem',
                                                    background: 'none', border: 'none',
                                                    color: '#ef4444', fontSize: '0.8125rem',
                                                    cursor: 'pointer', padding: 0, fontWeight: 500,
                                                }}
                                            >
                                                Supprimer le logo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Section>

                            <Section title="Identité de l'agence">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <Label required>Nom affiché</Label>
                                        <input
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            onFocus={focusField}
                                            onBlur={blurField}
                                            placeholder="Ex : Mon Agence"
                                            style={field()}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <Label>Raison sociale</Label>
                                        <input
                                            value={companyName}
                                            onChange={e => setCompanyName(e.target.value)}
                                            onFocus={focusField}
                                            onBlur={blurField}
                                            placeholder="Ex : Mon Agence SAS"
                                            style={field()}
                                        />
                                    </div>
                                    <div>
                                        <Label>SIRET</Label>
                                        <input
                                            value={siret}
                                            onChange={e => setSiret(e.target.value)}
                                            onFocus={focusField}
                                            onBlur={blurField}
                                            placeholder="123 456 789 00012"
                                            maxLength={17}
                                            style={field()}
                                        />
                                    </div>
                                    <div>
                                        <Label>N° TVA intracommunautaire</Label>
                                        <input
                                            value={vatNumber}
                                            onChange={e => setVatNumber(e.target.value)}
                                            onFocus={focusField}
                                            onBlur={blurField}
                                            placeholder="FR12345678901"
                                            style={field()}
                                        />
                                    </div>
                                </div>
                            </Section>

                            <Section title="Adresse">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <Label>Adresse</Label>
                                        <input
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                            onFocus={focusField}
                                            onBlur={blurField}
                                            placeholder="123 Rue de la Paix"
                                            style={field()}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <Label>Code postal</Label>
                                            <input
                                                value={postalCode}
                                                onChange={e => setPostalCode(e.target.value)}
                                                onFocus={focusField}
                                                onBlur={blurField}
                                                placeholder="75000"
                                                style={field()}
                                            />
                                        </div>
                                        <div>
                                            <Label>Ville</Label>
                                            <input
                                                value={city}
                                                onChange={e => setCity(e.target.value)}
                                                onFocus={focusField}
                                                onBlur={blurField}
                                                placeholder="Paris"
                                                style={field()}
                                            />
                                        </div>
                                        <div>
                                            <Label>Pays</Label>
                                            <input
                                                value={country}
                                                onChange={e => setCountry(e.target.value)}
                                                onFocus={focusField}
                                                onBlur={blurField}
                                                placeholder="France"
                                                style={field()}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            <Section title="Contact">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <Label>Téléphone</Label>
                                        <input
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            onFocus={focusField}
                                            onBlur={blurField}
                                            placeholder="+33 1 23 45 67 89"
                                            style={field()}
                                        />
                                    </div>
                                    <div>
                                        <Label>Email de contact</Label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            onFocus={focusField}
                                            onBlur={blurField}
                                            placeholder="contact@agence.fr"
                                            style={field()}
                                        />
                                    </div>
                                </div>
                            </Section>
                        </>
                    )}

                    {/* ══ TAB: Facturation ══ */}
                    {activeTab === 'billing' && (
                        <>
                            <Section title="TVA par défaut">
                                <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                    Taux appliqué automatiquement sur les nouveaux devis et factures.
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {TAX_RATES.map(rate => (
                                        <button
                                            key={rate}
                                            onClick={() => setDefaultTaxRate(rate)}
                                            style={{
                                                padding: '0.5rem 1.25rem',
                                                borderRadius: '9999px',
                                                border: '1.5px solid',
                                                borderColor: defaultTaxRate === rate ? '#4f46e5' : '#e5e7eb',
                                                background: defaultTaxRate === rate ? '#eef2ff' : '#fff',
                                                color: defaultTaxRate === rate ? '#4f46e5' : '#6b7280',
                                                fontSize: '0.9375rem',
                                                fontWeight: defaultTaxRate === rate ? 700 : 500,
                                                cursor: 'pointer',
                                                transition: 'all 0.12s',
                                            }}
                                        >
                                            {rate}%
                                        </button>
                                    ))}
                                </div>
                            </Section>

                            <Section title="Numérotation">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <Label>Préfixe factures</Label>
                                        <input
                                            placeholder="FA-"
                                            disabled
                                            style={field({ background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' })}
                                            title="Fonctionnalité à venir"
                                        />
                                        <p style={{ margin: '0.375rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>Prochainement disponible</p>
                                    </div>
                                    <div>
                                        <Label>Préfixe devis</Label>
                                        <input
                                            placeholder="QT-"
                                            disabled
                                            style={field({ background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' })}
                                            title="Fonctionnalité à venir"
                                        />
                                        <p style={{ margin: '0.375rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>Prochainement disponible</p>
                                    </div>
                                </div>
                            </Section>

                            <Section title="Validité des devis">
                                <div style={{ maxWidth: '200px' }}>
                                    <Label>Durée de validité (jours)</Label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={365}
                                        value={quoteValidityDays}
                                        onChange={e => setQuoteValidityDays(Number(e.target.value))}
                                        onFocus={focusField}
                                        onBlur={blurField}
                                        style={field()}
                                    />
                                    <p style={{ margin: '0.375rem 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                                        La date de validité sera automatiquement calculée à la création.
                                    </p>
                                </div>
                            </Section>

                            <Section title="Conditions de paiement">
                                <Label>Texte affiché sur vos documents</Label>
                                <textarea
                                    value={paymentTerms}
                                    onChange={e => setPaymentTerms(e.target.value)}
                                    onFocus={focusField}
                                    onBlur={blurField}
                                    placeholder="Ex : Paiement à 30 jours à compter de la date d'émission de la facture. En cas de retard, une pénalité de 3× le taux d'intérêt légal sera appliquée."
                                    rows={4}
                                    style={{
                                        ...field(),
                                        resize: 'vertical',
                                        lineHeight: 1.6,
                                        minHeight: '6rem',
                                    }}
                                />
                            </Section>
                        </>
                    )}

                    {/* ══ TAB: Équipe ══ */}
                    {activeTab === 'team' && (
                        <>
                            {/* Invite form — only for OWNER/ADMIN */}
                            {canManageTeam && (
                                <Section title="Inviter un membre">
                                    <form onSubmit={handleInvite}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.75rem', alignItems: 'flex-end' }}>
                                            <div>
                                                <Label required>Adresse email</Label>
                                                <input
                                                    type="email"
                                                    value={inviteEmail}
                                                    onChange={e => setInviteEmail(e.target.value)}
                                                    onFocus={focusField}
                                                    onBlur={blurField}
                                                    placeholder="colleague@exemple.com"
                                                    required
                                                    style={field()}
                                                />
                                            </div>
                                            <div>
                                                <Label>Rôle</Label>
                                                <select
                                                    value={inviteRole}
                                                    onChange={e => setInviteRole(e.target.value)}
                                                    style={{
                                                        padding: '0.625rem 0.75rem',
                                                        border: '1.5px solid #e5e7eb',
                                                        borderRadius: '0.5rem',
                                                        fontSize: '0.875rem',
                                                        color: '#111827',
                                                        background: '#fff',
                                                        outline: 'none',
                                                        cursor: 'pointer',
                                                        fontFamily: 'inherit',
                                                    }}
                                                >
                                                    <option value="ADMIN">Administrateur</option>
                                                    <option value="MANAGER">Manager</option>
                                                    <option value="USER">Utilisateur</option>
                                                    <option value="VIEWER">Lecteur</option>
                                                </select>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={inviting}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                    padding: '0.625rem 1.25rem',
                                                    background: inviting ? '#a5b4fc' : '#4f46e5',
                                                    color: '#fff', border: 'none',
                                                    borderRadius: '0.5rem', fontSize: '0.875rem',
                                                    fontWeight: 600, cursor: inviting ? 'not-allowed' : 'pointer',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                <Send size={14} />
                                                {inviting ? 'Envoi...' : 'Inviter'}
                                            </button>
                                        </div>

                                        {inviteSuccess && (
                                            <div style={{
                                                marginTop: '0.75rem', padding: '0.625rem 0.875rem',
                                                background: '#ecfdf5', border: '1px solid #a7f3d0',
                                                borderRadius: '0.5rem', color: '#047857',
                                                fontSize: '0.8125rem', fontWeight: 500,
                                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                            }}>
                                                <Check size={14} /> {inviteSuccess}
                                            </div>
                                        )}
                                        {inviteError && (
                                            <div style={{
                                                marginTop: '0.75rem', padding: '0.625rem 0.875rem',
                                                background: '#fef2f2', border: '1px solid #fecaca',
                                                borderRadius: '0.5rem', color: '#dc2626',
                                                fontSize: '0.8125rem',
                                            }}>
                                                {inviteError}
                                            </div>
                                        )}
                                    </form>
                                </Section>
                            )}

                            {/* Members list */}
                            <Section title={`Membres de l'équipe (${teamMembers.length})`}>
                                {teamLoading ? (
                                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Chargement...</p>
                                ) : teamMembers.length === 0 ? (
                                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Aucun membre trouvé.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {teamMembers.map(member => {
                                            const roleStyle = ROLE_COLORS[member.role] ?? ROLE_COLORS.USER;
                                            const isMe = member.id === user?.id;
                                            const isOwner = member.role === 'OWNER';
                                            const canRemove = canManageTeam && !isMe && !isOwner;
                                            const displayName = member.firstName && member.lastName
                                                ? `${member.firstName} ${member.lastName}`
                                                : member.email;

                                            return (
                                                <div key={member.id} style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                                                    padding: '0.75rem 1rem',
                                                    background: isMe ? '#fafafa' : '#fff',
                                                    border: '1px solid #f3f4f6',
                                                    borderRadius: '0.625rem',
                                                }}>
                                                    {/* Avatar */}
                                                    <div style={{
                                                        width: '2.25rem', height: '2.25rem', flexShrink: 0,
                                                        borderRadius: '50%',
                                                        background: isMe ? '#eef2ff' : '#f3f4f6',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.8125rem', fontWeight: 700,
                                                        color: isMe ? '#4f46e5' : '#6b7280',
                                                    }}>
                                                        {getInitials(member)}
                                                    </div>

                                                    {/* Info */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            fontSize: '0.875rem', fontWeight: 600, color: '#111827',
                                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                        }}>
                                                            {displayName}
                                                            {isMe && <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 400, marginLeft: '0.375rem' }}>(vous)</span>}
                                                        </div>
                                                        {(member.firstName || member.lastName) && (
                                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {member.email}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Role badge */}
                                                    <span style={{
                                                        padding: '0.25rem 0.625rem',
                                                        borderRadius: '9999px',
                                                        fontSize: '0.6875rem',
                                                        fontWeight: 600,
                                                        background: roleStyle.bg,
                                                        color: roleStyle.color,
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        {ROLE_LABELS[member.role] ?? member.role}
                                                    </span>

                                                    {/* Remove button */}
                                                    {canRemove && (
                                                        <button
                                                            onClick={() => handleRemoveMember(member.id, member.email)}
                                                            disabled={removingId === member.id}
                                                            title="Retirer de l'équipe"
                                                            style={{
                                                                padding: '0.375rem',
                                                                background: 'none',
                                                                border: '1px solid #fee2e2',
                                                                borderRadius: '0.375rem',
                                                                cursor: removingId === member.id ? 'not-allowed' : 'pointer',
                                                                color: '#dc2626',
                                                                display: 'flex', alignItems: 'center',
                                                                opacity: removingId === member.id ? 0.5 : 1,
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </Section>
                        </>
                    )}

                    {/* ── Save bar (agency & billing only) ── */}
                    {activeTab !== 'team' && <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '1rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #f3f4f6',
                        marginTop: '0.5rem',
                    }}>
                        {saved && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#059669', fontSize: '0.875rem', fontWeight: 600 }}>
                                <Check size={16} /> Sauvegardé
                            </div>
                        )}
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                padding: '0.625rem 1.25rem',
                                background: '#fff', color: '#6b7280',
                                border: '1px solid #e5e7eb', borderRadius: '0.5rem',
                                fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.625rem 1.5rem',
                                background: saving ? '#a5b4fc' : '#4f46e5',
                                color: '#fff',
                                border: 'none', borderRadius: '0.5rem',
                                fontSize: '0.875rem', fontWeight: 600,
                                cursor: saving ? 'not-allowed' : 'pointer',
                                boxShadow: saving ? 'none' : '0 2px 6px rgba(79,70,229,0.3)',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#4338ca'; }}
                            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#4f46e5'; }}
                        >
                            <Save size={15} />
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
