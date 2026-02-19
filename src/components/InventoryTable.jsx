import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, AlertCircle, Trash2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { exportToCSV } from '../utils/export';

const InventoryTable = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { isAdmin } = useAuth();

    useEffect(() => {
        fetchInventory();

        // Subscribe to realtime changes
        const subscription = supabase
            .channel('inventory_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items' }, payload => {
                handleRealtimeUpdate(payload);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchInventory = async () => {
        try {
            const { data, error } = await supabase
                .from('inventory_items')
                .select('*')
                .order('name');

            if (error) throw error;
            setItems(data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRealtimeUpdate = (payload) => {
        if (payload.eventType === 'INSERT') {
            setItems(prev => [...prev, payload.new].sort((a, b) => a.name.localeCompare(b.name)));
        } else if (payload.eventType === 'UPDATE') {
            setItems(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
        } else if (payload.eventType === 'DELETE') {
            setItems(prev => prev.filter(item => item.id !== payload.old.id));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            const { error } = await supabase.from('inventory_items').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            alert('Error deleting item: ' + error.message);
        }
    };

    const handleExport = () => {
        exportToCSV(items, 'inventory_export.csv');
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading inventory...</div>;

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Current Inventory</h2>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search items..."
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

                    {isAdmin && (
                        <Link to="/inventory/add" className="btn btn-primary" style={{ textDecoration: 'none', gap: '0.5rem' }}>
                            <Plus size={18} />
                            Add Item
                        </Link>
                    )}
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                            <th style={{ padding: '0.75rem', fontWeight: 600 }}>Name</th>
                            <th style={{ padding: '0.75rem', fontWeight: 600 }}>Category</th>
                            <th style={{ padding: '0.75rem', fontWeight: 600, textAlign: 'right' }}>Stock Level</th>
                            <th style={{ padding: '0.75rem', fontWeight: 600 }}>Status</th>
                            {isAdmin && <th style={{ padding: '0.75rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={isAdmin ? "5" : "4"} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No items found.
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map(item => {
                                const isLowStock = item.current_stock <= item.min_stock_level;
                                return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '0.75rem' }}>{item.name}</td>
                                        <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>{item.category || '-'}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 500 }}>{item.current_stock}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {isLowStock ? (
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '999px',
                                                    backgroundColor: '#fef2f2',
                                                    color: '#ef4444',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500
                                                }}>
                                                    <AlertCircle size={12} />
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '999px',
                                                    backgroundColor: '#ecfdf5',
                                                    color: '#10b981',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500
                                                }}>
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                        {isAdmin && (
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                                                    title="Delete Item"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryTable;
