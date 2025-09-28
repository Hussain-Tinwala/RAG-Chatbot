'use client'

import { Upload } from 'lucide-react'
import React from 'react'

const FileUpload = () => {
  const handleClick=()=>{
    const el=document.createElement('input')
    el.setAttribute('type', 'file')
    el.setAttribute('accept','application/pdf')
    el.addEventListener('change', (ev)=>{
      if(el.files && el.files.length>0){
        const file=el.files.item(0);
        // console.log(el.files);
      }
    })
    el.click();
  };

  return (
    <>
        <div className='bg-slate-900 text-white shadow-2xl flex justify-center items-center p-4 border-2 rounded-lg border-white'>
            <div 
            className='flex justify-center items-center flex-col'
            onClick={handleClick}
            >
            <h2>Upload PDF File</h2>
            <Upload />
            </div>
        </div>
    </>
  )
}

export default FileUpload