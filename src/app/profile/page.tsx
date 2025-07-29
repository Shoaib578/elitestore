// app/profile/page.tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Package, 
  Calendar, 
  ArrowRight 
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';


export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderCount = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        setOrderCount(querySnapshot.size);
      } catch (error) {
        console.error('Error fetching order count:', error);
        setOrderCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderCount();
  }, [user]);

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  const memberSince = user.metadata.creationTime 
    ? new Date(user.metadata.creationTime) 
    : new Date();

  const formatMemberSince = memberSince.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Profile</h1>
          <p className="text-lg text-gray-600">Manage your account information and order history</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-12 text-white text-center">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <User className="h-12 w-12"/>
            </div>
            <h2 className="text-2xl font-bold mb-2">{user.email}</h2>
            <p className="text-purple-100">Welcome back!</p>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Email */}
              <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Email Address</h3>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>

              {/* Order Count */}
              <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  ) : (
                    orderCount
                  )}
                </p>
              </div>

              {/* Member Since */}
              <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Member Since</h3>
                <p className="text-gray-900 font-medium">{formatMemberSince}</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-12 text-center">
              <button
                onClick={() => router.push('/orders')}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                View All Orders
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>

    
      </div>
    </div>
  );
}