import React, { useEffect, useState } from 'react';
import { Calendar } from '../components/Calendar';
import { agendaService } from '../services/agenda.service';
import type { CalendarEvent } from '../services/agenda.service';

export const AgendaPage: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 0); // Last day of month

            const data = await agendaService.getAgenda(start, end);
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch agenda', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-200px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
                    <p className="text-gray-500">Vue consolidée de vos rendez-vous et tâches.</p>
                </div>
                {loading && <span className="text-sm text-gray-400">Chargement...</span>}
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-0 overflow-hidden">
                <Calendar
                    events={events}
                    currentDate={currentDate}
                    onNavigate={setCurrentDate}
                />
            </div>
        </div>
    );
};
