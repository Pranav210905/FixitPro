import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { CheckCircle2, CalendarDays, Clock, MapPin, AlertTriangle, PenTool as Tool, ArrowLeft, Phone,User, Mail, MessageSquare } from 'lucide-react';

interface BookingRequest {
  id: string;
  serviceType: string;
  address: string;
  createdAt: Timestamp;
  status: string;
  isUrgent: boolean;
  date: string;
  fullName:string;
  phone:string;
  specialInstructions?: string;
  images?: string[];
  imageUrls?: string[];
  location?: {
    lat: number;
    lng: number;
  };
  additionalServices?: Record<string, string>;
  promoCode?: string;
}

const RequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  
  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const requestRef = doc(firestore, 'bookings', id);
        const docSnap = await getDoc(requestRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as Omit<BookingRequest, 'id'>;
          setRequest({
            id: docSnap.id,
            ...data
          });
        } else {
          setError('Service request not found');
        }
      } catch (err) {
        console.error('Error fetching request details:', err);
        setError('Failed to load service request details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequestDetails();
  }, [id]);
  
  const handleAccept = async () => {
    if (!currentUser || !id) return;
    
    try {
      setIsAccepting(true);
      setError(null);
      
      const requestRef = doc(firestore, 'bookings', id);
      await updateDoc(requestRef, {
        status: 'accepted',
        preferredProvider: currentUser.uid,
        providerName: currentUser.displayName,
        acceptedAt: new Date()
      });
      
      // Update local state
      if (request) {
        setRequest({
          ...request,
          status: 'accepted'
        });
      }
      
    } catch (err) {
      console.error('Error accepting request:', err);
      setError('Failed to accept request. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };
  
  const getStatusBadge = () => {
    if (!request) return null;
    
    if (request.status === 'pending') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          <Clock size={16} className="mr-1.5" /> Pending
        </span>
      );
    } else if (request.status === 'accepted') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle2 size={16} className="mr-1.5" /> Accepted
        </span>
      );
    }
    return null;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error || !request) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md">
        <p>{error || 'Request not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <ArrowLeft size={16} className="mr-1" /> Go back
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 mb-6"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to requests
      </button>
      
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-md mr-4">
                <Tool size={24} className="text-primary-700 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {request.serviceType.charAt(0).toUpperCase() + request.serviceType.slice(1)} Service
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Request ID: {request.id.substring(0, 8)}...
                </p>
              </div>
            </div>
            <div className="flex items-center">
              {request.isUrgent && (
                <span className="inline-flex items-center mr-3 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  <AlertTriangle size={16} className="mr-1.5" /> Urgent
                </span>
              )}
              {getStatusBadge()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Service Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin size={20} className="text-neutral-500 dark:text-neutral-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">Service Location</p>
                    <p className="text-neutral-600 dark:text-neutral-400">{request.address}</p>
                  </div>
                </div>
                                <div className="flex items-start">
               <User size={20} className="text-neutral-500 dark:text-neutral-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">Customer Name</p>
                    <p className="text-neutral-600 dark:text-neutral-400">{request.fullName}</p>
                  </div>
                </div>
                                <div className="flex items-start">
                <Phone size={20} className="text-neutral-500 dark:text-neutral-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">Phone No:</p>
                    <p className="text-neutral-600 dark:text-neutral-400">{request.phone}</p>
                  </div>
                </div>
                
                
                <div className="flex items-start">
                  <CalendarDays size={20} className="text-neutral-500 dark:text-neutral-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">Service Date</p>
                    <p className="text-neutral-600 dark:text-neutral-400">{request.date}</p>
                  </div>
                </div>
                
                {request.specialInstructions && (
                  <div className="flex items-start">
                    <MessageSquare size={20} className="text-neutral-500 dark:text-neutral-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-neutral-700 dark:text-neutral-300">Special Instructions</p>
                      <p className="text-neutral-600 dark:text-neutral-400">{request.specialInstructions}</p>
                    </div>
                  </div>
                )}
                
                {request.additionalServices && Object.keys(request.additionalServices).length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">Additional Services</p>
                    <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-400 pl-2">
                      {Object.entries(request.additionalServices).map(([key, value]) => (
                        <li key={key}>{key}: {value}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {request.promoCode && (
                  <div className="flex items-start">
                    <div>
                      <p className="font-medium text-neutral-700 dark:text-neutral-300">Promo Code</p>
                      <p className="text-neutral-600 dark:text-neutral-400">{request.promoCode}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Images</h2>
              
              {request.imageUrls && request.imageUrls.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {request.imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Service request ${index + 1}`}
                      className="rounded-md w-full h-32 object-cover border border-neutral-200 dark:border-neutral-700"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-neutral-600 dark:text-neutral-400">No images provided</p>
              )}
              
              {request.location && request.location.lat !== 0 && request.location.lng !== 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Map Location</h2>
                  <div className="bg-neutral-100 dark:bg-neutral-700 rounded-md h-48 flex items-center justify-center">
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                      Map would be displayed here with coordinates:<br />
                      Lat: {request.location.lat}, Lng: {request.location.lng}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {request.status === 'pending' ? (
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <div className="bg-neutral-50 dark:bg-neutral-700/30 p-4 rounded-md mb-6">
                <h3 className="font-medium text-neutral-900 dark:text-white mb-1">Accept this request?</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Once you accept this service request, the customer will be notified and your contact details will be shared.
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 text-sm rounded-md mb-4">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={() => navigate(-1)}
                  className="mr-3 py-2 px-6 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-md font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAccepting ? 'Accepting...' : 'Accept Request'}
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                <h3 className="flex items-center font-medium text-green-800 dark:text-green-300 mb-1">
                  <CheckCircle2 size={18} className="mr-2" />
                  Request Accepted
                </h3>
                <p className="text-green-700 dark:text-green-400 text-sm">
                  You have accepted this service request. The customer has been notified and is expecting your service on the scheduled date.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;