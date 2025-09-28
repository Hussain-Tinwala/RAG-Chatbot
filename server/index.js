import express from 'express'
import cors from 'cors'
import multer from 'multer'


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

const app=express()
app.use(cors())

app.get('/', (req, res)=>{
    return res.json({status:"Perfect"})
})

app.post('/upload/pdf', upload.single('pdf'), (req, res)=>{
    return res.json({message: 'uploaded'})
})
app.listen(3001, ()=>{
    console.log(`Server is running on port: 3001`)
})