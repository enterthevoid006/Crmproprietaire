import { useRef, useState, useEffect } from 'react';
import { DocumentService } from '../services/document.service';
import type { Document } from '../services/document.service';
import { FileText, Upload, File as FileIcon, Download, Trash2 } from 'lucide-react';

interface DocumentListProps {
    actorId?: string;
    opportunityId?: string;
}

export const DocumentList = ({ actorId, opportunityId }: DocumentListProps) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadDocuments();
    }, [actorId, opportunityId]);

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const data = await DocumentService.getAll({ actorId, opportunityId });
            setDocuments(data);
        } catch (error) {
            console.error('Failed to load documents', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        try {
            await DocumentService.upload(file, { actorId, opportunityId });
            loadDocuments(); // Refresh list
        } catch (error) {
            console.error('Upload failed', error);
            alert('Erreur lors de l\'upload du fichier.');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const handleDownload = (doc: Document) => {
        // Since we are using ServeStaticModule, we can point to /uploads/filename
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${doc.path}`;
        window.open(url, '_blank');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce document ?')) return;
        try {
            await DocumentService.delete(id);
            loadDocuments();
        } catch (error) {
            console.error('Failed to delete document', error);
        }
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (!+bytes) return '0 o';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['o', 'Ko', 'Mo', 'Go', 'To'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FileText size={18} />
                    Documents
                </h3>
                <button
                    onClick={triggerUpload}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                >
                    <Upload size={16} />
                    Ajouter
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>

            <div className="divide-y divide-gray-100">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-400">Chargement...</div>
                ) : documents.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        Aucun document associé.
                    </div>
                ) : (
                    documents.map((doc) => (
                        <div key={doc.id} className="p-3 hover:bg-gray-50 flex items-center justify-between group transition">
                            <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => handleDownload(doc)}>
                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                                    <FileIcon size={16} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-gray-700 truncate hover:underline" title={doc.filename}>{doc.filename}</div>
                                    <div className="text-xs text-gray-400">
                                        {formatBytes(doc.size)} • {new Date(doc.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                <button
                                    onClick={() => handleDownload(doc)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                                    title="Télécharger"
                                >
                                    <Download size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                                    title="Supprimer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
