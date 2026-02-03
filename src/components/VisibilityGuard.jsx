import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { settingsAPI } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const VisibilityGuard = ({ settingKey, children }) => {
    const [isVisible, setIsVisible] = useState(null); // null = loading

    useEffect(() => {
        const checkSetting = async () => {
            try {
                const res = await settingsAPI.get(settingKey);
                setIsVisible(res.data?.value ?? true); // Default to true if undefined
            } catch (error) {
                console.error(`Error checking visibility for ${settingKey}:`, error);
                setIsVisible(true); // Fail open on error
            }
        };
        checkSetting();
    }, [settingKey]);

    if (isVisible === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isVisible === false) {
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
};

export default VisibilityGuard;
