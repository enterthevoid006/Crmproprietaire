import React from 'react';
import { CalendarEventType } from '../services/agenda.service';
import type { CalendarEvent } from '../services/agenda.service';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
    events: CalendarEvent[];
    currentDate: Date;
    onNavigate: (date: Date) => void;
}

const EVENT_STYLES: Record<string, { bg: string; color: string; border: string }> = {
    TASK: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
    MEETING: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
    DEFAULT: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
};

export const Calendar: React.FC<CalendarProps> = ({ events, currentDate, onNavigate }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay() || 7;
    const today = new Date();

    const prevMonth = () => onNavigate(new Date(year, month - 1, 1));
    const nextMonth = () => onNavigate(new Date(year, month + 1, 1));
    const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(currentDate);

    const calendarDays = [];

    // Padding
    for (let i = 1; i < startDayOfWeek; i++) {
        calendarDays.push(
            <div key={`empty-${i}`} style={{ background: '#f9fafb', borderRight: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', minHeight: '120px' }} />
        );
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const isToday = date.toDateString() === today.toDateString();
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        const dayEvents = events.filter(e => {
            const ed = new Date(e.start);
            return ed.getDate() === d && ed.getMonth() === month && ed.getFullYear() === year;
        });

        calendarDays.push(
            <div key={d} style={{
                minHeight: '120px', background: isWeekend ? '#fafafa' : '#fff',
                borderRight: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6',
                padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
            }}>
                <span style={{
                    width: '1.625rem', height: '1.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', fontSize: '0.8125rem', fontWeight: isToday ? 700 : 500,
                    background: isToday ? '#4f46e5' : 'transparent',
                    color: isToday ? '#fff' : isWeekend ? '#9ca3af' : '#374151',
                    flexShrink: 0,
                }}>
                    {d}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', overflowY: 'auto', maxHeight: '80px' }}>
                    {dayEvents.map(event => {
                        const style = event.type === CalendarEventType.TASK ? EVENT_STYLES.TASK
                            : event.type === CalendarEventType.MEETING ? EVENT_STYLES.MEETING
                                : EVENT_STYLES.DEFAULT;
                        return (
                            <div key={event.id} title={event.title} style={{
                                fontSize: '0.6875rem', padding: '0.2rem 0.375rem',
                                borderRadius: '0.25rem', border: `1px solid ${style.border}`,
                                background: style.bg, color: style.color, fontWeight: 500,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                cursor: 'default',
                            }}>
                                {event.type === CalendarEventType.TASK ? '✓ ' : '● '}{event.title}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', background: '#fff' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0, textTransform: 'capitalize' }}>{monthName}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button onClick={prevMonth} style={{ padding: '0.375rem', background: 'none', border: '1px solid #e5e7eb', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#374151' }}>
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => onNavigate(new Date())} style={{ padding: '0.375rem 0.75rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', color: '#374151' }}>
                        Aujourd'hui
                    </button>
                    <button onClick={nextMonth} style={{ padding: '0.375rem', background: 'none', border: '1px solid #e5e7eb', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#374151' }}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f3f4f6' }}>
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
                        <div key={day} style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.6875rem', fontWeight: 700, color: i >= 5 ? '#9ca3af' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#f9fafb' }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar cells */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1, borderTop: '1px solid #f3f4f6', borderLeft: '1px solid #f3f4f6', overflowY: 'auto' }}>
                    {calendarDays}
                </div>
            </div>
        </div>
    );
};
