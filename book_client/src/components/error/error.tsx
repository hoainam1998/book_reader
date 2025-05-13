import { JSX, useMemo } from 'react';
import { clsx } from 'utils';
import './style.scss';

export type ImageError = 'empty' | 'server-error' | 'server-disconnect' | 'bad-request' | 'not-found';

type ErrorProps = {
  message: string;
  image: ImageError;
  center?: boolean;
};

function Error({ message, image, center }: ErrorProps): JSX.Element {
  const imagName: string = useMemo(() => `${image}.png`, [image]);

  return (
    <section className={clsx('error', center && 'absolute-center')}>
      <img height="200px" src={require(`images/${imagName}`)} alt={`${image}-icon`}/>
      <h1 className="error-description">{message}</h1>
    </section>
  );
}

export default Error;
