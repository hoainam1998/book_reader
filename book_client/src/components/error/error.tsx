import { JSX, useMemo } from 'react';
import './style.scss';

type ErrorProps<T> = {
  message: string;
  image: T;
};

function Error<T>({ message, image }: ErrorProps<T>): JSX.Element {
  const imagName: string = useMemo(() => `${image}.png`, [image]);

  return (
    <section className="error">
      <img height="200px" src={require(`images/${imagName}`)} alt={`${image}-icon`}/>
      <h1>{message}</h1>
    </section>
  );
}

export default Error;
