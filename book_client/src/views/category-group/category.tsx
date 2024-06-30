import { useState, JSX } from 'react';
import Table from 'components/table/table';
import Slot from 'components/slot/slot';
import Input from 'components/form/form-control/input/input';
import Grid, { GridItem } from 'components/grid/grid';
import Form from 'components/form/form';
import useForm from 'hooks/useForm';
import { required, ValidateFunction, ValidateProcess } from 'utils';
import { CategoryService } from 'services';
import './style.scss';

type RuleTypeCompact = {
  [key: string]: {
    [key: string]: ValidateFunction | ValidateProcess;
  };
};

type RuleType = RuleTypeCompact & ArrayLike<RuleTypeCompact>;

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

  const fields = [
    {
      key: 'avatar'
    },
    {
      key: 'name'
    }
  ];

  const data = [
    {
      avatar: 'avatar',
      name: 'name1'
    },
    {
      name: 'name2'
    }
  ];

  const fileChange = (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      const images = Array.from((event.target as HTMLInputElement).files!).map((file) =>
        URL.createObjectURL(file)
      );
      setPreviewImage(images);
    }
  };

  const onSubmit = (formData: FormData) => {
    handleSubmit();
    if (!validate.error) {
      formData.append('query',
        'mutation CreateCategory($category: CategoryInput) { category { create (category:$category) { message } } }');
      CategoryService.graphql('create', formData).then(res => console.log(res)).catch(err => console.log(err));
    }
  };

  return (
    <Grid>
      <GridItem lg={9}>
        <Table fields={fields} data={data}>
          <Slot
            name="avatar"
            render={(slotProp) => <span style={{ color: 'red' }}>{slotProp.avatar}</span>}
          />
        </Table>
      </GridItem>
      <GridItem lg={3}>
        <Form className="category-form" submitLabel="Save" onSubmit={onSubmit}>
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
