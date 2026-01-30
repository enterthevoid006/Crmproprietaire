import { MoreHorizontal, Calendar, DollarSign, Loader2, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Opportunity } from '../services/opportunity.service';

// --- Kanban Column ---

interface KanbanColumnProps {
    id: string;
    label: string;
    color: string;
    count: number;
    totalAmount: number;
    children: React.ReactNode;
    isOver: boolean;
    formatCurrency: (amount: number) => string;
}

export const KanbanColumn = ({
    label,
    color,
    count,
    totalAmount,
    children,
    isOver,
    formatCurrency
}: KanbanColumnProps) => {
    // Extract base color (e.g. bg-indigo-50 -> indigo)
    const colorTheme = color.split(' ')[1].replace('text-', '').replace('-700', '').replace('-500', '');

    return (
        <div
            className={`
                flex-1 min-w-[200px] flex flex-col h-full rounded-3xl 
                transition-all duration-300
                group/column
                border border-white/40
                shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]
                ${isOver ? 'bg-indigo-50/80 border-indigo-300 ring-4 ring-indigo-100' : 'bg-white/40 hover:bg-white/60'}
                backdrop-blur-xl
            `}
        >
            {/* Sticky Header with Strong Glass Effect */}
            <div className="px-5 py-5 flex justify-between items-center rounded-t-3xl sticky top-0 z-10 bg-white/50 backdrop-blur-xl border-b border-white/50 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className={`relative flex items-center justify-center w-7 h-7 rounded-full bg-white shadow-sm border border-${colorTheme}-100`}>
                        <div className={`w-3 h-3 rounded-full bg-${colorTheme}-500 shadow-[0_0_10px_rgba(var(--${colorTheme}-500),0.5)]`}></div>
                    </div>
                    <span className="font-extrabold text-slate-800 tracking-tight text-[1rem]">{label}</span>
                    <span className="bg-slate-100 text-slate-600 text-[12px] px-2.5 py-1 rounded-full font-bold shadow-inner">
                        {count}
                    </span>
                </div>
                {totalAmount > 0 && (
                    <span className="text-sm font-bold text-slate-600 font-mono tracking-tight bg-white/80 px-2.5 py-1.5 rounded-md shadow-sm border border-slate-100">
                        {formatCurrency(totalAmount)}
                    </span>
                )}
            </div>

            {/* Content Area */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                {children}
            </div>
        </div>
    );
};


// --- Kanban Card ---

interface KanbanCardProps {
    opportunity: Opportunity;
    formatCurrency: (amount: number) => string;
    onDragStart: (e: React.DragEvent, id: string) => void;
}

export const KanbanCard = ({ opportunity, formatCurrency, onDragStart }: KanbanCardProps) => {
    const navigate = useNavigate();
    const isOverdue = opportunity.expectedCloseDate && new Date(opportunity.expectedCloseDate) < new Date();

    return (
        <div
            onClick={() => navigate(`/opportunities/${opportunity.id}`)}
            className="group relative bg-white p-6 rounded-2xl border border-white shadow-[0_4px_12px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12),0_4px_12px_-4px_rgba(0,0,0,0.06)] hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer active:cursor-grabbing active:scale-[0.98] active:shadow-md"
            draggable
            onDragStart={(e) => onDragStart(e, opportunity.id)}
        >
            {/* Top Row: Client Info */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2.5 max-w-[85%] text-slate-500 group-hover:text-indigo-600 transition-colors">
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                        <Building2 size={14} strokeWidth={2.5} className="group-hover:text-indigo-600" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider truncate text-slate-400 group-hover:text-indigo-500/80">
                        {opportunity.actor?.companyName || `${opportunity.actor?.firstName} ${opportunity.actor?.lastName}` || 'Sans nom'}
                    </span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-all p-2 hover:bg-indigo-50 rounded-lg -mr-2 -mt-2">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Main Title */}
            <h4 className="font-bold text-slate-900 mb-6 leading-snug text-lg group-hover:text-indigo-700 transition-colors">
                {opportunity.name}
            </h4>

            {/* Metrics Row */}
            <div className="flex items-center justify-between mt-auto">
                {/* Amount Badge */}
                <div className="flex items-center gap-2.5 font-bold text-slate-800 text-[15px]">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700 shadow-sm border border-emerald-200/50">
                        <DollarSign size={16} strokeWidth={3} />
                    </div>
                    {formatCurrency(opportunity.amount)}
                </div>

                {/* Date */}
                {opportunity.expectedCloseDate && (
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${isOverdue ? 'text-red-700 bg-red-50 border-red-100' : 'text-slate-500 bg-slate-50 border-slate-100 group-hover:bg-white group-hover:border-slate-200'}`}>
                        <Calendar size={14} strokeWidth={2.5} />
                        {new Date(opportunity.expectedCloseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                )}
            </div>

            {/* Probability (Subtle line at bottom) */}
            {opportunity.probability !== undefined && (
                <div className="mt-5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${opportunity.probability >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                            opportunity.probability >= 50 ? 'bg-gradient-to-r from-indigo-400 to-indigo-500' :
                                'bg-amber-400'
                            }`}
                        style={{ width: `${opportunity.probability}%` }}
                    />
                </div>
            )}
        </div>
    );
};

// --- Kanban Empty State ---

export const KanbanEmptyState = () => (
    <div className="h-[280px] border-2 border-dashed border-slate-200/60 rounded-3xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/20 hover:bg-white/40 hover:border-indigo-300 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
        <div className="w-20 h-20 mb-5 rounded-full bg-gradient-to-tr from-white to-slate-50 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.08)] border border-white flex items-center justify-center group-hover:shadow-[0_12px_24px_-8px_rgba(79,70,229,0.2)] group-hover:border-indigo-100 transition-all duration-500">
            <div className="w-10 h-10 border-2 border-slate-200 border-dashed rounded-xl group-hover:border-indigo-500 group-hover:rotate-12 transition-all duration-500 flex items-center justify-center">
                <div className="w-1 h-3 bg-slate-200 group-hover:bg-indigo-500 rounded-full transition-colors"></div>
                <div className="w-3 h-1 bg-slate-200 group-hover:bg-indigo-500 rounded-full absolute transition-colors"></div>
            </div>
        </div>
        <span className="text-sm font-bold text-slate-700 mb-1 group-hover:text-indigo-700 transition-colors">Cette étape est vide</span>
        <span className="text-xs text-slate-400 font-medium tracking-wide">Glissez une carte ici pour commencer</span>
    </div>
);

// --- Kanban Skeleton (Loading) ---

export const KanbanSkeleton = () => (
    <div className="flex gap-6 h-full overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[320px] h-full rounded-2xl bg-slate-50/50 border border-slate-100 p-4 space-y-4">
                <div className="h-8 bg-slate-200/50 rounded-lg w-1/2 animate-pulse mb-8" />
                <div className="h-32 bg-white rounded-xl border border-slate-100 shadow-sm animate-pulse" />
                <div className="h-32 bg-white rounded-xl border border-slate-100 shadow-sm animate-pulse opacity-60" />
                <div className="h-32 bg-white rounded-xl border border-slate-100 shadow-sm animate-pulse opacity-30" />
            </div>
        ))}
    </div>
);
