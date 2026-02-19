import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const StockForm = ({ type = 'add' }) => { // type: 'add' (new item) or 'movement' (stock in/out)
    const navigate = useNavigate();
    const { user } = useAuth();

    // State for New Item
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [minStock, setMinStock] = useState(10);
    const [initialStock, setInitialStock] = useState(0);

    // State for Movement
    const [itemId, setItemId] = useState('');
    const [movementType, setMovementType] = useState('in');
    const [quantity, setQuantity] = useState(1);
    const [items, setItems] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (type === 'movement') {
            fetchItems();
        }
    }, [type]);

    const fetchItems = async () => {
        const { data } = await supabase.from('inventory_items').select('id, name').order('name');
        setItems(data || []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (type === 'add') {
                const { error } = await supabase.from('inventory_items').insert([{
                    name,
                    category,
                    min_stock_level: minStock,
                    current_stock: initialStock
                }]);
                if (error) throw error;
                navigate('/inventory');
            } else {
                // Record Movement
                const { error } = await supabase.from('stock_movements').insert([{
                    item_id: itemId,
                    type: movementType,
                    quantity: parseInt(quantity),
                    created_by: user.id
                }]);
                if (error) throw error;
                navigate('/inventory');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Link to="/inventory" style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                    <ArrowLeft size={20} />
                </Link>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                    {type === 'add' ? 'Add New Item' : 'Record Stock Movement'}
                </h2>
            </div>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '0.25rem', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {type === 'add' ? (
                    <>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Item Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
                            <input
                                type="text"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ marginBottom: '1rem', flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Initial Stock</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={initialStock}
                                    onChange={e => setInitialStock(parseInt(e.target.value))}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem', flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Min Stock Level</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={minStock}
                                    onChange={e => setMinStock(parseInt(e.target.value))}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Item</label>
                            <select
                                value={itemId}
                                onChange={e => setItemId(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
                            >
                                <option value="">Select Item</option>
                                {items.map(item => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ marginBottom: '1rem', flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Movement Type</label>
                                <select
                                    value={movementType}
                                    onChange={e => setMovementType(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
                                >
                                    <option value="in">Stock In (Restock)</option>
                                    <option value="out">Stock Out (Usage)</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem', flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
                                />
                            </div>
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ width: '100%', marginTop: '1rem', gap: '0.5rem' }}
                >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </form>
        </div>
    );
};

export default StockForm;
