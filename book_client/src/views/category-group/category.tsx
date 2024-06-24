import Table from 'components/table/table';
import Slot from 'components/slot/slot';
import Input from 'components/form/form-control/input/input';
import Grid, { GridItem } from 'components/grid/grid';
import Form from 'components/form/form';
import useForm from 'hooks/useForm';
import { required, ValidateFunction, ValidateProcess } from 'utils';
import './style.scss';

type RuleTypeCompact = {
  [key: string]: {
    [key: string]: ValidateFunction | ValidateProcess;
  }
};

type RuleType = RuleTypeCompact & ArrayLike<RuleTypeCompact>;

const state = {
  categoryName: '',
  avatar: '',
};

const rules: RuleTypeCompact = {
  categoryName: { required: required('fff') },
  avatar: { required },
};

function Category(): JSX.Element {
  const { categoryName, avatar, handleSubmit } = useForm(state, rules as RuleType);
  const fields = [
    {
      key: 'avatar',
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

  return (
    <Grid>
      <GridItem lg={9}>
        <Table fields={fields} data={data}>
          <Slot name="avatar" render={(slotProp) => <span style={{ color: 'red' }}>{slotProp.avatar}</span>} />
        </Table>
      </GridItem>
      <GridItem lg={3}>
        <Form id="category-form" className="category-form" submitLabel="Save" submit={handleSubmit}>
          <Input label="Category name" className="category-form-control" name="category_name" type="text" {...categoryName} />
          <Input label="Avatar" className="category-form-control" name="avatar" type="file" {...avatar} />
        </Form>
      </GridItem>
    </Grid>
  );
}

export default Category;
