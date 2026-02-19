import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExpenseForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.from('expenses').insert([{
                description,
                amount: parseFloat(amount),
                category,
                date,
                created_by: user.id
            }]);

            if (error) throw error;
            navigate('/expenses');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Link to="/expenses" style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                    <ArrowLeft size={20} />
                </Link>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Record Expense</h2>
            </div>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '0.25rem', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                        placeholder="e.g. Office Supplies"
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ marginBottom: '1rem', flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Amount ($)</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem', flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
                    <input
                        type="text"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        placeholder="e.g. Utilities, Rent, Maintenance"
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ width: '100%', marginTop: '1rem', gap: '0.5rem' }}
                >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Expense'}
                </button>
            </form>
        </div>
    );
};

export default ExpenseForm;
