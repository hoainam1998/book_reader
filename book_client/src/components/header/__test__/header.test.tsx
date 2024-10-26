import Header from '../header';
import { render, screen } from '@testing-library/react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';

jest.mock('storage', () => {
  return {
    __esModule: true,
    UserStorage: {
      getItem: jest.fn(() => ({
        name: 'name',
        email: 'email@gmail.com',
        avatar: 'avatar',
        mfaEnable: true,
        password: 'namkho@19'
      }))
    }
  };
});

describe('Header', () => {
  it('header should render correctly', () => {
    const router = createBrowserRouter(
      createRoutesFromElements(<Route path="/" element={<Header />} />)
    );
    render(<RouterProvider router={router} />);
    const name = screen.getByTestId('name');
    const email = screen.getByTestId('email');
    expect(name.textContent).toBe('name');
    expect(email.textContent).toBe('email@gmail.com');
  });
});
