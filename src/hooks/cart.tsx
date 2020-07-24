import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storageProducts) {
        setProducts([...JSON.parse(storageProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const isSameProduct = ({ id }: Product): boolean => id === product.id;
      const productExist = products.find(isSameProduct);
      let storageProducts: Product[] = [];
      if (productExist) {
        storageProducts = products.map(oneProduct =>
          isSameProduct(oneProduct)
            ? { ...oneProduct, quantity: oneProduct.quantity + 1 }
            : oneProduct,
        );
        setProducts(storageProducts);
      } else {
        storageProducts = [...products, { ...product, quantity: 1 }];
        setProducts(storageProducts);
      }
      console.log(storageProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(storageProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const isSameProduct = (product: Product): boolean => product.id === id;
      const product = products.find(isSameProduct);
      let storageProducts: Product[] = [];
      if (product) {
        storageProducts = products.map(oneProduct =>
          isSameProduct(oneProduct)
            ? { ...oneProduct, quantity: oneProduct.quantity + 1 }
            : oneProduct,
        );
        setProducts(storageProducts);
      } else {
        throw Error('Erro ao incrementar. tente novamente');
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(storageProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const isSameProduct = (product: Product): boolean => product.id === id;
      const product = products.find(isSameProduct);
      let storageProducts: Product[] = [];
      if (product && product.quantity !== 1) {
        storageProducts = products.map(oneProduct =>
          isSameProduct(oneProduct)
            ? { ...oneProduct, quantity: oneProduct.quantity - 1 }
            : oneProduct,
        );
        setProducts(storageProducts);
      } else if (product && product.quantity === 1) {
        storageProducts = [
          ...products.filter(oneProduct => oneProduct.id !== product.id),
        ];
        setProducts(storageProducts);
      } else {
        throw Error('Erro ao incrementar. tente novamente');
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(storageProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
