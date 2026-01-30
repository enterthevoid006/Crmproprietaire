import React from 'react';
import { CalendarEventType } from '../services/agenda.service';
import type { CalendarEvent } from '../services/agenda.service';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
    events: CalendarEvent[];
    currentDate: Date;
    onNavigate: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, currentDate, onNavigate }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay() || 7; // 1 (Mon) - 7 (Sun)

    // Generate grid days
    const calendarDays = [];

    // Previous month padding
    for (let i = 1; i < startDayOfWeek; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="bg-gray-50 border border-gray-100"></div>);
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dayEvents = events.filter(e => {
            const eventDate = new Date(e.start);
            return eventDate.getDate() === d &&
                eventDate.getMonth() === month &&
                eventDate.getFullYear() === year;
        });

        calendarDays.push(
            <div key={d} className="min-h-[120px] bg-white border border-gray-100 p-2 flex flex-col gap-1 hover:bg-gray-50 transition-colors">
                <span className={`text-sm font-medium ${date.toDateString() === new Date().toDateString()
                    ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full'
                    : 'text-gray-700'
                    }`}>
                    {d}
                </span>
                <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[90px]">
                    {dayEvents.map(event => (
                        <div
                            key={event.id}
                            className={`text-xs p-1 rounded border truncate ${event.type === CalendarEventType.TASK ? 'bg-green-50 text-green-700 border-green-100' :
                                event.type === CalendarEventType.MEETING ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                    'bg-blue-50 text-blue-700 border-blue-100'
                                }`}
                            title={event.title}
                        >
                            {event.type === CalendarEventType.TASK && '✓ '}
                            {event.title}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const prevMonth = () => onNavigate(new Date(year, month - 1, 1));
    const nextMonth = () => onNavigate(new Date(year, month + 1, 1));

    const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(currentDate);

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold capitalize text-gray-800">{monthName}</h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => onNavigate(new Date())} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md font-medium">
                        Aujourd'hui
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden flex-1 shadow-sm">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
                {calendarDays}
            </div>
        </div>
    );
};
