import React from 'react';
import { useRouter } from 'next/router';
import Product from '../../client/src/pages/product';

export default function ProductPage() {
  const router = useRouter();
  const { barcode } = router.query;

  if (!barcode || typeof barcode !== 'string') {
    return <div>Loading...</div>;
  }

  return <Product params={{ barcode }} />;
}