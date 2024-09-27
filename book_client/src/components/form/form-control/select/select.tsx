import { Children, ReactElement, JSX, useMemo } from 'react';
import { isSlot } from 'components/slot/slot';
import FormControl from 'components/form/form-control/form-control';
import { FieldValidateProps } from 'hooks/useForm';
import { clsx } from 'utils';
import './style.scss';

export type OptionPrototype<T> = {
  class?: string;
  value?: T ;
  label?: string;
  disabled?: boolean;
};

type OptionType<T, R> = (OptionPrototype<T> & R)[];

type SelectPropsType<T, R> = {
  options: OptionType<T, R>;
  placeholder?: string;
  valueField?: keyof R;
  labelField?: keyof R;
  children?: ReactElement;
  name: string;
  className?: string;
  labelClass?: string;
  selectClass?: string;
  label?: string;
  onChange: (value: T) => void;
} & Omit<Partial<FieldValidateProps<T>>, 'onChange'>;

function Select<T extends string | number | readonly string[] | undefined, R extends OptionPrototype<T> = {}>
({
  options,
  placeholder,
  labelField,
  valueField ,
  children,
  name,
  value,
  label,
  className,
  labelClass,
  selectClass,
  error = false,
  errors = [],
  onChange
}: SelectPropsType<T, R>): JSX.Element {
  const hasChildren: boolean = Children.count(children) > 0;
  const optionSlot : ReactElement | undefined | null = hasChildren ? Children.only(children) : null;

  const optionsFormatted: OptionType<T, R> = useMemo(() => {
    if (placeholder) {
      return [
        {
          [labelField || 'label']: `-- ${placeholder} --`,
          [valueField || 'value']: '',
          disabled: true
        } as R,
        ...options
      ];
    }
    return options;
  }, [placeholder]);

  return (
    <FormControl name={name} label={label || ''} labelClass={labelClass} className={className} errors={errors}>
      <div className={clsx('select-wrapper', selectClass)}>
        <select name={name} id={name} className={clsx('select custom-input', { 'error-input': error, 'placeholder': !value })}
          value={value} onChange={(event) => onChange(event.target.value as T)} data-testid="select">
          {
            optionsFormatted.map((option, index) =>
              <option
                data-testid={`option-${index + 1}`}
                key={index}
                value={option[valueField || 'value'] as T}
                className={option.class}
                disabled={option.disabled}>
                  {
                    hasChildren && isSlot('default', optionSlot)
                    ? optionSlot!.props.render(option)
                    : option[labelField || 'label']
                  }
              </option>)
          }
        </select>
      </div>
    </FormControl>
  );
}

export default Select;
