import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.context';
import { TaskService, type Task } from '../modules/tasks/services/task.service';
import { OpportunityService, type Opportunity } from '../modules/opportunities/services/opportunity.service';
import { ActorService, type Actor } from '../modules/actors/services/actor.service';
import { InvoiceService, type Invoice } from '../modules/finance/services/invoice.service';
import {
    Users, FolderOpen, CheckSquare, Euro, Plus,
    TrendingUp, Clock, AlertCircle, ArrowRight, Calendar
} from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [actors, setActors] = useState<Actor[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            TaskService.getAll(),
            OpportunityService.getAll(),
            ActorService.getAll(),
            InvoiceService.getAll({}),
        ]).then(([t, o, a, i]) => {
            setTasks(t);
            setOpportunities(o);
            setActors(a);
            setInvoices(i);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const firstName = user?.email?.split('@')[0] || 'vous';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

    // KPIs
    const tasksTodo = tasks.filter(t => t.status !== 'DONE');
    const tasksOverdue = tasks.filter(t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < new Date());
    const pipelineTotal = opportunities.filter(o => !['WON', 'LOST'].includes(o.stage)).reduce((s, o) => s + (o.amount || 0), 0);
    const wonTotal = opportunities.filter(o => o.stage === 'WON').reduce((s, o) => s + (o.amount || 0), 0);
    const pendingInvoices = invoices.filter(i => i.status === 'SENT').reduce((s, i) => s + i.total, 0);
    const recentActors = [...actors].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);
    const urgentTasks = tasks.filter(t => t.status !== 'DONE' && t.priority === 'HIGH').slice(0, 4);
    const recentOpps = [...opportunities].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 4);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Chargement...</span>
        </div>
    );

    return (
        <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>

            {/* Header */}
            <div style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                    {greeting}, {firstName} 👋
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <KpiCard icon={Users} label="Clients" value={String(actors.length)} sub="contacts actifs" color="#4f46e5" bg="#eef2ff" onClick={() => navigate('/actors')} />
                <KpiCard icon={TrendingUp} label="Pipeline" value={fmt(pipelineTotal)} sub="en cours" color="#0891b2" bg="#ecfeff" onClick={() => navigate('/opportunities')} />
                <KpiCard icon={CheckSquare} label="Tâches" value={String(tasksTodo.length)} sub={tasksOverdue.length > 0 ? `${tasksOverdue.length} en retard` : 'à faire'} color={tasksOverdue.length > 0 ? '#dc2626' : '#047857'} bg={tasksOverdue.length > 0 ? '#fef2f2' : '#ecfdf5'} onClick={() => navigate('/tasks')} />
                <KpiCard icon={Euro} label="En attente" value={fmt(pendingInvoices)} sub="factures envoyées" color="#b45309" bg="#fffbeb" onClick={() => navigate('/finance/invoices')} />
            </div>

            {/* Quick Actions */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.875rem 0' }}>Actions rapides</p>
                <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                    {[
                        { label: '+ Nouveau client', path: '/actors/new', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
                        { label: '+ Opportunité', path: '/opportunities/new', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
                        { label: '+ Tâche', path: '/tasks', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
                        { label: '+ Facture', path: '/finance/invoices/new', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
                        { label: '+ Devis', path: '/finance/quotes/new', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
                    ].map(a => (
                        <button key={a.path} onClick={() => navigate(a.path)}
                            style={{ padding: '0.5rem 1rem', background: a.bg, color: a.color, border: `1px solid ${a.border}`, borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                            {a.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

                {/* Urgent Tasks */}
                <SectionCard title="Tâches prioritaires" icon={AlertCircle} iconColor="#dc2626" onSeeAll={() => navigate('/tasks')}>
                    {urgentTasks.length === 0 ? (
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center', padding: '1.5rem 0' }}>Aucune tâche haute priorité 🎉</p>
                    ) : urgentTasks.map(task => (
                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderBottom: '1px solid #f9fafb' }}>
                            <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                                {task.dueDate && (
                                    <p style={{ fontSize: '0.75rem', color: new Date(task.dueDate) < new Date() ? '#dc2626' : '#6b7280', margin: '0.125rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Calendar size={10} /> {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                                        {new Date(task.dueDate) < new Date() && ' · En retard'}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </SectionCard>

                {/* Recent Opportunities */}
                <SectionCard title="Opportunités récentes" icon={FolderOpen} iconColor="#4f46e5" onSeeAll={() => navigate('/opportunities')}>
                    {recentOpps.length === 0 ? (
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center', padding: '1.5rem 0' }}>Aucune opportunité</p>
                    ) : recentOpps.map(opp => (
                        <div key={opp.id} onClick={() => navigate(`/opportunities/${opp.id}`)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opp.name}</p>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.125rem 0 0 0' }}>{opp.actor?.companyName || 'Sans client'}</p>
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', flexShrink: 0, marginLeft: '1rem' }}>{fmt(opp.amount || 0)}</span>
                        </div>
                    ))}
                </SectionCard>

                {/* Recent Clients */}
                <SectionCard title="Clients récents" icon={Users} iconColor="#047857" onSeeAll={() => navigate('/actors')}>
                    {recentActors.length === 0 ? (
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center', padding: '1.5rem 0' }}>Aucun client</p>
                    ) : recentActors.map(actor => {
                        const name = actor.companyName || `${actor.firstName} ${actor.lastName}`;
                        const initials = (actor.companyName?.[0] || actor.firstName?.[0] || '?').toUpperCase();
                        return (
                            <div key={actor.id} onClick={() => navigate(`/actors/${actor.id}`)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}>
                                <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                                    {initials}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.125rem 0 0 0' }}>{actor.email}</p>
                                </div>
                            </div>
                        );
                    })}
                </SectionCard>

                {/* Pipeline Summary */}
                <SectionCard title="Résumé pipeline" icon={TrendingUp} iconColor="#0891b2" onSeeAll={() => navigate('/opportunities')}>
                    {[
                        { label: 'Nouvelle', id: 'NEW', color: '#3b82f6' },
                        { label: 'Qualifiée', id: 'QUALIFIED', color: '#6366f1' },
                        { label: 'Proposition', id: 'PROPOSAL', color: '#8b5cf6' },
                        { label: 'Négociation', id: 'NEGOTIATION', color: '#f59e0b' },
                        { label: 'Gagnée', id: 'WON', color: '#10b981' },
                    ].map(stage => {
                        const count = opportunities.filter(o => o.stage === stage.id).length;
                        const amount = opportunities.filter(o => o.stage === stage.id).reduce((s, o) => s + (o.amount || 0), 0);
                        return (
                            <div key={stage.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f9fafb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: stage.color }} />
                                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>{stage.label}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', background: '#f3f4f6', padding: '0.1rem 0.4rem', borderRadius: '9999px' }}>{count}</span>
                                </div>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>{fmt(amount)}</span>
                            </div>
                        );
                    })}
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>Total gagné</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10b981' }}>{fmt(wonTotal)}</span>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
};

const KpiCard = ({ icon: Icon, label, value, sub, color, bg, onClick }: any) => (
    <div onClick={onClick} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
    >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
            <div style={{ width: '2rem', height: '2rem', background: bg, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} color={color} />
            </div>
        </div>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem 0', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '0.75rem', color, margin: 0, fontWeight: 500 }}>{sub}</p>
    </div>
);

const SectionCard = ({ title, icon: Icon, iconColor, onSeeAll, children }: any) => (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon size={15} color={iconColor} />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>{title}</span>
            </div>
            <button onClick={onSeeAll} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
                Voir tout <ArrowRight size={12} />
            </button>
        </div>
        {children}
    </div>
);
