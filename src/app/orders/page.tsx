// app/orders/page.tsx (Customer Orders Page)
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { Package, Eye, Download, Truck, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  orderNumber: string;
  items: any[];
  total: number;
  status: string;
  createdAt: any;
  shippingInfo: any;
}

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { color: 'bg-blue-100 text-blue-800', icon: Package },
  shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
};

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    if (!user && loading == false) {
      router.push('/auth/signin?redirect=/orders');
      return;
    }

    fetchCustomerOrders();
  }, [user, router]);

  const fetchCustomerOrders = async () => {
    if (!user) return;

    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(ordersQuery);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    } finally {
      setLoading(false);
    }
  };

    const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
        return;
    }

    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
        status: 'cancelled',
        cancelledAt: new Date(),
        });
        toast.success('Order has been cancelled.');
        fetchCustomerOrders()
    } catch (error) {
        console.error('Error cancelling order:', error);
        toast.error('Failed to cancel order. Please try again.');
    }
    };


  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Orders</h1>
          <p className="text-xl text-gray-600">
            Track and manage your order history
          </p>
        </motion.div>

        {/* Status Filter */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    selectedStatus === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {status} {status !== 'all' && `(${orders.filter(o => o.status === status).length})`}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {orders.length === 0 ? 'No orders yet' : `No ${selectedStatus} orders`}
            </h2>
            <p className="text-gray-600 mb-8">
              {orders.length === 0 
                ? "You haven't placed any orders yet. Start shopping to see your orders here."
                : `You don't have any ${selectedStatus} orders.`
              }
            </p>
            {orders.length === 0 && (
              <Link href="/products">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Start Shopping
                </motion.div>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => {
              const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = statusInfo.icon;
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Order {order.orderNumber}
                        </h3>
                        <p className="text-gray-600">
                          Placed on {order.createdAt?.toDate?.()?.toLocaleDateString() || 'Date unavailable'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="capitalize">{order.status}</span>
                        </span>
                        <Link href={`/orders/${order.id}`}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </motion.div>
                        </Link>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="border-t pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {order.items?.slice(0, 3).map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center space-x-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              <p className="text-sm font-medium text-purple-600">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="flex items-center justify-center text-gray-500">
                            <span>+{order.items.length - 3} more items</span>
                          </div>
                        )}
                      </div>

                      {/* Order Summary */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-6 border-t">
                        <div className="mb-4 md:mb-0">
                          <p className="text-sm text-gray-600">
                            {order.items?.length || 0} items • Shipped to {order.shippingInfo?.city}, {order.shippingInfo?.state}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            ${order.total?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                      <Link href={`/orders/${order.id}`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Order</span>
                        </motion.div>
                      </Link>
                      
                      {order.status === 'delivered' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download Invoice</span>
                        </motion.button>
                      )}
                      
                     
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex items-center space-x-2 border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Cancel Order</span>
                        </motion.button>
                      )}

                      {order.status === 'delivered' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center space-x-2 border border-blue-300 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Package className="h-4 w-4" />
                          <span>Buy Again</span>
                        </motion.button>
                      )}

                    
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}