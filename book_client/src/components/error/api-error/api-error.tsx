import { JSX } from 'react';
import { useRouteError } from 'react-router-dom';
import { AxiosError } from 'axios';
import Error from 'components/error/error';

type AxiosErrorResponse = {
  msg: string;
};

function ApiError(): JSX.Element {
  const error = useRouteError() as AxiosError;
  let image: 'empty' | 'server-error' = 'empty';

  switch(error.response?.status) {
    case 500: image = 'server-error'; break;
    default: image = 'empty'; break;
  }

  return (
    <Error image={image} message={(error.response?.data as AxiosErrorResponse).msg } />
  );
}

export default ApiError;
