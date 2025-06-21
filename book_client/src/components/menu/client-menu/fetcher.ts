import { AxiosResponse } from 'axios';
import { AuthorService, CategoryService } from 'services';

export const getMenuItem = (): Promise<AxiosResponse[]> => {
  const getCategoryItems = CategoryService.KeepAlive.NotFoundAccepted.post('menu', {
    query: {
      avatar: true,
      categoryId: true,
      name: true,
    }
  });

  const getAuthorItems = AuthorService.KeepAlive.NotFoundAccepted.post('menu', {
    query: {
      avatar: true,
      authorId: true,
      name: true,
    }
  });

  return Promise.all([getAuthorItems, getCategoryItems]);
};
