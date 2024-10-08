import React from 'react';
import { useParams } from 'react-router-dom';
import { Page, Card } from '@shopify/polaris';
import { useQuery } from 'react-query';
import axios from 'axios';

interface Product {
  id: string;
  title: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

const fetchProduct = async (productId: string): Promise<Product> => {
  // Replace with actual API call to fetch product details
  const response = await axios.get(`/api/products/${productId}`);
  return response.data;
};

const VideoPlayer: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { data: product, isLoading } = useQuery(['product', productId], () => fetchProduct(productId!));

  if (isLoading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <Page title={`Video for ${product.title}`}>
      <Card>
        {product.videoUrl ? (
          <video
            src={product.videoUrl}
            controls
            className="w-full"
            poster={product.thumbnailUrl}
          />
        ) : (
          <p>No video available for this product.</p>
        )}
      </Card>
    </Page>
  );
};

export default VideoPlayer;