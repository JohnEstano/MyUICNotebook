import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

type ImageDropzoneProps = {
  onFileUpload: (file: File) => void;
};

const ImageDropzone = ({ onFileUpload }: ImageDropzoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] } // Updated to object notation
  });

  return (
    <div
      {...getRootProps()}
      className="border border-dashed p-4 text-center rounded-md cursor-pointer"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the image here ...</p>
      ) : (
        <p>Drag 'n' drop an image here, or click to select one</p>
      )}
    </div>
  );
};

export default ImageDropzone;
