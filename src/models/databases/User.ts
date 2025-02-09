import { ObjectId } from 'mongodb'

import { UserRole, UserStatus, UserVerifyStatus } from '~/constants/enum'
import { generateRandomString } from '~/utils/helpers'

type UserContructor = {
  _id?: ObjectId
  email: string
  password: string
  fullName?: string
  avatar?: ObjectId
  phoneNumber?: string
  verifyStatus?: UserVerifyStatus
  status?: UserStatus
  role: UserRole
  verifyEmailToken?: string
  forgotPasswordToken?: string
  createdAt?: Date
  updatedAt?: Date
}

class User {
  _id?: ObjectId
  email: string
  password: string
  fullName: string
  avatar: ObjectId | null
  phoneNumber: string
  verifyStatus: UserVerifyStatus
  status: UserStatus
  role: UserRole
  verifyEmailToken: string
  forgotPasswordToken: string
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    email,
    password,
    fullName,
    avatar,
    phoneNumber,
    verifyStatus,
    status,
    role,
    verifyEmailToken,
    forgotPasswordToken,
    createdAt,
    updatedAt
  }: UserContructor) {
    const date = new Date()
    this._id = _id
    this.email = email
    this.password = password
    this.avatar = avatar || null
    this.fullName = fullName || `Temp${generateRandomString(6)}`
    this.phoneNumber = phoneNumber || ''
    this.verifyStatus = verifyStatus || UserVerifyStatus.Unverified
    this.status = status || UserStatus.Active
    this.role = role
    this.verifyEmailToken = verifyEmailToken || ''
    this.forgotPasswordToken = forgotPasswordToken || ''
    this.createdAt = createdAt || date
    this.updatedAt = updatedAt || date
  }
}

export default User
