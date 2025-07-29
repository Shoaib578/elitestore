'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  MapPin,
  CreditCard,
  Download,
  MessageCircle,
  RefreshCw,
  Copy,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: any[];
  total: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: any;
  shippingInfo: any;
  paymentInfo?: any;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
}

const statusConfig = {
  pending: { 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: Clock,
    title: 'Order Pending',
    description: 'Your order has been received and is being processed.'
  },
  processing: { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Package,
    title: 'Processing Order',
    description: 'We are preparing your items for shipment.'
  },
  shipped: { 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    icon: Truck,
    title: 'Order Shipped',
    description: 'Your order is on its way to you!'
  },
  delivered: { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: CheckCircle,
    title: 'Order Delivered',
    description: 'Your order has been successfully delivered.'
  },
  cancelled: { 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: XCircle,
    title: 'Order Cancelled',
    description: 'This order has been cancelled.'
  }
};

const trackingSteps = [
  { status: 'pending', label: 'Order Placed', description: 'We have received your order' },
  { status: 'processing', label: 'Processing', description: 'Your order is being prepared' },
  { status: 'shipped', label: 'Shipped', description: 'Your order is on the way' },
  { status: 'delivered', label: 'Delivered', description: 'Order has been delivered' }
];

export default function OrderDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!user && loading == false) {
      router.push('/auth/signin?redirect=/orders');
      return;
    }

    if (params.id) {
      fetchOrder(params.id as string);
    }
  }, [user, params.id, router]);

  const fetchOrder = async (orderId: string) => {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      
      if (orderDoc.exists()) {
        const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order;
        
        // Check if this order belongs to the current user
        if (orderData.userId != user?.uid && loading == false) {
          toast.error('Access denied. This order does not belong to you.');
          router.push('/orders');
          return;
        }
        
        setOrder(orderData);
      } else {
        toast.error('Order not found');
        router.push('/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      router.push('/orders');
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
    router.refresh()
  } catch (error) {
    console.error('Error cancelling order:', error);
    toast.error('Failed to cancel order. Please try again.');
  }
  };

  const copyOrderNumber = async () => {
    if (!order) return;
    
    setCopying(true);
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      toast.success('Order number copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy order number');
    } finally {
      setCopying(false);
    }
  };

  const getStatusIndex = (status: string) => {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    return statusOrder.indexOf(status);
  };

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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
          <p className="text-gray-600 mb-8">The order you're looking for doesn't exist or has been removed.</p>
          <Link href="/orders">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Orders
            </motion.div>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status];
  const StatusIcon = statusInfo.icon;
  const currentStatusIndex = getStatusIndex(order.status);

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
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/orders">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Orders</span>
              </motion.button>
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Order {order.orderNumber}
              </h1>
              <p className="text-gray-600">
                Placed on {order.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) || 'Date unavailable'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyOrderNumber}
                disabled={copying}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Copy className={`h-4 w-4 ${copying ? 'animate-pulse' : ''}`} />
                <span>{copying ? 'Copying...' : 'Copy Order #'}</span>
              </motion.button>
              
              <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border ${statusInfo.color}`}>
                <StatusIcon className="h-5 w-5" />
                <span className="font-medium capitalize">{order.status}</span>
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
              
              <div className="relative">
                {/* Status Message */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <StatusIcon className="h-6 w-6 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{statusInfo.title}</h3>
                      <p className="text-gray-600">{statusInfo.description}</p>
                      {order.trackingNumber && (
                        <p className="text-sm text-purple-600 mt-2">
                          Tracking Number: <span className="font-mono">{order.trackingNumber}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {trackingSteps.map((step, index) => {
                    const isCompleted = currentStatusIndex >= index;
                    const isCurrent = currentStatusIndex === index;
                    const StepIcon = statusConfig[step.status as keyof typeof statusConfig].icon;
                    
                    return (
                      <div key={step.status} className="relative flex items-start space-x-4 pb-8">
                        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          isCompleted 
                            ? 'bg-purple-600 border-purple-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}>
                          <StepIcon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 pt-1">
                          <h4 className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.label}
                          </h4>
                          <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.description}
                          </p>
                          {isCurrent && order.createdAt && (
                            <p className="text-xs text-purple-600 mt-1">
                              Updated {order.createdAt.toDate()?.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
              
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${item.price}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium text-purple-600 mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Shipping Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                <span>Shipping Information</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
                  <div className="text-gray-600 space-y-1">
                    <p className="font-medium">{order.shippingInfo?.firstName} {order.shippingInfo?.lastName}</p>
                    <p>{order.shippingInfo?.address}</p>
                    <p>{order.shippingInfo?.city}, {order.shippingInfo?.state} {order.shippingInfo?.zipCode}</p>
                    <p>{order.shippingInfo?.country || 'United States'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                  <div className="text-gray-600 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{order.shippingInfo?.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{order.shippingInfo?.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-lg shadow-lg p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${(order.subtotal || order.total || 0).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {(order.shipping || 0) === 0 ? 'Free' : `$${(order.shipping || 0).toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">${(order.tax || 0).toFixed(2)}</span>
                </div>
                
                <hr />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-purple-600">${order.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

           
              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
               

                {(order.status === 'pending' || order.status === 'processing') && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleCancelOrder(order.id)}

                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancel Order</span>
                  </motion.button>
                )}

              
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fetchOrder(order.id)}
                  className="w-full border border-purple-300 text-purple-600 py-3 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Status</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Help Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100"
            >
              <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our customer support team is here to assist you with any questions about your order.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">📧 support@elitestore.com</p>
                <p className="text-gray-600">📞 1-800-ELITE-STORE</p>
                <p className="text-gray-600">💬 Live chat available 24/7</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}