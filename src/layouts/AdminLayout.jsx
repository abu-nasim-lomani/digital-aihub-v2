import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Shared Admin Sidebar for all admin pages */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 w-full overflow-y-auto max-h-screen">
                <main className="min-h-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
