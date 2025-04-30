import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { firestore } from '../../firebase/config';
import { formatDistanceToNow } from 'date-fns';
import { DollarSign, Star, CheckCircle, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart } from 'react-minimal-pie-chart';
import { useAuth } from '../../contexts/AuthContext';

interface PerformanceMetrics {
  totalEarnings: number;
  averageRating: number;
  completedServices: number;
  monthlyEarnings: { month: string; earnings: number }[];
  monthlyServices: { title: string; value: number; color: string }[];
}

interface Review {
  id: string;
  workQuality: number;
  experienceRating: string;
  additionalFeedback: string;
  timestamp: any;
  serviceUsed: string;
}

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalEarnings: 0,
    averageRating: 0,
    completedServices: 0,
    monthlyEarnings: [],
    monthlyServices: []
  });
  const [latestReviews, setLatestReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!currentUser) return;

      try {
        // Fetch completed services
        const completedQuery = query(
          collection(firestore, 'bookings'),
          where('preferredProvider', '==', currentUser.uid),
          where('status', '==', 'completed')
        );
        const completedSnap = await getDocs(completedQuery);
        
        let totalEarnings = 0;
        const monthlyData: Record<string, number> = {};
        const servicesByMonth: Record<string, number> = {};
        
        completedSnap.forEach(doc => {
          const data = doc.data();
          totalEarnings += data.paymentAmount || 0;
          
          const date = data.completedAt?.toDate();
          if (date) {
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            monthlyData[monthYear] = (monthlyData[monthYear] || 0) + (data.paymentAmount || 0);
            servicesByMonth[monthYear] = (servicesByMonth[monthYear] || 0) + 1;
          }
        });

        // Fetch ratings
        const ratingsQuery = query(
          collection(firestore, 'feedback'),
          where('providerId', '==', currentUser.uid)
        );
        const ratingsSnap = await getDocs(ratingsQuery);
        
        let totalRating = 0;
        ratingsSnap.forEach(doc => {
          totalRating += doc.data().workQuality || 0;
        });

        // Fetch latest reviews
        const reviewsQuery = query(
          collection(firestore, 'feedback'),
          where('providerId', '==', currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(3)
        );
        const reviewsSnap = await getDocs(reviewsQuery);
        const reviews: Review[] = [];
        reviewsSnap.forEach(doc => {
          reviews.push({ id: doc.id, ...doc.data() } as Review);
        });
        setLatestReviews(reviews);

        const monthlyEarnings = Object.entries(monthlyData).map(([month, earnings]) => ({
          month,
          earnings
        }));

        // Convert monthly services to pie chart data
        const colors = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];
        const monthlyServices = Object.entries(servicesByMonth).map(([month, count], index) => ({
          title: month,
          value: count,
          color: colors[index % colors.length]
        }));

        setMetrics({
          totalEarnings,
          averageRating: ratingsSnap.size ? totalRating / ratingsSnap.size : 0,
          completedServices: completedSnap.size,
          monthlyEarnings,
          monthlyServices
        });
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [currentUser]);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={`${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-neutral-300 dark:text-neutral-600'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Total Earnings</h3>
            <DollarSign className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">
            ${metrics.totalEarnings.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Average Rating</h3>
            <Star className="text-yellow-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">
            {metrics.averageRating.toFixed(1)}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Completed Services</h3>
            <CheckCircle className="text-blue-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">
            {metrics.completedServices}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Earnings Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.monthlyEarnings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#0ea5e9" 
                  fill="#0ea5e9" 
                  fillOpacity={0.1} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Services by Month</h3>
          <div className="h-64 flex items-center justify-center">
            {metrics.monthlyServices.length > 0 ? (
              <PieChart
                data={metrics.monthlyServices}
                lineWidth={20}
                paddingAngle={2}
                label={({ dataEntry }) => `${dataEntry.title}: ${dataEntry.value}`}
                labelStyle={{
                  fontSize: '5px',
                  fontFamily: 'sans-serif',
                  fill: '#fff',
                }}
                labelPosition={70}
                radius={35}
              />
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400">No service data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Latest Reviews</h3>
          <Link
            to="/reviews"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
          >
            View all reviews
          </Link>
        </div>

        {latestReviews.length > 0 ? (
          <div className="space-y-6">
            {latestReviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-neutral-200 dark:border-neutral-700 last:border-0 pb-6 last:pb-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-neutral-900 dark:text-white">
                    {review.serviceUsed} Service
                  </h4>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
{formatDistanceToNow(
  new Date(review.timestamp),
  { addSuffix: true }
)}

                  </span>
                </div>
                <div className="flex items-center mb-2">
                  {renderStars(review.workQuality)}
                  <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {review.experienceRating}
                  </span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2">
                  {review.additionalFeedback}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600 mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">No reviews yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;