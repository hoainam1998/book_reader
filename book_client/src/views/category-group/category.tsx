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
import {
  loadInitCategory,
  getCategoryDetail,
  createCategory,
  updateCategory,
  deleteCategory as _deleteCategory
} from './fetcher';
import './style.scss';

type CategoryDetailType = {
  name: string;
  avatar: string
};

type CategoryType = {
  category_id: string;
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
  const [previewImage, setPreviewImage] = useState<string[]>([]);
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const loaderData: unknown = fetcher.data || useLoaderData();

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

  const data: CategoryType[] = (loaderData as AxiosResponse)?.data?.category.pagination?.list || [];
  const total: number = (loaderData as AxiosResponse)?.data?.category.pagination?.total || 0;

  const fileChange = useCallback(<T, >(event: FormEvent<T>): void => {
    const files: FileList | null = (event.target as HTMLInputElement).files;

    if (files) {
      const images = Array.from(files)
        .map((file) => URL.createObjectURL(file));
      setPreviewImage(images);
    }
  }, []);

  const reFetchCategory = useCallback((promise: Promise<AxiosResponse>): Promise<AxiosResponse> => {
    return promise.then(res => {
      revalidator.revalidate();
      document.querySelector('.table-wrapper')?.scrollTo({top: currentOffset });
      return Promise.resolve(res);
    }).catch(err => Promise.reject(err));
  }, []);

  const resetState = useCallback((): void => {
    currentCategoryId = '';
    setPreviewImage([]);
    reset();
  }, []);

  const onSubmit = useCallback((formData: FormData): void => {
    handleSubmit();

    if (!validate.error) {
      if (currentCategoryId) {
        formData.append('categoryId', currentCategoryId);
        reFetchCategory(updateCategory(formData)).then(resetState);
      } else {
        reFetchCategory(createCategory(formData)).then(resetState);
      }
    }
  }, []);

  const fetchCategory = useCallback((pageSize: number, pageNumber: number): void => {
    fetcher.submit({ pageSize, pageNumber });
  }, []);

  const fetchCategoryDetail = useCallback((categoryId: string): void => {
    currentCategoryId = categoryId;
    getCategoryDetail(categoryId)
      .then(res => {
        categoryName.watch(res.data.category.detail.name);
        setPreviewImage([res.data.category.detail.avatar]);
      });
  }, []);

  const deleteCategory = useCallback((categoryId: string): void => {
    reFetchCategory(_deleteCategory(categoryId));
  }, []);

  const operationSlot = useCallback((slotProp: CategoryType): JSX.Element => {
    const { category_id, disabled } = slotProp;

    const handleUpdateEvent = (e: any): void => {
      currentOffset = e.clientY;
      fetchCategoryDetail(category_id);
    };

    return (
      <>
        <Button variant='success' onClick={handleUpdateEvent}>Update</Button>
          &nbsp;&nbsp;
        { !disabled && <Button variant='dangerous' onClick={() => deleteCategory(category_id)}>Delete</Button> }
      </>
    );
  }, []);

  return (
    <Grid>
      <GridItem sm={12} md={7} lg={9}>
        <Table fields={fields} classes="category-responsive-table" data={data} total={total} onLoad={fetchCategory}>
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
