import { common } from './common'
import { header } from './header'
import { home } from './home'
import { login } from './login'
import { nearbyDeals } from './nearby-deals'
import { profile } from './profile'
import { register } from './register'

export const hi = {
  ...common,
  ...header,
  ...home,
  ...login,
  ...nearbyDeals,
  ...profile,
  ...register,
}
