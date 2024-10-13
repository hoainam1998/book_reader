import { AxiosResponse } from 'axios';
import { UserService } from 'services';
import { showToast } from 'utils';

export const updatePerson = (formData: FormData): Promise<AxiosResponse> => {
  return UserService.graphql('update-person', formData)
    .then((res) => {
      showToast('Personal', res.data.message);
      return res;
    })
    .catch((err) => {
      showToast('Personal', err.response.data.message);
      return err;
    });
};
