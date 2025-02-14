import { JSX, useMemo } from 'react';
import './style.scss';
import { clsx } from 'utils';

export type ImageError = 'empty' | 'server-error' | 'server-disconnect' | 'bad-request';

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
