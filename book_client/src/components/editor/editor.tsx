import { JSX, useCallback, useEffect } from 'react';
import useInitEditor from 'hooks/useInitEditor';
import FormControl, { FormControlProps } from 'components/form/form-control/form-control';
import { FieldValidateProps } from 'hooks/useForm';
import { clsx } from 'utils';
import './style.scss';
const editorId = 'editor';

type EditorPropsType = {
  className?: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string) => void;
  placeholder?: string;
}
& FormControlProps
& Omit<Partial<FieldValidateProps<string>>, 'onInput' | 'onChange' | 'options'>;

function Editor({
  name,
  label,
  className,
  inputColumnSize,
  labelColumnSize,
  errors,
  error,
  placeholder,
  value,
  onChange,
  onFocus
  }: EditorPropsType): JSX.Element {
  const { quill } = useInitEditor(editorId, placeholder);

  const editorOnChange = useCallback(() => {
    (quill?.getLength()! > 1) ? onChange!(quill?.getSemanticHTML()!) : onChange('');
  }, [quill]);

  useEffect(() => {
    quill?.on('text-change', () => {
      editorOnChange();
    });

    quill?.on('selection-change', () => {
      onFocus!();
    });
  }, [quill]);

  return (
    <FormControl
      name={name}
      label={label}
      inputColumnSize={inputColumnSize}
      labelColumnSize={labelColumnSize}
      errors={errors}>
        <div className={clsx({ 'error-input': error }, 'editor')}>
          <div id={editorId} className={className} />
          <input type="hidden" name={`${name}Html`} value={value} />
          { quill && <input type="hidden" name={`${name}Json`} value={JSON.stringify(quill.getContents())} /> }
        </div>
    </FormControl>
  );
}

export default Editor;
