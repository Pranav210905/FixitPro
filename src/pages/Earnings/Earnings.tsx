import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EarningsData {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  paymentMethod:string;
  recentTransactions: Array<{
    id: string;
    amount: number;
    date: Date;
    serviceType: string;
    
    payment
  }>;
  monthlyData: Array<{
    month: string;
    earnings: number;
  }>;
}

const Earnings = () => {
  const { currentUser } = useAuth();
  const [earningsData, setEarningsData] = useState<EarningsData>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    recentTransactions: [],
    monthlyData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarningsData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const now = new Date();
        const dayStart = new Date(now.setHours(0, 0, 0, 0));
        const weekStart = new Date(now.setDate(now.getDate() - 7));
        const monthStart = new Date(now.setDate(1));
        const yearStart = new Date(now.setMonth(0, 1));

        const completedBookingsQuery = query(
          collection(firestore, 'bookings'),
          where('preferredProvider', '==', currentUser.uid),
          where('status', '==', 'completed'),
          orderBy('completedAt', 'desc')
        );

        const querySnapshot = await getDocs(completedBookingsQuery);
        let daily = 0;
        let weekly = 0;
        let monthly = 0;
        let yearly = 0;
        const transactions: any[] = [];
        const monthlyEarnings: Record<string, number> = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(data)
          const amount = data.paymentAmount || 0;
          const completedAt = data.paymentTimestamp?.toDate();
          

          if (completedAt) {
            if (completedAt >= dayStart) daily += amount;
            if (completedAt >= weekStart) weekly += amount;
            if (completedAt >= monthStart) monthly += amount;
            if (completedAt >= yearStart) yearly += amount;

            const monthYear = format(completedAt, 'MMM yyyy');
            monthlyEarnings[monthYear] = (monthlyEarnings[monthYear] || 0) + amount;

            transactions.push({
              id: doc.id,
              amount,
              date: completedAt,
              serviceType: data.serviceType,
              paymentMethod:data.paymentMethod
            });
          }
        });

        const monthlyData = Object.entries(monthlyEarnings).map(([month, earnings]) => ({
          month,
          earnings
        }));

        setEarningsData({
          daily,
          weekly,
          monthly,
          yearly,
          recentTransactions: transactions.slice(0, 10),
          monthlyData
        });
      } catch (error) {
        console.error('Error fetching earnings data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Daily</h3>
            <DollarSign className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">
            ${earningsData.daily.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Weekly</h3>
            <DollarSign className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">
            ${earningsData.weekly.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Monthly</h3>
            <DollarSign className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">
            ${earningsData.monthly.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Yearly</h3>
            <DollarSign className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">
            ${earningsData.yearly.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">Monthly Earnings</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={earningsData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="earnings" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6  shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-neutral-200 dark:border-neutral-700">
                <th className="pb-3 text-neutral-600 dark:text-neutral-400">Service</th>
                <th className="pb-3 text-neutral-600 dark:text-neutral-400">Date</th>
                <th className="pb-3 text-neutral-600 dark:text-neutral-400">Amount</th>
                 <th className="pb-3 text-neutral-600 dark:text-neutral-400">Transaction Platform</th>
              </tr>
            </thead>
            <tbody>
              {earningsData.recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-neutral-200 dark:border-neutral-700">
                  <td className="py-4 text-neutral-900 dark:text-white">
                    {transaction.serviceType}
                  </td>
                  <td className="py-4 text-neutral-600 dark:text-neutral-400">
                    {format(transaction.date, 'MMM d, yyyy')}
                  </td>
                  <td className="py-4 text-neutral-900 dark:text-white">
                    ${transaction.amount.toFixed(2)}
                  </td>
                    <td className="py-4 text-neutral-900 dark:text-white">
                    {transaction.paymentMethod}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Earnings;