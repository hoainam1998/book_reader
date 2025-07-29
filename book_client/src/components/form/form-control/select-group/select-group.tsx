import {
  JSX,
  useCallback,
  useState,
  cloneElement,
  useLayoutEffect,
  useMemo,
  ReactNode,
  useEffect,
} from 'react';
import FormControl, { FormControlProps } from 'components/form/form-control/form-control';
import { FieldValidateProps } from 'hooks/useForm';
import List from 'components/list/list';
import Button from 'components/button/button';
import { clsx, stringRandom as id } from 'utils';
import './style.scss';

type SelectGroupPropsType<T>= {
  items: T[];
  placeholder: string;
  labelField?: string;
  valueField?: string;
  values: string[],
  max?: number;
  onChange: <V>(value: V[]) => void;
  onFocus: () => void;
  showingElement: (props: T) => JSX.Element;
} & FieldValidateProps<T>
& Omit<FormControlProps, 'children' | 'options'>;;

type OptionType<T> = {
  value: string,
  label: string,
  disabled?: boolean,
  origin?: T,
};

type OptionsType<T> = OptionType<T>[];

type SelectionItemPropsType<T> = {
  value?: string;
  options?: OptionsType<T>;
  id?: string;
  optionSelected?: OptionType<T>;
  remove?: () => void;
  updateOptionSelected?: (option: OptionType<T>) => void;
  deleteOptionSelected?: () => void;
};

function SelectGroup<T>({
  items,
  name,
  label,
  values,
  errors,
  max,
  placeholder,
  labelField,
  valueField,
  inputColumnSize,
  labelColumnSize,
  showingElement,
  onFocus,
  onChange,
}: SelectGroupPropsType<T>): JSX.Element {
  const [optionSelected, setOptionSelected] = useState<Map<string, OptionType<T>>>(new Map([]));

  const optionsWithPlaceHolder = useMemo<OptionsType<T>>(() => {
    if (items.length) {
      const valueIndex = (valueField || 'value') as keyof T;
      const labelIndex = (labelField || 'label') as keyof T;

      return [
        {
          label: `-- ${placeholder} --`,
          value: '',
          disabled: true,
        },
        ...items.map((item: T) => ({
            value: item[valueIndex] as string,
            label: item[labelIndex] as string,
            disabled: false,
            origin: item,
        }))
      ];
    }

    return [];
  }, [items, placeholder, valueField, labelField]);

  const SelectionItem = ({
    options,
    optionSelected,
    remove,
    updateOptionSelected,
    deleteOptionSelected,
  }: SelectionItemPropsType<T>): JSX.Element => {
    const [selectedValue, setSelectedValue] = useState<string>('');
    const [selectedProps, setSelectedProps] = useState<T | null>(null);
    const [isShowSelection, setIsShowSelection] = useState<boolean>(true);

    const haveOnlyOneValue = useMemo<boolean>(() => {
      return (options || []).length === 2;
    }, [options]);

    const onSelectValue = useCallback((option: OptionType<T>): void => {
      const { value, origin } = option;
      setSelectedValue(value);
      setSelectedProps(origin!);
      setIsShowSelection(false);
    }, []);

    const deleteSelectItem = useCallback((event: any): void => {
      event.preventDefault();
      remove!();
      deleteOptionSelected!();
      onFocus();
    }, [remove]);

    const onSelectChange = useCallback((event: any): void => {
      event.preventDefault();

      onFocus();
      if (options) {
        const optionSelected = options[event.target.selectedIndex];
        onSelectValue(optionSelected);
        updateOptionSelected!(optionSelected);
      }
    }, [options]);

    const showingElementClone = useCallback((): JSX.Element => {
      if (selectedProps) {
        return cloneElement(
          showingElement(selectedProps),
          {
            ...haveOnlyOneValue
            ? {}
            : {
              onClick: () => {
                setIsShowSelection(true);
                onFocus();
              }
            }
          }
        );
      }
      return <></>;
    }, [selectedProps, haveOnlyOneValue]);

    useLayoutEffect(() => {
      if (optionSelected) {
        onSelectValue(optionSelected);
      } else if (options && haveOnlyOneValue) {
        onSelectValue(options[1]);
        updateOptionSelected!(options[1]);
      }
    }, [optionSelected, options, haveOnlyOneValue, updateOptionSelected]);

    return (
      <li className="select-group-wrapper">
        {
          isShowSelection
          ? <div className="select-wrapper select-size">
              <select name={name}
                className={clsx('select custom-input', { 'placeholder': !selectedValue })}
                onChange={onSelectChange} value={selectedValue as string}>
                <List<OptionType<T>> items={options || []} render={({ value, label, disabled }) => (
                  <option value={value as string} disabled={disabled}>{label}</option>
                )} />
              </select>
            </div>
          : showingElementClone()
        }
        <input type="hidden" name={name} value={selectedValue} />
        <Button variant="dangerous" className="del-select-item" onClick={deleteSelectItem}>&#10005;</Button>
      </li>
    );
  };

  const [selectItems, setSelectItems] = useState<ReturnType<typeof SelectionItem>[]>([]);

  const labelWithMaxLength = useMemo((): ReactNode => {
    if (max) {
      return (
        <>
          {label}
          <span className="label-with-length">{`${selectItems.length}/${max}`}</span>
        </>
      );
    }
    return label;
  }, [label, max, selectItems]);

  const canNotAddMore = useMemo<boolean>(
    () => selectItems.length > 0 && selectItems.length === items.length,
    [selectItems, items]);

  const canNotClear = useMemo<boolean>(() => optionSelected.size === 0, [optionSelected.size]);

  const onOptionChanged = useCallback((): void => {
    onChange(Array.from(optionSelected.values()).map(o => o.value));
  }, [optionSelected]);

  const addItem = useCallback((event: any): void => {
    event.preventDefault();
    setSelectItems([...selectItems, <SelectionItem id={id()} />]);
    onFocus();
  }, [selectItems]);

  const clear = useCallback((event: any): void => {
    event.preventDefault();
    setSelectItems([<SelectionItem id={id()} />]);
    optionSelected.clear();
    setOptionSelected(optionSelected);
    onFocus();
  }, []);

  const removeItem = useCallback((idx: number): () => void => {
    return () => {
      setSelectItems(selectItems.filter((_, index) => index !== idx));
      onFocus();
    };
  }, [selectItems]);

  const filteringOptionItem = useCallback((optionSelect?: OptionType<T>) => {
    const ops = optionSelect || { value: undefined };
    return optionsWithPlaceHolder.filter((option) => {
      return option.value === ops.value || Array.from(optionSelected.values()).every((o) => o.value !== option.value);
    });
  }, [optionsWithPlaceHolder, optionSelected]);

  const deleteOptionSelected = useCallback((idx: string): () => void => {
    return () => {
      optionSelected.delete(idx);
      setOptionSelected(optionSelected);
      onOptionChanged();
    };
  },[optionSelected]);

  const updateOptionSelected = useCallback((idx: string): (option: OptionType<T>) => void => {
    return (option) => {
      optionSelected.set(idx, option);
      setOptionSelected(optionSelected);
      onOptionChanged();
    };
  }, [optionSelected]);

  const selectItemClone = useCallback(
    (el: JSX.Element, idx: number): JSX.Element => {
      const id = el.props.id;
      const option = optionSelected.get(id);

      return cloneElement(el, {
        optionSelected: option,
        id,
        options: filteringOptionItem(option),
        remove: removeItem(idx),
        updateOptionSelected: updateOptionSelected(id),
        deleteOptionSelected: deleteOptionSelected(id),
      });
    },
    [selectItems, values, optionSelected]);

  useEffect((): void => {
    if (items.length) {
      setSelectItems([<SelectionItem />]);
    }
  }, [items, optionsWithPlaceHolder]);

  useEffect((): void => {
    let valuesMapWithItems = values;
    if (selectItems.length !== values.length && selectItems.length > 0) {
      valuesMapWithItems = selectItems.map((_, index) => values[index]);
    }

    if (values.length && optionsWithPlaceHolder.length && valuesMapWithItems.length) {
      const { selectedItems, optionsSelected }
        = valuesMapWithItems.reduce<{ selectedItems: JSX.Element[], optionsSelected: Map<string, OptionType<T>> }>
        ((mappingObject, value, index) => {
          const option = optionsWithPlaceHolder.find((o) => o.value === value);
          if (option) {
            const selectItemId = id();
            mappingObject.selectedItems.push(<SelectionItem id={selectItemId} />);
            mappingObject.optionsSelected.set(selectItemId, option);
          } else {
            if (selectItems[index]) {
              mappingObject.selectedItems.push(selectItems[index]);
            }
          }
          return mappingObject;
      }, { selectedItems: [], optionsSelected: new Map<string, OptionType<T>>([]) });

      setOptionSelected(optionsSelected);
      setSelectItems(selectedItems);
    }
  }, [values, optionsWithPlaceHolder]);

  return (
    <FormControl
      name={name}
      label={labelWithMaxLength}
      errors={errors}
      inputColumnSize={inputColumnSize}
      labelColumnSize={labelColumnSize}>
        <div className="select-group">
          <Button variant='success' disabled={canNotAddMore} onClick={addItem}>Add</Button>
          <Button variant='dangerous' className="clear" disabled={canNotClear} onClick={clear}>Clear</Button>
          <ul className="select-list">
            <List<JSX.Element> items={selectItems} render={selectItemClone} />
          </ul>
        </div>
    </FormControl>
  );
}

export default SelectGroup;
