import { useState } from 'react';
import type { Opportunity } from '../services/opportunity.service';
import { KanbanColumn, KanbanCard, KanbanEmptyState, KanbanSkeleton } from './KanbanComponents';

const STAGES = [
    { id: 'NEW', label: 'Nouvelle', color: 'bg-blue-50 text-blue-500 border-blue-200' },
    { id: 'QUALIFIED', label: 'Qualifiée', color: 'bg-indigo-50 text-indigo-500 border-indigo-200' },
    { id: 'PROPOSAL', label: 'Proposition', color: 'bg-purple-50 text-purple-500 border-purple-200' },
    { id: 'NEGOTIATION', label: 'Négociation', color: 'bg-amber-50 text-amber-500 border-amber-200' },
    { id: 'WON', label: 'Gagnée', color: 'bg-emerald-50 text-emerald-500 border-emerald-200' },
    { id: 'LOST', label: 'Perdue', color: 'bg-red-50 text-red-500 border-red-200' }
] as const;

interface PipelineKanbanBoardProps {
    opportunities: Opportunity[];
    isLoading: boolean;
    onStatusChange: (id: string, newStage: string) => void;
}

export const PipelineKanbanBoard = ({ opportunities, isLoading, onStatusChange }: PipelineKanbanBoardProps) => {
    console.log('[DEBUG] Kanban render. Opportunities:', opportunities.length);
    if (opportunities.length > 0) {
        console.log('[DEBUG] First Opp Stage:', opportunities[0].stage);
    }
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [targetColumnId, setTargetColumnId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.effectAllowed = 'move';
        setDraggedItemId(id);
    };

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (targetColumnId !== columnId) {
            setTargetColumnId(columnId);
        }
    };

    const handleDrop = (e: React.DragEvent, targetStageId: string) => {
        e.preventDefault();
        setTargetColumnId(null);
        if (draggedItemId) {
            onStatusChange(draggedItemId, targetStageId);
            setDraggedItemId(null);
        }
    };

    // Group opportunities by stage
    const columns = STAGES.map(stage => {
        return {
            ...stage,
            items: opportunities.filter(op => op.stage === stage.id)
        };
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
    };

    if (isLoading) {
        return <KanbanSkeleton />;
    }

    return (
        <div className="flex w-full pb-8 gap-4 h-full items-start px-2">
            {columns.map(column => (
                <div
                    key={column.id}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDrop={(e) => handleDrop(e, column.id)}
                    className="h-full"
                >
                    <KanbanColumn
                        id={column.id}
                        label={column.label}
                        color={column.color}
                        count={column.items.length}
                        totalAmount={column.items.reduce((sum, item) => sum + (item.amount || 0), 0)}
                        isOver={targetColumnId === column.id}
                        formatCurrency={formatCurrency}
                    >
                        {column.items.length === 0 ? (
                            <KanbanEmptyState />
                        ) : (
                            column.items.map(card => (
                                <KanbanCard
                                    key={card.id}
                                    opportunity={card}
                                    formatCurrency={formatCurrency}
                                    onDragStart={handleDragStart}
                                />
                            ))
                        )}
                    </KanbanColumn>
                </div>
            ))}
        </div>
    );
};
