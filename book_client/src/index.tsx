import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import router from './router';
import {
  RouterProvider,
} from 'react-router-dom';
import LastNameNavigateBar from 'contexts/last-name-navigate-bar';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <LastNameNavigateBar>
      <RouterProvider router={router} />
    </LastNameNavigateBar>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
