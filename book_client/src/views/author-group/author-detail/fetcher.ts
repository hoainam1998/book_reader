import { AxiosResponse } from 'axios';
import { AuthorService } from 'services';

const createAuthor = (formData: FormData): Promise<AxiosResponse> => {
  return AuthorService.post('create-author', formData);
};

export {
  createAuthor
};
