export type UserType = 'guitarist' | 'bassist'

export interface User {
  id: string
  email: string
  username: string
  userType: UserType
  avatar_url?: string
  message?: string
}
