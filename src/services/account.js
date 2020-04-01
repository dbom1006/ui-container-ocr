import strapi from '@/utils/strapi';

export async function accountLogin({ username, password, autoLogin = false }) {
  return strapi.login(username, password, autoLogin);
}