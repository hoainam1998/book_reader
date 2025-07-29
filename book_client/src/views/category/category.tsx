import { useState, useCallback, JSX, FormEvent } from 'react';
import { AxiosResponse } from 'axios';
import { useFetcher, useLoaderData, useRevalidator } from 'react-router-dom';
import Table from 'components/table/table';
import type { Field } from 'components/table/table';
import Slot from 'components/slot/slot';
import Input from 'components/form/form-control/input/input';
import Grid, { GridItem } from 'components/grid/grid';
import Form from 'components/form/form';
import Button from 'components/button/button';
import List from 'components/list/list';
import useForm, { RuleType } from 'hooks/useForm';
import { required } from 'hooks/useValidate';
import useFetchDataTable from 'hooks/useFetchDataTable';
import {
  loadInitCategory,
  getCategoryDetail,
  createCategory,
  updateCategory,
  deleteCategory as _deleteCategory
} from './fetcher';
import { convertBase64ToSingleFile, showToast } from 'utils';
import './style.scss';

export type CategoryDetailType = {
  name: string;
  avatar: string
};

type CategoryType = {
  categoryId: string;
  disabled: boolean;
} & CategoryDetailType;

type CategoryStateType = {
  categoryName: string;
  avatar: File | null;
};

const state: CategoryStateType = {
  categoryName: '',
  avatar: null
};

let currentCategoryId: string = '';
const formId: string = 'category-form';
let currentOffset: number = 0;

const rules: RuleType<CategoryStateType> = {
  categoryName: { required: required('fff') },
  avatar: { required: required(() => !currentCategoryId) }
};

function Category(): JSX.Element {
  const {
    categoryName,
    avatar,
    handleSubmit,
    validate,
    reset
  } = useForm<CategoryStateType, RuleType<CategoryStateType>>(state, rules, formId);
  const { fetch, fetcherData, pageSelected } = useFetchDataTable();
  const [previewImage, setPreviewImage] = useState<string[]>([]);
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const loaderData: unknown = fetcherData || useLoaderData();

  const fields: Field[] = [
    {
      key: 'avatar',
    },
    {
      key: 'name',
    },
    {
      key: 'operation',
      width: 150,
      style: {
        color: 'transparent',
        userSelect: 'none',
      }
    }
  ];

  const data: CategoryType[] = (loaderData as AxiosResponse)?.data?.list || [];
  const total: number = (loaderData as AxiosResponse)?.data?.total || 0;

  const fileChange = useCallback(<T, >(event: FormEvent<T>): void => {
    const files: FileList | null = (event.target as HTMLInputElement).files;

    if (files) {
      const images = Array.from(files)
        .map((file) => URL.createObjectURL(file));
      setPreviewImage(images);
    }
  }, []);

  const reFetchCategory
    = useCallback((promise: Promise<AxiosResponse>, title: string, reset?: () => void): Promise<AxiosResponse> => {
      return promise.then(response => {
        showToast(title, response.data.message);
        revalidator.revalidate();
        reset && reset();
        document.querySelector('.table-wrapper')?.scrollTo({ top: currentOffset });
        return response;
      })
      .catch((error) => {
        showToast(title, error.response.data.message);
        throw error;
      });
  }, []);

  const resetState = useCallback((): void => {
    currentCategoryId = '';
    setPreviewImage([]);
    reset();
  }, [reset]);

  const onSubmit = useCallback((formData: FormData): void => {
    handleSubmit();

    if (!validate.error) {
      if (currentCategoryId) {
        formData.append('categoryId', currentCategoryId);
        reFetchCategory(updateCategory(formData), 'Update category!', resetState);
      } else {
        reFetchCategory(createCategory(formData), 'Create category!', resetState);
      }
    }
  }, []);

  const fetchCategory = useCallback((pageSize: number, pageNumber: number): void => {
    fetch({ pageSize, pageNumber });
  }, [fetcher]);

  const fetchCategoryDetail = useCallback((categoryId: string): void => {
    currentCategoryId = categoryId;
    getCategoryDetail(categoryId)
      .then((res) => {
        convertBase64ToSingleFile(res.data.avatar, 'avatar')
          .then(image => avatar.watch([image]));
        categoryName?.watch(res.data.name);
        setPreviewImage([res.data.avatar]);
      })
      .catch((error) => showToast('Load category!', error.response.data.message));
  }, [categoryName]);

  const deleteCategory = useCallback((categoryId: string): void => {
    reFetchCategory(_deleteCategory(categoryId), 'Delete category!');
  }, []);

  const operationSlot = useCallback((slotProp: CategoryType): JSX.Element => {
    const { categoryId, disabled } = slotProp;

    const handleUpdateEvent = (e: any): void => {
      currentOffset = e.clientY;
      fetchCategoryDetail(categoryId);
    };

    return (
      <>
        <Button variant='success' onClick={handleUpdateEvent}>Update</Button>
          &nbsp;&nbsp;
        { !disabled && <Button variant='dangerous' onClick={() => deleteCategory(categoryId)}>Delete</Button> }
      </>
    );
  }, [categoryName]);

  return (
    <Grid>
      <GridItem sm={12} md={7} lg={9}>
        <Table
          fields={fields}
          classes="category-responsive-table"
          data={data}
          total={total}
          pageSelected={pageSelected}
          emptyMessage="Categories are not found!"
          onLoad={fetchCategory}>
            <Slot<CategoryType> name="avatar" render={
              (slotProp) => <img height="50px" width="50px" src={slotProp.avatar} alt="category-avatar"/>
            } />
            <Slot name="operation" render={operationSlot} />
        </Table>
      </GridItem>
      <GridItem sm={12} md={5} lg={3}>
        <Form id={formId} className="category-form" submitLabel="Save" onSubmit={onSubmit}>
          <Input
            label="Category name"
            className="category-form-control"
            inputClass="input-class"
            name="name"
            type="text"
            {...categoryName}
            labelColumnSize={{
              lg: 12
            }}
            inputColumnSize={{
              lg: 12
            }}
          />
          <Input
            label="Avatar"
            className="category-form-control"
            inputClass="input-class"
            name="avatar"
            onInput={fileChange}
            type="file"
            {...avatar}
            labelColumnSize={{
              lg: 12
            }}
            inputColumnSize={{
              lg: 12
            }}
          />
          <div className="image-preview" data-testid="image-preview">
            <List<string> items={previewImage} render={(image => (<img src={image} alt="preview" />)) } />
          </div>
        </Form>
      </GridItem>
    </Grid>
  );
}

export default Category;
export { loadInitCategory };
