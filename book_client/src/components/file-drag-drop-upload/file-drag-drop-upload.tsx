import {
  DragEvent,
  JSX,
  useCallback,
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  useImperativeHandle,
  forwardRef,
  Ref
} from 'react';
import Input, { InputRefType } from 'components/form/form-control/input/input';
import FormControl from 'components/form/form-control/form-control';
import { clsx } from 'utils';
import { FieldValidateProps } from 'hooks/useForm';
import './style.scss';

type ImageFileListType = {
  files: File[];
};

type FileDragDropUploadType = {
  className?: string;
  name: string;
  label: string;
} & FieldValidateProps<File[]>;

function FileDragDropUpload({
  className,
  name,
  value,
  errors,
  error,
  label,
  onChange
}: FileDragDropUploadType, ref: Ref<ImageFileListType>): JSX.Element {
  const [imageFileList, setImageFileList] = useState<File[]>([]);
  const fileInput = useRef<InputRefType>(null);

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
    onChange(files);
  }, []);

  const onOpenFileFolder = useCallback((): void => {
    fileInput.current!.input!.click();
  }, [fileInput]);

  const onFileChanged = useCallback(<T, >(event: ChangeEvent<T | HTMLInputElement>): void => {
    const files: File[] = Array.from((event.target as HTMLInputElement).files || []);
    setImageFileList(files);
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

  useEffect(() => {
    if (value) {
      setImageFileList(value);
      if (fileInput.current) {
        const dataTransfer = new DataTransfer();
        value.map(v => dataTransfer.items.add(v));
        fileInput.current.input!.files = dataTransfer.files;
      }
    }
  }, [value]);

  return (
    <FormControl label={label} name={name} errors={errors}>
      <div className={clsx('file-drag-drop-upload image-box', className, { 'error-box': error })}
        onDragOver={onDrag}
        onDrop={onDrop}
        onClick={onOpenFileFolder}>
          {imageFileList && imageFileList.length === 0 && <span className="placeholder">Please drag file into hear!</span>}
          <Input type="file" name={name} label={label} multiple className="input-file-hidden" onChange={onFileChanged} ref={fileInput}/>
          <div className="image-preview-wrapper">
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
