import { JSX, useMemo } from 'react';
import './style.scss';

export type ImageError = 'empty' | 'server-error' | 'server-disconnect';

type ErrorProps = {
  message: string;
  image: ImageError;
};

function Error({ message, image }: ErrorProps): JSX.Element {
  const imagName: string = useMemo(() => `${image}.png`, [image]);

  return (
    <section className="error">
      <img height="200px" src={require(`images/${imagName}`)} alt={`${image}-icon`}/>
      <h1>{message}</h1>
    </section>
  );
}

export default Error;
