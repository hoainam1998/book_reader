import { useState, JSX } from 'react';
import { AxiosResponse } from 'axios';
import { useSubmit, useFetcher, useLoaderData } from 'react-router-dom';
import Table from 'components/table/table';
import type { Field } from 'components/table/table';
import Slot from 'components/slot/slot';
import Input from 'components/form/form-control/input/input';
import Grid, { GridItem } from 'components/grid/grid';
import Form from 'components/form/form';
import Button from 'components/button/button';
import useForm from 'hooks/useForm';
import { required, ValidateFunction, ValidateProcess } from 'utils';
import { action, loader } from './fetcher';
import './style.scss';

type RuleTypeCompact = {
  [key: string]: {
    [key: string]: ValidateFunction | ValidateProcess;
  };
};

type RuleType = RuleTypeCompact & ArrayLike<RuleTypeCompact>;

type CategoryType = {
  category_id: string;
  name: string;
  avatar: string;
};

const state = {
  categoryName: '',
  avatar: ''
};

const rules: RuleTypeCompact = {
  categoryName: { required: required('fff') },
  avatar: { required }
};

function Category(): JSX.Element {
  const { categoryName, avatar, handleSubmit, validate } = useForm(state, rules as RuleType);
  const [previewImage, setPreviewImage] = useState<string[]>([]);
  const submit = useSubmit();
  const fetcher = useFetcher();
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
      style: {
        width: 150
      }
    }
  ];

  const data: CategoryType[] = (loaderData as AxiosResponse)?.data?.category.pagination.list || [];
  const total: number = (loaderData as AxiosResponse)?.data?.category.pagination.total || 0;

  const fileChange = (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      const images = Array.from(files)
        .map((file) => URL.createObjectURL(file));
      setPreviewImage(images);
    }
  };

  const onSubmit = (formData: FormData) => {
    handleSubmit();
    if (!validate.error) {
      submit(formData, {
        method: 'post',
        encType: 'multipart/form-data'
      });
    }
  };

  const fetchCategory = (pageSize: number, pageNumber: number) => {
    fetcher.submit({ pageSize, pageNumber },
    {
      method: 'get',
    });
  };

  const operationSlot = (slotProp: CategoryType) => {
    const { category_id } = slotProp;
    return (
      <>
        <Button variant='success' onClick={() => console.log(category_id)}>Update</Button>
          &nbsp;&nbsp;
        <Button variant='dangerous' onClick={() => console.log(category_id)}>Delete</Button>
      </>
    );
  };

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
            {previewImage.map((image, index) => (
              <img key={index} src={image} alt="preview" />
            ))}
          </div>
        </Form>
      </GridItem>
    </Grid>
  );
}

export default Category;

export { action, loader };
