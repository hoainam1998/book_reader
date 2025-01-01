import { AxiosResponse } from 'axios';
import { HTTP_CODE } from 'enums';
import { LoaderFunctionArgs, redirect } from 'react-router-dom';
import { UserService, RequestBody } from 'services';
import { showToast } from 'utils';

export const handlePromise = (promise: Promise<AxiosResponse>): Promise<AxiosResponse> => {
  return promise.then((res) => {
    res.data?.user?.add?.message && showToast('User', res.data.user.add.message);
    res.data?.user.delete?.message && showToast('User', res.data?.user.delete?.message);
    res.data?.user.update?.message && showToast('User', res.data?.user.update?.message);
    res.data?.user.updateMfaState?.message &&
      showToast('User', res.data?.user.updateMfaState?.message);
    return res;
  });
};

export const addUser = (formData: FormData): Promise<AxiosResponse> => {
  const query: string = `mutation AddUser($user: UserInformationInput) {
    user {
      add(user: $user) {
        message
      }
    }
  }`;
  formData.append('query', query);
  return handlePromise(UserService.graphql('add', formData));
};

export const updateMfaState = (userId: string, mfaEnable: boolean): Promise<AxiosResponse> => {
  const body: RequestBody = {
    query: `mutation UpdateMfaState($userId: ID!, $mfaEnable: Boolean!) {
      user {
        updateMfaState(userId: $userId, mfaEnable: $mfaEnable) {
          message
        }
      }
    }`,
    userId,
    mfaEnable
  };
  return handlePromise(UserService.graphql('update-mfa', body));
};

export const deleteUser = (userId: string): Promise<AxiosResponse> => {
  const body: RequestBody = {
    query: `mutation DeleteUser($userId: ID!) {
      user {
        delete(userId: $userId) {
          message
        }
      }
    }`,
    userId
  };
  return handlePromise(UserService.graphql('delete-user', body));
};

export const updateUser = (formData: FormData): Promise<AxiosResponse> => {
  const query: string = `
    mutation UpdateUser($user: UserInformationInput) {
      user {
        update(user: $user) {
          message
        }
      }
    }
  `;
  formData.append('query', query);
  return handlePromise(UserService.graphql('update-user', formData));
};

export const loadUserDetail = ({ params }: LoaderFunctionArgs): Promise<AxiosResponse> | null => {
  const userId: string | undefined = params.id;
  if (userId) {
    const body: RequestBody = {
      query: `query GetUserDetail($userId: ID!) {
      user {
        detail(userId: $userId) {
          firstName,
          lastName,
          email,
          avatar,
          mfaEnable
        }
      }
    }`,
      userId
    };
    return UserService.graphql('user-detail', body);
  }
  return null;
};

export const loadInitUser = async ({
  request
}: LoaderFunctionArgs): Promise<AxiosResponse | Response> => {
  const url: URL = new URL(request.url);
  const pageSize: number = parseInt(url.searchParams.get('pageSize') || '10');
  const pageNumber: number = parseInt(url.searchParams.get('pageNumber') || '1');
  const keyword: string = url.searchParams.get('keyword') || '';
  const body: RequestBody = {
    query: `query UserPagination($pageSize: Int, $pageNumber: Int, $keyword: String) {
      user {
        pagination (pageSize: $pageSize, pageNumber: $pageNumber, keyword: $keyword) {
          list {
            userId,
            name,
            avatar,
            email,
            mfaEnable
          },
          total
        }
      }
    }`,
    keyword,
    pageSize,
    pageNumber
  };
  try {
    const response = await UserService.graphql('pagination', body);
    return response;
  } catch (err: any) {
    if (err.response.status === HTTP_CODE.NOT_FOUND) {
      return redirect('new');
    }
    return err;
  }
};
