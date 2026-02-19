import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, Trash2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { exportToCSV } from '../utils/export';

const ExpenseTable = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { isAdmin } = useAuth();

    useEffect(() => {
        fetchExpenses();
        // Subscribe to realtime changes
        const subscription = supabase
            .channel('expenses_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, payload => {
                handleRealtimeUpdate(payload);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchExpenses = async () => {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setExpenses(data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRealtimeUpdate = (payload) => {
        if (payload.eventType === 'INSERT') {
            setExpenses(prev => [payload.new, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
        } else if (payload.eventType === 'UPDATE') {
            setExpenses(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
        } else if (payload.eventType === 'DELETE') {
            setExpenses(prev => prev.filter(item => item.id !== payload.old.id));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            const { error } = await supabase.from('expenses').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            alert('Error deleting expense: ' + error.message);
        }
    };

    const handleExport = () => {
        exportToCSV(expenses, 'expenses_export.csv');
    };

    const filteredExpenses = expenses.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading expenses...</div>;

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Expense Log</h2>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                paddingLeft: '2.5rem',
                                paddingRight: '1rem',
                                paddingTop: '0.5rem',
                                paddingBottom: '0.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                minWidth: '250px'
                            }}
                        />
                    </div>

                    <button onClick={handleExport} className="btn btn-outline" style={{ gap: '0.5rem' }} title="Export CSV">
                        <Download size={18} />
                    </button>

                    <Link to="/expenses/add" className="btn btn-primary" style={{ textDecoration: 'none', gap: '0.5rem' }}>
                        <Plus size={18} />
                        Add Expense
                    </Link>
                </div>
            </div>

            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <span style={{ fontWeight: 500, color: 'var(--color-text-muted)' }}>Total: </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                    ${totalAmount.toFixed(2)}
                </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                            <th style={{ padding: '0.75rem', fontWeight: 600 }}>Date</th>
                            <th style={{ padding: '0.75rem', fontWeight: 600 }}>Description</th>
                            <th style={{ padding: '0.75rem', fontWeight: 600 }}>Category</th>
                            <th style={{ padding: '0.75rem', fontWeight: 600, textAlign: 'right' }}>Amount</th>
                            {isAdmin && <th style={{ padding: '0.75rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.length === 0 ? (
                            <tr>
                                <td colSpan={isAdmin ? "5" : "4"} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No expenses found.
                                </td>
                            </tr>
                        ) : (
                            filteredExpenses.map(expense => (
                                <tr key={expense.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                                        {new Date(expense.date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>{expense.description}</td>
                                    <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>{expense.category || '-'}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 500 }}>
                                        ${Number(expense.amount).toFixed(2)}
                                    </td>
                                    {isAdmin && (
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleDelete(expense.id)}
                                                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                                                title="Delete Expense"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpenseTable;
