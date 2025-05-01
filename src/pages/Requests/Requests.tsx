import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { firestore } from '../../firebase/config';
import { Filter, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import RequestCard from '../../components/RequestCard/RequestCard';
import { useAuth } from '../../contexts/AuthContext';

interface BookingRequest {
  id: string;
  serviceType: string;
  address: string;
  createdAt: Timestamp;
  status: string;
  isUrgent: boolean;
  date: string;
  specialInstructions?: string;
  preferredProvider?: string;
}

const Requests = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchRequests = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);
        
        // Base query to get either pending requests or requests assigned to current provider
        let baseQuery = query(
          collection(firestore, 'bookings'),
          where('status', 'in', ['pending', 'accepted', 'in-progress', 'completed'])
        );

        // Get all documents that match the base query
        const querySnapshot = await getDocs(baseQuery);
        const requestsData: BookingRequest[] = [];
        
        // Filter the results based on status and provider
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<BookingRequest, 'id'>;
          
          // Include the request if:
          // 1. It's pending (no preferred provider set) OR
          // 2. Current user is the preferred provider
          if (data.status === 'pending' || data.preferredProvider === currentUser.uid) {
            requestsData.push({ id: doc.id, ...data });
          }
        });

        // Apply additional filters based on the selected filter
        const filteredRequests = requestsData.filter(request => {
          switch (filter) {
            case 'pending':
              return request.status === 'pending';
            case 'in-progress':
              return request.status === 'in-progress' && request.preferredProvider === currentUser.uid;
            case 'completed':
              return request.status === 'completed' && request.preferredProvider === currentUser.uid;
            case 'urgent':
              return (request.isUrgent && (request.status === 'pending' || request.preferredProvider === currentUser.uid));
            default:
              return true; // 'all' filter shows everything
          }
        });

        // Sort by creation date
        filteredRequests.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        
        setRequests(filteredRequests);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to load service requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [filter, currentUser]);

  const filterButtons = [
    { id: 'all', label: 'All Requests', icon: <Filter size={16} /> },
    { id: 'pending', label: 'Pending', icon: <Clock size={16} /> },
    { id: 'in-progress', label: 'In Progress', icon: <TrendingUp size={16} /> },
    { id: 'completed', label: 'Completed', icon: <CheckCircle size={16} /> },
    { id: 'urgent', label: 'Urgent', icon: <AlertTriangle size={16} /> },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Service Requests</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          View and manage incoming service repair requests
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mr-2">Filter:</div>
        {filterButtons.map((button) => (
          <button
            key={button.id}
            onClick={() => setFilter(button.id)}
            className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm transition-colors border ${
              filter === button.id
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 border-primary-300 dark:border-primary-700'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-300 dark:border-neutral-700'
            }`}
          >
            <span className="mr-1.5">{button.icon}</span>
            {button.label}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md">
          <p>{error}</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
              <Filter size={24} className="text-primary-500 dark:text-primary-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">No requests found</h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            {filter === 'all'
              ? 'There are no service requests available at the moment.'
              : `There are no ${filter} requests available.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
