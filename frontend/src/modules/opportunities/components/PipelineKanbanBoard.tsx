import { useState } from 'react';
import type { Opportunity } from '../services/opportunity.service';
import { KanbanColumn, KanbanCard, KanbanEmptyState, KanbanSkeleton } from './KanbanComponents';

const STAGES = [
    { id: 'NEW', label: 'Nouvelle', color: '#3b82f6', bg: '#eff6ff' },
    { id: 'QUALIFIED', label: 'Qualifiée', color: '#6366f1', bg: '#eef2ff' },
    { id: 'PROPOSAL', label: 'Proposition', color: '#8b5cf6', bg: '#f5f3ff' },
    { id: 'NEGOTIATION', label: 'Négociation', color: '#f59e0b', bg: '#fffbeb' },
    { id: 'WON', label: 'Gagnée', color: '#10b981', bg: '#ecfdf5' },
    { id: 'LOST', label: 'Perdue', color: '#ef4444', bg: '#fef2f2' },
] as const;

interface PipelineKanbanBoardProps {
    opportunities: Opportunity[];
    isLoading: boolean;
    onStatusChange: (id: string, newStage: string) => void;
}

export const PipelineKanbanBoard = ({ opportunities, isLoading, onStatusChange }: PipelineKanbanBoardProps) => {
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [targetColumnId, setTargetColumnId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.effectAllowed = 'move';
        setDraggedItemId(id);
    };

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (targetColumnId !== columnId) setTargetColumnId(columnId);
    };

    const handleDrop = (e: React.DragEvent, targetStageId: string) => {
        e.preventDefault();
        setTargetColumnId(null);
        if (draggedItemId) {
            onStatusChange(draggedItemId, targetStageId);
            setDraggedItemId(null);
        }
    };

    const columns = STAGES.map(stage => ({
        ...stage,
        items: opportunities.filter(op => op.stage === stage.id),
    }));

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

    if (isLoading) return <KanbanSkeleton />;

    return (
        <div style={{
            display: 'flex',
            gap: '1rem',
            height: '100%',
            overflowX: 'auto',
            overflowY: 'hidden',
            paddingBottom: '1rem',
            alignItems: 'flex-start',
        }}>
            {columns.map(column => (
                <div
                    key={column.id}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDrop={(e) => handleDrop(e, column.id)}
                    style={{ height: '100%', flexShrink: 0, width: '280px' }}
                >
                    <KanbanColumn
                        id={column.id}
                        label={column.label}
                        color={column.color}
                        bg={column.bg}
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
