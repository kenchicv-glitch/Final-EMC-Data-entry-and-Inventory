import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    ArrowRightLeft,
    Receipt,
    LogOut,
    User
} from 'lucide-react';

const Layout = ({ children }) => {
    const { user, profile, logout } = useAuth();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            // Redirect handled by ProtectedRoute -> Login
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const navItems = [
        { path: '/', label: 'Overview', icon: LayoutDashboard },
        { path: '/inventory', label: 'Inventory', icon: Package },
        { path: '/movements', label: 'Stock Movements', icon: ArrowRightLeft },
        { path: '/expenses', label: 'Expenses', icon: Receipt },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
            {/* Sidebar */}
            <aside style={{
                width: '250px',
                backgroundColor: 'var(--color-surface)',
                borderRight: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 10
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        Inventory App
                    </h1>
                </div>

                <nav style={{ flex: 1, padding: '1rem' }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path} style={{ marginBottom: '0.5rem' }}>
                                    <Link
                                        to={item.path}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            textDecoration: 'none',
                                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                            backgroundColor: isActive ? '#eff6ff' : 'transparent',
                                            fontWeight: isActive ? 500 : 400,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Icon size={20} />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                        padding: '0 0.5rem'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <User size={18} color="#64748b" />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {profile?.email || user?.email}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                                {profile?.role || 'User'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn btn-outline"
                        style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', color: 'var(--color-danger)', borderColor: '#fee2e2' }}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: '250px',
                padding: '2rem',
                maxWidth: '1200px',
                width: 'calc(100% - 250px)'
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
