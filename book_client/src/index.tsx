import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import router from './router';
import { RouterProvider } from 'react-router-dom';
import LastNameNavigateBar from 'contexts/last-name-navigate-bar';
import ResponsiveScreenSize from 'contexts/responsive-screen-size';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

globalThis.isClient = process.env.APP_NAME === 'client';
globalThis.isAdmin = globalThis.isClient === false;

root.render(
  <React.StrictMode>
    <LastNameNavigateBar>
      <ResponsiveScreenSize>
        <RouterProvider router={router} />
      </ResponsiveScreenSize>
    </LastNameNavigateBar>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
