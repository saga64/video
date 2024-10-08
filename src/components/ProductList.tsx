import React from 'react';
import { useQuery } from 'react-query';
import { Page, Card, ResourceList, ResourceItem, Thumbnail, Button } from '@shopify/polaris';
import { VideoIcon } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  image: {
    src: string;
  };
}

const fetchProducts = async (): Promise<Product[]> => {
  // Simulating API call
  return [
    { id: '1', title: 'Product 1', image: { src: 'https://via.placeholder.com/48' } },
    { id: '2', title: 'Product 2', image: { src: 'https://via.placeholder.com/48' } },
  ];
};

const ProductList: React.FC = () => {
  const { data: products, isLoading, isError } = useQuery<Product[]>('products', fetchProducts);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching products</div>;

  return (
    <Page title="Products">
      <Card>
        <ResourceList
          items={products || []}
          renderItem={(item: Product) => (
            <ResourceItem
              id={item.id}
              media={<Thumbnail source={item.image.src} alt={item.title} />}
              accessibilityLabel={`View details for ${item.title}`}
            >
              <h3>{item.title}</h3>
              <Button onClick={() => console.log(`Create video for ${item.id}`)}>
                <VideoIcon className="w-5 h-5 mr-2" />
                Create video from photos
              </Button>
            </ResourceItem>
          )}
        />
      </Card>
    </Page>
  );
};

export default ProductList;