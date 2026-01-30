import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { QuoteService, type Quote } from '../services/quote.service';

const QuotesListPage = () => {
    const navigate = useNavigate();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            const data = await QuoteService.getAll({});
            setQuotes(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load quotes');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

    // KPI
    const totalPipeline = quotes.filter(q => q.status === 'SENT' || q.status === 'DRAFT').reduce((sum, q) => sum + q.total, 0);
    const acceptedAmount = quotes.filter(q => q.status === 'ACCEPTED').reduce((sum, q) => sum + q.total, 0);

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Devis</h1>
                    <p className="text-gray-500 mt-1">Gérez vos propositions commerciales</p>
                </div>
                <button
                    onClick={() => navigate('/finance/quotes/new')}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 font-medium"
                >
                    <Plus size={20} />
                    <span>Créer un Devis</span>
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pipeline (Envoyés)</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalPipeline)}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Acceptés</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2 text-emerald-600">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(acceptedAmount)}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Devis</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{quotes.length}</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center">
                    {error}
                </div>
            )}

            {/* Quotes List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Référence</th>
                            <th className="p-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="p-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                            <th className="p-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="p-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Montant</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {quotes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-16 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                            <FileText size={32} className="text-gray-300" />
                                        </div>
                                        <div className="text-gray-500 font-medium">Aucun devis pour le moment</div>
                                        <button
                                            onClick={() => navigate('/finance/quotes/new')}
                                            className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                                        >
                                            Créer le premier
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            quotes.map((quote) => (
                                <tr
                                    key={quote.id}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors group"
                                    onClick={() => navigate(`/finance/quotes/${quote.id}`)}
                                >
                                    <td className="p-5 font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        {quote.number}
                                    </td>
                                    <td className="p-5 text-gray-600 text-sm">
                                        {new Date(quote.date).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="p-5 text-gray-900 font-medium">
                                        {quote.actorName || `Client ${quote.actorId.substring(0, 8)}`}
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${quote.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                                            quote.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                                                quote.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                                                    quote.status === 'EXPIRED' ? 'bg-gray-100 text-gray-600' :
                                                        'bg-gray-100 text-gray-600'
                                            }`}>
                                            {quote.status === 'DRAFT' ? 'Brouillon' :
                                                quote.status === 'SENT' ? 'Envoyé' :
                                                    quote.status === 'ACCEPTED' ? 'Accepté' :
                                                        quote.status === 'REJECTED' ? 'Refusé' :
                                                            quote.status === 'EXPIRED' ? 'Expiré' : quote.status}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right font-bold text-gray-900 text-lg">
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(quote.total)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuotesListPage;
