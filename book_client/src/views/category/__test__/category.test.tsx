import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom';
import Category from '../category';
import DataTransfer from './data-tranfer.mock';
import { createCategory, getCategoryDetail, updateCategory } from '../fetcher';

const generateTestingData = (total: number): any => {
  const list = Array.apply(null, Array(total)).map((_, index) => ({
    name: 'name',
    avatar: 'avatar',
    // eslint-disable-next-line camelcase
    category_id: index + 1,
    disabled: true
  }));
  return {
    data: {
      category: {
        pagination: {
          list,
          total
        }
      }
    }
  };
};

const responseData = {
  data: {
    category: {
      create: {
        message: 'message'
      }
    }
  }
};

const generateFile = (): Promise<File> => {
  return fetch('https://fakeimg.pl/300/')
    .then((res) => res.blob())
    .then((blob) => new File([blob], 'image', { type: 'image/png' }));
};

jest.mock('services', () => {
  const { CategoryService, BookService } = jest.requireActual('services');
  CategoryService.post = jest.fn().mockResolvedValue(responseData);
  return {
    __esModule: true,
    CategoryService,
    BookService
  };
});

jest.mock('../fetcher', () => {
  const fetcher = jest.requireActual('../fetcher');
  const categoryResponseData = {
    data: {
      category: {
        detail: {
          name: 'category name',
          avatar: 'avatar'
        }
      }
    }
  };
  return {
    __esModule: true,
    ...fetcher,
    createCategory: jest.fn().mockResolvedValue(responseData),
    getCategoryDetail: jest.fn().mockResolvedValue(categoryResponseData),
    updateCategory: jest.fn().mockImplementation(() => fetcher.handlePromise(Promise.resolve(
      {
        data: {
          category: {
            update: {
              message: 'message'
            }
          }
        }
    }))),
  };
});

jest.mock('store/auth', () => {
  return {
    __esModule: true,
    ApiKey: 'api key'
  };
});

describe('Category.test', () => {
  global.URL.createObjectURL = jest.fn();
  (global.DataTransfer as typeof DataTransfer) = DataTransfer;
  HTMLElement.prototype.scrollTo = () => {};
  jest.spyOn(React, 'useCallback').mockImplementation((cb) => cb);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('categories should render when api call success', async () => {
    const mockResponse = generateTestingData(10);
    const loadFn = jest.fn().mockResolvedValue(mockResponse);
    const router = createBrowserRouter(
      createRoutesFromElements(<Route path="/" loader={loadFn} element={<Category />} />)
    );

    render(<RouterProvider router={router} />);
    const rows = await screen.findAllByRole('row');
    expect(rows.length).toBeGreaterThan(1);
  });

  it('category list should update when page size change', async () => {
    const mockResponse = generateTestingData(10);
    const loadFn = jest.fn().mockResolvedValue(mockResponse);
    const router = createBrowserRouter(
      createRoutesFromElements(<Route path="/" loader={loadFn} element={<Category />} />)
    );

    render(<RouterProvider router={router} />);

    const select = await waitFor(() => screen.getByTestId('select'));
    act(() => fireEvent.change(select, { target: { value: 30 } }));
    const rows = await screen.findAllByRole('row');
    expect(loadFn).toHaveBeenCalled();
    expect(loadFn).toHaveBeenCalledTimes(2);
    expect((screen.getByTestId('option-2') as HTMLOptionElement).selected).toBeTruthy();
    expect(rows.length).toBeGreaterThan(2);
  });

  it('category list should update when pagination button click', async () => {
    const mockResponse = generateTestingData(20);
    const loadFn = jest.fn().mockResolvedValue(mockResponse);
    const router = createBrowserRouter(
      createRoutesFromElements(<Route path="/" loader={loadFn} element={<Category />} />)
    );

    render(<RouterProvider router={router} />);
    const select = await waitFor(() => screen.getByTestId('select'));
    act(() => fireEvent.change(select, { target: { value: 10 } }));

    const paginationItems = await waitFor(() => screen.getByTestId('pagination-button-2'));
    act(() => fireEvent.click(paginationItems!.childNodes[0]));
    const rows = await screen.findAllByRole('row');
    expect(loadFn).toHaveBeenCalled();
    expect(loadFn).toHaveBeenCalledTimes(3);
    expect(
      (paginationItems!.childNodes[0] as HTMLButtonElement).classList.contains('active')
    ).toBeTruthy();
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it('input should have border error when they are invalid', async () => {
    const router = createBrowserRouter(
      createRoutesFromElements(<Route path="/" element={<Category />} />)
    );

    render(<RouterProvider router={router} />);
    const inputName = screen.getByTestId('input-name');
    const data = await generateFile();

    act(() => fireEvent.focus(inputName));

    act(() => fireEvent.change(inputName, { target: { value: 'value' } }));

    act(() => fireEvent.change(inputName, { target: { value: '' } }));

    expect(inputName.classList.contains('error-input')).toBeTruthy();

    const inputAvatar = screen.getByTestId('input-avatar');

    act(() => fireEvent.focus(inputAvatar));

    act(() => fireEvent.change(inputAvatar, { target: { files: [data] } }));

    act(() => fireEvent.change(inputAvatar, { target: { files: null } }));

    expect(inputAvatar.classList.contains('error-input')).toBeTruthy();
  });

  it('input should have border error when they are invalid and save button clicked', async () => {
    const router = createBrowserRouter(
      createRoutesFromElements(<Route path="/" element={<Category />} />)
    );

    render(<RouterProvider router={router} />);

    const inputName = screen.getByTestId('input-name');
    const inputAvatar = screen.getByTestId('input-avatar');
    const submit = screen.getByText(/save/i);
    const data = await generateFile();

    act(() => fireEvent.change(inputAvatar, { target: { files: null } }));
    act(() => fireEvent.change(inputName, { target: { value: '' } }));

    act(() => fireEvent.click(submit));

    await waitFor(() => {
      expect(inputName.classList.contains('error-input')).toBeTruthy();
      expect(inputAvatar.classList.contains('error-input')).toBeTruthy();
    });

    act(() => fireEvent.change(inputAvatar, { target: { files: [data] } }));
    act(() => fireEvent.change(inputName, { target: { value: 'value' } }));

    act(() => fireEvent.click(submit));

    await waitFor(() => {
      expect(inputName.classList.contains('error-input')).toBeFalsy();
      expect(inputAvatar.classList.contains('error-input')).toBeFalsy();
    });
  });

  it('api call success when all data valid and save button clicked', async () => {
    const router = createBrowserRouter(
      createRoutesFromElements(<Route path="/" element={<Category />} />)
    );

    render(<RouterProvider router={router} />);

    const inputName = screen.getByTestId('input-name');
    const inputAvatar = screen.getByTestId('input-avatar');
    const submit = screen.getByText(/save/i);
    const data = await generateFile();

    act(() => fireEvent.change(inputAvatar, { target: { files: [data] } }));
    act(() => fireEvent.change(inputName, { target: { value: 'value' } }));

    act(() => fireEvent.click(submit));

    await waitFor(() => {
      expect(createCategory).toHaveBeenCalled();
    });
  });

  it('image preview should show image when value input file changed', async () => {
    const router = createBrowserRouter(
      createRoutesFromElements(<Route path="/" element={<Category />} />)
    );

    render(<RouterProvider router={router} />);
    const inputAvatar = screen.getByTestId('input-avatar');
    const data = await generateFile();
    const imagePreview = screen.getByTestId(/image-preview/i);

    act(() => fireEvent.input(inputAvatar, { target: { files: [data] } }));

    await waitFor(() => expect(imagePreview.childNodes).toHaveLength(1));
  });

  it('image preview should show image when value input file changed', async () => {
    const router = createBrowserRouter(
      createRoutesFromElements(<Route path="/" element={<Category />} />)
    );

    render(<RouterProvider router={router} />);
    const inputAvatar = screen.getByTestId('input-avatar');
    const data = await generateFile();
    const imagePreview = screen.getByTestId(/image-preview/i);

    act(() => fireEvent.input(inputAvatar, { target: { files: [data] } }));

    await waitFor(() => expect(imagePreview.childNodes).toHaveLength(1));
  });

  it('category detail information should show update button clicked', async () => {
    const mockResponse = generateTestingData(10);
    const loadFn = jest.fn().mockResolvedValue(mockResponse);
    const router = createBrowserRouter(
      createRoutesFromElements(<Route path="/" loader={loadFn} element={<Category />} />)
    );

    render(<RouterProvider router={router} />);
    const updateButton = await screen.findAllByText(/update/i);
    act(() => updateButton[0].click());
    expect(getCategoryDetail).toHaveBeenCalledTimes(1);

    const inputName = screen.getByTestId('input-name');
    const imagePreview = screen.getByTestId(/image-preview/i);

    await waitFor(() => {
      expect((inputName as HTMLInputElement).value).toBeTruthy();
      expect(imagePreview.childNodes).toHaveLength(1);
    });
  });

  it('update category api call success and show toast', async () => {
    const mockResponse = generateTestingData(10);
    const loadFn = jest.fn().mockResolvedValue(mockResponse);
    const router = createBrowserRouter(
      createRoutesFromElements(<Route path="/" loader={loadFn} element={<Category />} />)
    );

    render(<RouterProvider router={router} />);
    const updateButton = await screen.findAllByText(/update/i);
    const submit = screen.getByText(/save/i);
    act(() => fireEvent.click(updateButton[0]));
    await waitFor(() => expect(getCategoryDetail).toHaveBeenCalledTimes(1));

    act(() => fireEvent.click(submit));
    await waitFor(() => expect(updateCategory).toHaveBeenCalledTimes(1));

    await waitFor(() => {
      const toast = screen.getByTestId('toast');
      expect(toast).toBeVisible();
    });
  });
});
