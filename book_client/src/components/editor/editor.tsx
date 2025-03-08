import { JSX, useCallback, useEffect } from 'react';
import useInitEditor from 'hooks/useInitEditor';
import FormControl, { FormControlProps } from 'components/form/form-control/form-control';
import { FieldValidateProps } from 'hooks/useForm';
import useComponentDidMount from 'hooks/useComponentDidMount';
import { HaveLoadedFnType } from 'interfaces';
import { clsx } from 'utils';
import './style.scss';
import { Op } from 'quill/core';
const editorId: string = 'editor';

type EditorPropsType = {
  className?: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string) => void;
  placeholder?: string;
  json?: Promise<Op[]>;
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
  json,
  onChange,
  onFocus
  }: EditorPropsType): JSX.Element {
  const { quill } = useInitEditor(editorId, placeholder);

  const editorOnChange = useCallback(() => {
    (quill?.getLength()! > 1) ? onChange!(quill?.getSemanticHTML()!) : onChange('');
  }, [quill]);

  useEffect(() => {
    quill?.on('text-change', editorOnChange);
    quill?.on('selection-change', onFocus!);
  }, [quill]);

  useComponentDidMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (!haveFetched()) {
        if (json && quill) {
          json.then(jsonContent => quill?.setContents(jsonContent));
        }
      }
    };
  }, [json, quill]);

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
