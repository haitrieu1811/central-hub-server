import { Router } from 'express'

import { registerController } from '~/controllers/users.controller'
import { registerValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handler'

const usersRouter = Router()

// Đăng ký tài khoản
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

export default usersRouter
