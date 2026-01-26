import { useEffect, useState } from 'react';
import { learningAPI } from '../../utils/api';
import { Plus, BookOpen } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageLearning = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await learningAPI.getAll();
      setItems(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen /> Manage Learning Modules
          </h1>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Add Module
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">{items.length} learning modules total</p>
          <p className="text-sm text-gray-500 mt-2">Full CRUD interface - Use ManageProjects.jsx pattern to expand</p>
        </div>
      </div>
    </div>
  );
};

export default ManageLearning;
