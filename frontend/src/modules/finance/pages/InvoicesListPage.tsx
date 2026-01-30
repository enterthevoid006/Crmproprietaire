import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react'; // Assuming lucide-react is installed
import { InvoiceService, type Invoice } from '../services/invoice.service';

const InvoicesListPage = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const data = await InvoiceService.getAll({});
            setInvoices(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

    // Calcul des KPI simples
    const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0);
    const pendingAmount = invoices.filter(i => i.status === 'SENT').reduce((sum, i) => sum + i.total, 0);

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Facturation</h1>
                    <p className="text-gray-500 mt-1">Vos finances en un coup d'œil</p>
                </div>
                <button
                    onClick={() => navigate('/finance/invoices/new')}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 font-medium"
                >
                    <Plus size={20} />
                    <span>Créer une Facture</span>
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Chiffre d'Affaires</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalRevenue)}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">En Attente</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2 text-indigo-600">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(pendingAmount)}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Factures</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{invoices.length}</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center">
                    {error}
                </div>
            )}

            {/* Invoices List */}
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
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-16 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                            <Plus size={32} className="text-gray-300" />
                                        </div>
                                        <div className="text-gray-500 font-medium">Aucune facture pour le moment</div>
                                        <button
                                            onClick={() => navigate('/finance/invoices/new')}
                                            className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                                        >
                                            Créer la première
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            invoices.map((invoice) => (
                                <tr
                                    key={invoice.id}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors group"
                                    onClick={() => navigate(`/finance/invoices/${invoice.id}`)}
                                >
                                    <td className="p-5 font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        {invoice.number}
                                    </td>
                                    <td className="p-5 text-gray-600 text-sm">
                                        {new Date(invoice.date).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="p-5 text-gray-900 font-medium">
                                        {/* Display Actor Name from backend if available, or fallback */}
                                        {invoice.actorName || `Client ${invoice.actorId ? invoice.actorId.substring(0, 8) : 'Inconnu'}`}
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                                            invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                                                invoice.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {invoice.status === 'DRAFT' ? 'Brouillon' :
                                                invoice.status === 'SENT' ? 'Envoyée' :
                                                    invoice.status === 'PAID' ? 'Payée' :
                                                        invoice.status === 'OVERDUE' ? 'Retard' :
                                                            invoice.status === 'CANCELLED' ? 'Annulée' : invoice.status}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right font-bold text-gray-900 text-lg">
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.total)}
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

export default InvoicesListPage;
