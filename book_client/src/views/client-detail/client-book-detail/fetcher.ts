import { AxiosResponse } from 'axios';
import { BookService } from 'services';

export const getBookDetail = (bookId: string): Promise<AxiosResponse> => {
  return BookService.post('detail', {
    query: {
      name: true,
      pdf: true,
      publishedTime: true,
      publishedDay: true,
      category: {
        categoryId: true,
        name: true,
      },
      images: {
        image: true,
        name: true
      },
      authors: {
        authorId: true,
        name: true,
        avatar: true,
      },
      introduce: {
        html: true,
      }
    },
    bookId,
  });
};
