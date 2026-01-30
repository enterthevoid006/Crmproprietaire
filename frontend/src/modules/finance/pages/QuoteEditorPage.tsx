import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, Send, CheckCircle, XCircle, Lock, Download } from 'lucide-react';
import { QuoteService, type QuoteItem, QuoteStatus, type Quote } from '../services/quote.service';

const QuoteEditorPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [quote, setQuote] = useState<Quote | null>(null);

    // Form State
    const [actorId, setActorId] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [items, setItems] = useState<QuoteItem[]>([
        { description: 'Service...', quantity: 1, unitPrice: 0, total: 0 }
    ]);

    useEffect(() => {
        if (isEditMode) {
            loadQuote();
        }
    }, [id]);

    const loadQuote = async () => {
        try {
            const data = await QuoteService.getById(id!);
            setQuote(data);
            setActorId(data.actorId);
            setValidUntil(data.validUntil ? new Date(data.validUntil).toISOString().split('T')[0] : '');
            setItems(data.items);
        } catch (err) {
            console.error(err);
            alert('Failed to load quote');
            navigate('/finance/quotes');
        }
    };

    // Computed
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.20;
    const total = subtotal + tax;

    // Quote layout is read-only if not in DRAFT mode
    const isReadOnly = isEditMode && quote?.status !== QuoteStatus.DRAFT;

    const handleItemChange = (index: number, field: keyof QuoteItem, value: string | number) => {
        if (isReadOnly) return;
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
            item.total = Number(item.quantity) * Number(item.unitPrice);
        }
        newItems[index] = item;
        setItems(newItems);
    };

    const addItem = () => {
        if (isReadOnly) return;
        setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const removeItem = (index: number) => {
        if (isReadOnly) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!actorId) return alert('Please select a client');
        setLoading(true);
        try {
            await QuoteService.create({
                actorId,
                items,
                validUntil: validUntil ? new Date(validUntil).toISOString() : undefined
            });
            navigate('/finance/quotes');
        } catch (err) {
            console.error(err);
            alert('Failed to save quote');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: QuoteStatus) => {
        if (!quote) return;
        if (!confirm(`Are you sure you want to mark this quote as ${newStatus}?`)) return;

        try {
            await QuoteService.updateStatus(quote.id, newStatus);
            await loadQuote(); // Refresh
        } catch (e) {
            alert('Failed to update status');
        }
    };

    const getStatusBadge = (status: QuoteStatus) => {
        const styles = {
            [QuoteStatus.DRAFT]: 'bg-gray-100 text-gray-800',
            [QuoteStatus.SENT]: 'bg-blue-100 text-blue-800',
            [QuoteStatus.ACCEPTED]: 'bg-emerald-100 text-emerald-800',
            [QuoteStatus.REJECTED]: 'bg-rose-100 text-rose-800',
            [QuoteStatus.EXPIRED]: 'bg-gray-100 text-gray-500 line-through',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="max-w-5xl mx-auto p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/finance/quotes')}
                        className="flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Retour
                    </button>
                    {isEditMode && quote && getStatusBadge(quote.status)}
                </div>

                <div className="flex items-center gap-3">
                    {/* Status Actions */}
                    {isEditMode && quote?.status === QuoteStatus.DRAFT && (
                        <button
                            onClick={() => handleStatusChange(QuoteStatus.SENT)}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                        >
                            <Send size={18} />
                            <span>Mark as Sent</span>
                        </button>
                    )}
                    {isEditMode && (quote?.status === QuoteStatus.SENT || quote?.status === QuoteStatus.EXPIRED) && (
                        <>
                            <button
                                onClick={() => handleStatusChange(QuoteStatus.ACCEPTED)}
                                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
                            >
                                <CheckCircle size={18} />
                                <span>Accept</span>
                            </button>
                            <button
                                onClick={() => handleStatusChange(QuoteStatus.REJECTED)}
                                className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-medium"
                            >
                                <XCircle size={18} />
                                <span>Reject</span>
                            </button>
                        </>
                    )}

                    {isEditMode && quote && (
                        <button
                            onClick={() => QuoteService.downloadPdf(quote.id)}
                            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <Download size={18} />
                            <span>PDF</span>
                        </button>
                    )}

                    {!isReadOnly && (
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            <Save size={20} />
                            <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ReadOnly Warning */}
            {isReadOnly && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg flex items-center gap-3">
                    <Lock className="text-amber-500" size={24} />
                    <div>
                        <p className="font-bold text-amber-900">Devis verrouillé</p>
                        <p className="text-amber-700 text-sm">Ce document a été envoyé ou clôturé et ne peut plus être modifié.</p>
                    </div>
                </div>
            )}

            {/* Document Paper UI */}
            <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-10 space-y-10 min-h-[800px] relative ${isReadOnly ? 'opacity-90 grayscale-[0.1]' : ''}`}>

                {/* Brand / Header */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-8">
                    <div>
                        <div className="h-12 w-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm font-medium mb-4">
                            LOGO
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {isEditMode && quote ? `Devis ${quote.number}` : 'Nouveau Devis'}
                        </h2>
                    </div>
                    <div className="text-right space-y-2">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Valide jusqu'au</label>
                            <input
                                type="date"
                                disabled={isReadOnly}
                                value={validUntil}
                                onChange={(e) => setValidUntil(e.target.value)}
                                className="text-right p-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Client Section */}
                <div className="grid grid-cols-2 gap-12">
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Émetteur</h3>
                        <p className="font-bold text-gray-900">Agence Demo</p>
                        <p className="text-gray-500 text-sm mt-1">123 Rue de la Paix<br />75000 Paris, France</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Client</h3>
                        <input
                            type="text"
                            disabled={isReadOnly}
                            value={actorId}
                            onChange={(e) => setActorId(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm font-medium disabled:cursor-not-allowed"
                            placeholder="Rechercher un client (ID)..."
                        />
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="mt-8">
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Services & Produits</h3>
                    </div>

                    <div className="w-full">
                        <div className="grid grid-cols-12 gap-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
                            <div className="col-span-6">Description</div>
                            <div className="col-span-2 text-right">Qté</div>
                            <div className="col-span-2 text-right">Prix Unit.</div>
                            <div className="col-span-2 text-right">Total HT</div>
                        </div>

                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 items-center group bg-gray-50 p-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all">
                                    <div className="col-span-6 flex items-center gap-2">
                                        {!isReadOnly && (
                                            <button onClick={() => removeItem(index)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-opacity">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        <input
                                            type="text"
                                            disabled={isReadOnly}
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            placeholder="Description du service..."
                                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-gray-900 placeholder-gray-400 font-medium disabled:text-gray-600"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            disabled={isReadOnly}
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-right text-gray-900 disabled:text-gray-600"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            disabled={isReadOnly}
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-right text-gray-900 disabled:text-gray-600"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="col-span-2 text-right font-bold text-gray-900">
                                        {item.total.toFixed(2)} €
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!isReadOnly && (
                            <button
                                onClick={addItem}
                                className="mt-4 flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold px-4 py-2 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                                <Plus size={16} />
                                <span>Ajouter une ligne</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Totals Section */}
                <div className="border-t border-gray-100 pt-8 mt-12 flex justify-end">
                    <div className="w-80 space-y-4">
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span>Sous-total HT</span>
                            <span className="font-medium">{subtotal.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span>TVA (20%)</span>
                            <span className="font-medium">{tax.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t border-gray-200">
                            <span>Total TTC</span>
                            <span className="text-indigo-600">{total.toFixed(2)} €</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default QuoteEditorPage;
