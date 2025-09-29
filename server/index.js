import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { Queue } from 'bullmq';

const app=express()
app.use(cors())

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  }
})

const upload=multer({storage: storage})

// Queue Setup
const fileProcessingQueue = new Queue('pdf-processing', {
  connection: { host: '127.0.0.1', port: 6379 }
});


app.get('/', (req, res)=>{
    return res.json({status:"Perfect"})
})

// app.post('/upload/pdf', upload.single('pdf'), (req, res)=>{
//     return res.json({message: 'uploaded'})
// })

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was uploaded.' });
  }

  await fileProcessingQueue.add('process-pdf', {
    filePath: req.file.path
  });

  console.log(`File queued for processing: ${req.file.path}`);

  return res.json({
    message: 'File uploaded and is now queued for processing.'
  })
})

app.listen(3001, ()=>{
    console.log(`Server is running on port: 3001`)
})