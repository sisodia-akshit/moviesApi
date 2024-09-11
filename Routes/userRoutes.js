const express = require('express');
const router = express.Router();

const authController = require('./../Controller/authController.js')
const userController = require('./../Controller/userController.js')

router.route('/getAllUsers').get(authController.protect, userController.getAllUsers);

router.route('/profile').get(authController.protect, userController.profile);

router.route('/updatePassword').patch(authController.protect,userController.updatePassword);

router.route('/updateMe').patch(authController.protect,userController.updateMe);

router.route('/deleteMe').delete(authController.protect,userController.deleteMe);



module.exports = router;
