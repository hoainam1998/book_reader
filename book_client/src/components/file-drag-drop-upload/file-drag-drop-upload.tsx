import { DragEvent, JSX, useCallback, useState, useRef, ChangeEvent } from 'react';
import Input from 'components/form/form-control/input/input';
import './style.scss';

type InputFileRefType = {
  input: HTMLInputElement
};

function FileDragDropUpload(): JSX.Element {
  const [imageFileList, setImageFileList] = useState<File[]>([]);
  const fileInput = useRef<InputFileRefType>(null);

  const onDrag = useCallback((event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
  }, []);

  const onDrop = useCallback((event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();

    if (event.dataTransfer.files) {
      const files: File[] = Array.from(event.dataTransfer.files)
        .filter(file => file.type.includes('image'));
      setImageFileList(files);
    } else {
      setImageFileList([]);
    }
  }, []);

  const onOpenFileFolder = useCallback((): void => {
    fileInput.current!.input.click();
  }, [fileInput]);

  const onFileChanged = useCallback(<T, >(event: ChangeEvent<T | HTMLInputElement>): void => {
    const files: File[] = Array.from((event.target as HTMLInputElement).files || []);
    setImageFileList(files);
  }, []);

  const onDeleteFile = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number): void => {
    event.stopPropagation();
    imageFileList.splice(index, 1);
    setImageFileList([...imageFileList]);
  }, [imageFileList]);

  return (
    <div className="file-drag-drop-upload image-box" onDragOver={onDrag} onDrop={onDrop} onClick={onOpenFileFolder}>
      {imageFileList.length === 0 && <span className="placeholder">Please drag file into hear!</span>}
      <Input<InputFileRefType> type="file" name="html" label="HTML" multiple className="input-file-hidden" onChange={onFileChanged} ref={fileInput}/>
      <div className="image-preview-wrapper">
        {
          imageFileList.map((file, index) => (
            <div className="image-preview-item" key={index}>
              <img height="100%" width="100%" src={URL.createObjectURL(file)} alt="book-image" />
              <div className="delete-image" onClick={(e) => onDeleteFile(e, index)}>x</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default FileDragDropUpload;
