import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import ProductList from './components/ProductList';
import VideoPlayer from './components/VideoPlayer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider i18n={enTranslations}>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route path="/" element={<ProductList />} />
              <Route path="/video/:productId" element={<VideoPlayer />} />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;