import { JSX } from 'react';
import { useRouteError } from 'react-router-dom';
import { AxiosError } from 'axios';
import Error from 'components/error/error';

type AxiosErrorResponse = {
  msg: string;
};

type ImageError = 'empty' | 'server-error' | 'server-disconnect';

function ApiError(): JSX.Element {
  const error = useRouteError() as AxiosError;
  let image: 'empty' | 'server-error' | 'server-disconnect' = 'empty';
  let message: string = '';

  if (error.code === 'ERR_NETWORK') {
    image = 'server-disconnect';
    message = 'Server disconnect. Please contact my admin!';
  } else {
    switch(error.response?.status) {
      case 500: image = 'server-error'; break;
      default: image = 'empty'; break;
    }
    message = (error.response?.data as AxiosErrorResponse)?.msg || '';
  }

  return (<Error<ImageError> image={image} message={message} />);
}

export default ApiError;
