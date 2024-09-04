import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@instasync/ui/components/theme-provider';
import { Toaster } from '@instasync/ui/ui/sonner';
import { ThemeToggle } from '@instasync/ui/components/theme-toggle';
import { router } from '@/router';
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loading } from './pages/Loading';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000
    }
  }
});

function App() {
  const [hideThemeToggle, setHideThemeToggle] = useState(true);

  // for testing diff users on mobile browser
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (
      searchParams.get('clear') === 'true' ||
      searchParams.get('clear') === '1'
    ) {
      localStorage.clear();
      location.href = location.pathname;
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <div
          className="absolute bottom-4 left-1 w-[30px] h-[30px]"
          onDoubleClick={() => setHideThemeToggle((prev) => !prev)}
        >
          <div hidden={hideThemeToggle}>
            <ThemeToggle />
          </div>
        </div>

        <RouterProvider router={router} />

        <Toaster position="top-center" duration={3000} />
        <Loading />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
