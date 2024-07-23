import { JSX } from 'react';
import './style.scss';

function Loading(): JSX.Element {
  return (
    <section className="loading">
      <img className="loading-icon" src={require('images/icons/loading.png')} alt="loading" />
    </section>
  );
}

export default Loading;
