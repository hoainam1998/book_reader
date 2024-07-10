import { JSX } from 'react';
import './style.scss';

type NotFoundProps = {
  name: string;
};

function NotFound({ name }: NotFoundProps): JSX.Element {
  return (
    <section className="not-found">
      <img src={require('images/folder.png')} alt="empty-icon"/>
      <h1>{name} is empty!</h1>
    </section>
  );
}

export default NotFound;
