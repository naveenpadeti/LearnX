import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 100MB limit
    }
}).single('file');

export default upload;