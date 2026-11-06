import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Dữ liệu còn mới trong 5 phút
      gcTime: 1000 * 60 * 30,    // Giữ cache trong 30 phút
      retry: 1,                  // Thử lại 1 lần nếu lỗi mạng
      refetchOnWindowFocus: false, // Không tự refetch khi chuyển tab
    },
  },
});

