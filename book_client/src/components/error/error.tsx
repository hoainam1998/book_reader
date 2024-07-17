import { JSX, useMemo } from 'react';
import './style.scss';

type ErrorProps = {
  message: string;
  image: 'empty' | 'server-error';
};

function Error({ message, image }: ErrorProps): JSX.Element {
  const imagName = useMemo(() => {
    switch(image) {
      case 'empty': return 'folder.png';
      default: return 'server.png';
    }
  }, [image]);

  return (
    <section className="error">
      <img height="200px" src={require(`images/${imagName}`)} alt={`${image}-icon`}/>
      <h1>{message}</h1>
    </section>
  );
}

export default Error;
