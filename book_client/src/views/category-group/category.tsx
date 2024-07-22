import { useState, useCallback, JSX } from 'react';
import { AxiosResponse } from 'axios';
import { useFetcher, useLoaderData, useRevalidator } from 'react-router-dom';
import Table from 'components/table/table';
import type { Field } from 'components/table/table';
import Slot from 'components/slot/slot';
import Input from 'components/form/form-control/input/input';
import Grid, { GridItem } from 'components/grid/grid';
import Form from 'components/form/form';
import Button from 'components/button/button';
import useForm from 'hooks/useForm';
import { required, ValidateFunction, ValidateProcess } from 'utils';
import {
  loadInitCategory,
  getCategoryDetail,
  createCategory,
  updateCategory,
  deleteCategory as _deleteCategory
} from './fetcher';
import './style.scss';

type RuleTypeCompact = {
  [key: string]: {
    [key: string]: ValidateFunction | ValidateProcess;
  };
};

type RuleType = RuleTypeCompact & ArrayLike<RuleTypeCompact>;

type CategoryDetail = { name: string; avatar: string };

type CategoryType = {
  category_id: string;
  disabled: boolean;
} & CategoryDetail;

const state = {
  categoryName: '',
  avatar: ''
};

let currentCategoryId: string = '';

const rules: RuleTypeCompact = {
  categoryName: { required: required('fff') },
  avatar: { required: required(() => !currentCategoryId) }
};

function Category(): JSX.Element {
  const { categoryName, avatar, handleSubmit, validate } = useForm(state, rules as RuleType);
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

  const fileChange = useCallback((event: Event): void => {
    const files = (event.target as HTMLInputElement).files;

    if (files) {
      const images = Array.from(files)
        .map((file) => URL.createObjectURL(file));
      setPreviewImage(images);
    }
  }, []);

  const reFetchCategory = useCallback((promise: Promise<AxiosResponse>): void => {
    promise.then(revalidator.revalidate);
  }, []);

  const onSubmit = useCallback((formData: FormData): void => {
    handleSubmit();

    if (!validate.error) {
      if (currentCategoryId) {
        formData.append('categoryId', currentCategoryId);
        reFetchCategory(updateCategory(formData));
      } else {
        reFetchCategory(createCategory(formData));
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
        state.categoryName = res.data.category.detail.name;
        setPreviewImage([res.data.category.detail.avatar]);
      });
  }, []);

  const deleteCategory = useCallback((categoryId: string): void => {
    reFetchCategory(_deleteCategory(categoryId));
  }, []);

  const operationSlot = useCallback((slotProp: CategoryType): JSX.Element => {
    const { category_id, disabled } = slotProp;

    return (
      <>
        <Button variant='success' onClick={() => fetchCategoryDetail(category_id)}>Update</Button>
          &nbsp;&nbsp;
        {!disabled && <Button variant='dangerous' onClick={() => deleteCategory(category_id)}>Delete</Button> }
      </>
    );
  }, []);

  return (
    <Grid>
      <GridItem lg={9}>
          <Table fields={fields} data={data} total={total} onLoad={fetchCategory}>
            <Slot name="avatar" render={
              (slotProp) => <img height="50px" width="50px" src={slotProp.avatar} alt="category-avatar"/>
            } />
            <Slot name="operation" render={operationSlot} />
          </Table>
      </GridItem>
      <GridItem lg={3}>
        <Form method="post" className="category-form" submitLabel="Save" onSubmit={onSubmit}>
          <Input
            label="Category name"
            className="category-form-control"
            name="name"
            type="text"
            {...categoryName}
          />
          <Input
            label="Avatar"
            className="category-form-control"
            name="avatar"
            onInput={fileChange}
            type="file"
            {...avatar}
          />
          <div className="image-preview">
            {previewImage.map((image, index) => <img key={index} src={image} alt="preview" />)}
          </div>
        </Form>
      </GridItem>
    </Grid>
  );
}

export default Category;
export { loadInitCategory };
