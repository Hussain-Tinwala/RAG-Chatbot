'use client'

import { Upload } from 'lucide-react'
import React from 'react'

const FileUpload = () => {
  return (
    <>
        <div className='bg-slate-900 text-white shadow-2xl flex justify-center items-center p-4 border-2 rounded-lg border-white'>
            <div className='flex justify-center items-center flex-col'>
            <h2>Upload PDF File</h2>
            <Upload />
            </div>
        </div>
    </>
  )
}

export default FileUpload