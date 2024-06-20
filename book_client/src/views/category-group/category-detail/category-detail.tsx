import Input from 'components/form/form-control/input/input';
import useForm from 'hooks/useForm';
import { required, ValidateFunction, ValidateProcess } from 'utils';

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

function CategoryDetail(): JSX.Element {
  const { categoryName, avatar, handleSubmit, validate } = useForm(state, rules as RuleType);

  return (
    <>
      <Input name="category_name" type="text" {...categoryName} />
      <Input name="avatar" type="file" {...avatar} />
      <button onClick={handleSubmit}>submit</button>
    </>
  );
}

export default CategoryDetail;
