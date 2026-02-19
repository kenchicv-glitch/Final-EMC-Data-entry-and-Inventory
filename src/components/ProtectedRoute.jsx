import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, profile, loading, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="container" style={{ paddingTop: '2rem' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If role-based access is required
    if (requireAdmin && !isAdmin) {
        return <div className="container" style={{ paddingTop: '2rem' }}>Access Denied: Admins only.</div>;
    }

    return children;
};

export default ProtectedRoute;
