import React, {
  DragEvent,
  JSX,
  useCallback,
  useMemo,
  useState,
  useRef,
  ChangeEvent,
  useImperativeHandle,
  forwardRef,
  Ref,
  ReactNode,
  useLayoutEffect
} from 'react';
import Input, { InputRefType } from 'components/form/form-control/input/input';
import FormControl, { FormControlProps } from 'components/form/form-control/form-control';
import { clsx } from 'utils';
import { FieldValidateProps } from 'hooks/useForm';
import './style.scss';

type ImageFileListType = {
  files: File[];
};

type FileDragDropUploadType = {
  multiple?: boolean;
  max?: number;
}
& FieldValidateProps<File[]>
& Omit<FormControlProps, 'children'>;

function FileDragDropUpload({
  className,
  name,
  value,
  errors,
  error,
  label,
  multiple,
  max,
  labelColumnSize,
  inputColumnSize,
  onFocus,
  onChange
}: FileDragDropUploadType, ref: Ref<ImageFileListType>): JSX.Element {
  const [imageFileList, setImageFileList] = useState<File[]>([]);
  const fileInput = useRef<InputRefType>(null);

  const multiSelectFlag = useMemo((): boolean => {
    return multiple ? true : (multiple === undefined ? true: false);
  }, [multiple]);

  const labelWithMaxLength = useMemo((): ReactNode => {
    if (max) {
      return (
        <>
          {label}
          <span className="label-with-length">{`${imageFileList.length}/${max}`}</span>
        </>
      );
    }
    return label;
  }, [label, max, imageFileList]);

  const onDrag = useCallback((event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
  }, []);

  const onDrop = useCallback((event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    let files: File[] = [];

    if (event.dataTransfer.files) {
      files = Array.from(event.dataTransfer.files)
        .filter(file => file.type.includes('image'));
    }

    setImageFileList(files);
    onFocus();
    onChange(files);
  }, []);

  const onOpenFileFolder = useCallback((): void => {
    fileInput.current!.input!.click();
  }, [fileInput]);

  const onFileChanged = useCallback(<T, >(event: ChangeEvent<T | HTMLInputElement>): void => {
    const files: File[] = Array.from((event.target as HTMLInputElement).files || []);
    setImageFileList(files);
    onFocus();
    onChange(files);
  }, []);

  const onDeleteFile = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number): void => {
    event.stopPropagation();
    imageFileList.splice(index, 1);
    const imageFileListNewest: File[] = [...imageFileList];
    setImageFileList(imageFileListNewest);
    onChange(imageFileListNewest);
    if (fileInput) {
      fileInput.current!.input!.value = '';
    }
  }, [imageFileList]);

  useImperativeHandle(ref, (): ImageFileListType => ({ files: imageFileList }), [imageFileList]);

  useLayoutEffect(() => {
    if (value) {
      if (Array.isArray(value)) {
        setImageFileList(value);
      } else {
        setImageFileList([value]);
      }
    }
  }, [value]);

  return (
    <FormControl
      label={labelWithMaxLength}
      name={name}
      errors={errors}
      inputColumnSize={inputColumnSize}
      labelColumnSize={labelColumnSize}>
        <div className={clsx('file-drag-drop-upload image-box', className, { 'error-box': error })}
          onDragOver={onDrag}
          onDrop={onDrop}
          onClick={onOpenFileFolder}>
            {imageFileList && imageFileList.length === 0 && <span className="placeholder">
              Please drag file into hear!
            </span>}
            <Input
              type="file"
              name={name}
              label={label}
              value={value}
              multiple={multiSelectFlag}
              className="input-file-hidden"
              onChange={onFileChanged}
              ref={fileInput} />
            <div className={clsx({
              'multiple-image-preview-wrapper': multiSelectFlag,
              'single-image-preview-wrapper': !multiSelectFlag
              })}>
              {
                imageFileList && imageFileList.map((file, index) => (
                  <div className="image-preview-item" key={index}>
                    <img height="100%" width="100%" src={URL.createObjectURL(file)} alt="book-image" />
                    <div className="delete-image" onClick={(e) => onDeleteFile(e, index)}>x</div>
                  </div>
                ))
              }
            </div>
        </div>
    </FormControl>
  );
}

export default forwardRef(FileDragDropUpload);
