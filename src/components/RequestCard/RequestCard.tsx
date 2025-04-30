import { useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircle2, 
  CalendarDays, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  PenTool as Tool,
  Play,
  Check
} from 'lucide-react';

interface RequestCardProps {
  request: {
    id: string;
    serviceType: string;
    address: string;
    createdAt: Timestamp;
    status: string;
    isUrgent: boolean;
    date: string;
    specialInstructions?: string;
  };
}

const RequestCard = ({ request }: RequestCardProps) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleStatusUpdate = async (newStatus: string) => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const requestRef = doc(firestore, 'bookings', request.id);
      const updateData: any = {
        status: newStatus,
      };

      if (newStatus === 'accepted') {
        updateData.preferredProvider = currentUser.uid;
        updateData.providerName = currentUser.displayName;
        updateData.acceptedAt = new Date();
      } else if (newStatus === 'in-progress') {
        updateData.startedAt = new Date();
      } else if (newStatus === 'completed') {
        updateData.completedAt = new Date();
      }

      await updateDoc(requestRef, updateData);
      
      // Update local state
      request.status = newStatus;
      
    } catch (err) {
      console.error('Error updating request:', err);
      setError('Failed to update request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusBadge = () => {
    switch (request.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <Clock size={12} className="mr-1" /> Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <CheckCircle2 size={12} className="mr-1" /> Accepted
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            <Play size={12} className="mr-1" /> In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <Check size={12} className="mr-1" /> Completed
          </span>
        );
      default:
        return null;
    }
  };

  const getActionButton = () => {
    if (isLoading) {
      return (
        <button
          disabled
          className="flex-1 bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 text-sm font-medium py-2 px-4 rounded-md cursor-not-allowed"
        >
          Updating...
        </button>
      );
    }

    switch (request.status) {
      case 'pending':
        return (
          <button
            onClick={() => handleStatusUpdate('accepted')}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
          >
            Accept Request
          </button>
        );
      case 'accepted':
        return (
          <button
            onClick={() => handleStatusUpdate('in-progress')}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
          >
            Start Service
          </button>
        );
      case 'in-progress':
        return (
          <button
            onClick={() => handleStatusUpdate('completed')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
          >
            Mark as Completed
          </button>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden border border-neutral-200 dark:border-neutral-700 transition-all hover:shadow-md">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-md mr-3">
              <Tool size={18} className="text-primary-700 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-900 dark:text-white">
                {request.serviceType.charAt(0).toUpperCase() + request.serviceType.slice(1)}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {formatDistanceToNow(request.createdAt.toDate(), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex">
            {request.isUrgent && (
              <span className="inline-flex items-center mr-2 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                <AlertTriangle size={12} className="mr-1" /> Urgent
              </span>
            )}
            {getStatusBadge()}
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-start text-sm">
            <MapPin size={16} className="text-neutral-500 dark:text-neutral-400 mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-neutral-700 dark:text-neutral-300">{request.address}</span>
          </div>
          <div className="flex items-center text-sm">
            <CalendarDays size={16} className="text-neutral-500 dark:text-neutral-400 mr-2 flex-shrink-0" />
            <span className="text-neutral-700 dark:text-neutral-300">
              {request.date}
            </span>
          </div>
        </div>
        
        {request.specialInstructions && (
          <div className="bg-neutral-50 dark:bg-neutral-700/30 rounded p-2 mb-4">
            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
              <span className="font-medium">Instructions:</span> {request.specialInstructions}
            </p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-2 text-xs rounded-md mb-4">
            {error}
          </div>
        )}
        
        <div className="flex space-x-2">
          <Link 
            to={`/requests/${request.id}`}
            className="flex-1 text-center py-2 px-4 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-md text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            View Details
          </Link>
          
          {getActionButton()}
        </div>
      </div>
    </div>
  );
};

export default RequestCard;