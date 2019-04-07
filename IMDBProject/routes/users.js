const express = require('express')
const router = require('express-promise-router')();

const UsersController = require('../controllers/users')

router.route('/')
.get(UsersController.index)
.post(UsersController.newUser)