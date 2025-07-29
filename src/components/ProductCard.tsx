'use client';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product, useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-3xl transition-all duration-500"
    >
      {/* Product Image with Overlay */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 p-4 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addToCart(product)}
            className="bg-white text-purple-600 p-3 rounded-full shadow-lg hover:bg-purple-600 hover:text-white transition-all duration-300"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </motion.button>

         

          <Link href={`/products/${product.id}`} passHref>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-purple-600 p-3 rounded-full shadow-lg hover:bg-purple-600 hover:text-white transition-all duration-300"
              aria-label="View product"
            >
              <Eye className="h-5 w-5" />
            </motion.div>
          </Link>
        </div>

        {/* New Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
            New
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
          {product.category}
        </span>

        <h3 className="mt-2 text-lg font-bold text-gray-800 group-hover:text-purple-700 transition-colors duration-300 line-clamp-1">
          <Link href={`/products/${product.id}`} className="block">
            {product.name}
          </Link>
        </h3>

        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {product.description}
        </p>

        {/* Price & Add to Cart Button */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-extrabold text-purple-700">${product.price}</span>
            <span className="text-sm text-gray-400 line-through ml-2">
              ${(product.price * 1.2).toFixed(2)}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addToCart(product)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;