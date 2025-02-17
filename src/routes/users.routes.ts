import { Router } from 'express'

import { loginController, registerController } from '~/controllers/users.controller'
import { loginValidator, registerValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handler'

const usersRouter = Router()

// Đăng ký tài khoản
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

// Đăng nhập
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

export default usersRouter
