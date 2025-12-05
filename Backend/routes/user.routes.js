const express = require('express');

const userRouter = express.Router();
const {getUser , updateAssistant, askToAssistant} = require('../controllers/user.controller');
const { isAuth } = require('../middlewares/isAuth');
const upload = require('../middlewares/multer');




userRouter.get('/current',isAuth, getUser);
userRouter.post('/update', isAuth,upload.single("assistantImage") ,updateAssistant);
userRouter.post('/asktoassistant' , isAuth , askToAssistant);


module.exports = userRouter;

