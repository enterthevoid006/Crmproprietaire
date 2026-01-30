import { useState } from 'react';
import { X, FileText, Check } from 'lucide-react';
import { InteractionService } from '../../interactions/services/interaction.service';

interface CreateNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    actorId: string;
    onSuccess: () => void;
}

export const CreateNoteModal = ({ isOpen, onClose, actorId, onSuccess }: CreateNoteModalProps) => {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await InteractionService.create({
                summary: 'Note rapide', // Auto-summary for notes
                details: note,
                type: 'NOTE',
                actorId,
                date: new Date().toISOString()
            });
            setNote('');
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to create note', err);
            alert('Erreur lors de la création de la note');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-yellow-50">
                    <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
                        <FileText size={18} className="text-yellow-600" />
                        Nouvelle Note
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contenu de la note</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm min-h-[150px] resize-none"
                            placeholder="Écrivez votre note ici..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors shadow-sm disabled:opacity-50"
                        >
                            {loading ? 'Enregistrement...' : <> <Check size={16} /> Enregistrer la note</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
