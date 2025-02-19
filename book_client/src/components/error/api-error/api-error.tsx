import { JSX } from 'react';
import { useRouteError } from 'react-router-dom';
import { AxiosError } from 'axios';
import Error, { ImageError } from 'components/error/error';

type ErrorResponseType = {
  message: string;
};

type ApiErrorPropsType = {
  alignCenter?: boolean;
};

function ApiError({ alignCenter }: ApiErrorPropsType): JSX.Element {
  const error = useRouteError() as AxiosError;
  let image: ImageError = 'empty';
  let message: string = '';

  if (error instanceof AxiosError) {
    if (error.code === 'ERR_NETWORK') {
      image = 'server-disconnect';
      message = 'Server disconnect. Please contact my admin!';
    } else {
      switch(error.response?.status) {
        case 500: image = 'server-error'; break;
        case 400: image = 'bad-request'; break;
        default: image = 'empty'; break;
      }
      message = (error.response?.data as ErrorResponseType)?.message || '';
    }
  } else {
    throw error;
  }

  return (<Error center={alignCenter} image={image} message={message} />);
}

export default ApiError;
