'use client'

import { Upload } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useCallback } from 'react'

const FileUpload = () => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      alert("Please upload a file.");
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      console.log('Uploading file...');
      const response = await fetch('http://localhost:3001/upload/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed.');
      }

      const data = await response.json();
      console.log('File upload successful:', data.message);
      alert('File uploaded successfully! It is now being processed.');
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred during file upload.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'] }, // Only accept PDF files
    multiple: false,
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div 
        {...getRootProps()} 
        className={`border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col
                    ${isDragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 text-blue-500" />
        {isDragActive ? (
          <p className="mt-2 text-sm text-slate-600">Drop the PDF to upload!</p>
        ) : (
          <p className="mt-2 text-sm text-slate-400">Drag 'n' drop a PDF here, or click to select</p>
        )}
      </div>
    </div>
  )
}

export default FileUpload