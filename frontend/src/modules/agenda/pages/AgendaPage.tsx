import React, { useEffect, useState } from 'react';
import { Calendar } from '../components/Calendar';
import { agendaService } from '../services/agenda.service';
import type { CalendarEvent } from '../services/agenda.service';

export const AgendaPage: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchEvents(); }, [currentDate]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
            const data = await agendaService.getAgenda(start, end);
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch agenda', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '1.5rem', background: '#f8fafc', height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexShrink: 0 }}>
                <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>Agenda</h1>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>Vue consolidée de vos rendez-vous et tâches.</p>
                </div>
                {loading && <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>Chargement...</span>}
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <Calendar
                    events={events}
                    currentDate={currentDate}
                    onNavigate={setCurrentDate}
                />
            </div>
        </div>
    );
};

