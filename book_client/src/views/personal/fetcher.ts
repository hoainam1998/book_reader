import { AxiosResponse } from 'axios';
import { UserService} from 'services';

export const updatePerson = (formData: FormData): Promise<AxiosResponse> => {
  return UserService.put('update-person', formData);
};
