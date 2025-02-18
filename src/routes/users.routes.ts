import { Router } from 'express'

import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController
} from '~/controllers/users.controller'
import { loginValidator, refreshTokenValidator, registerValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handler'

const usersRouter = Router()

// Đăng ký tài khoản
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

// Đăng nhập
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

// Đăng xuất
usersRouter.post('/logout', refreshTokenValidator, wrapRequestHandler(logoutController))

// Refresh token
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

export default usersRouter
