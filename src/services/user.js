import strapi from '@/utils/strapi';

export async function queryCurrent() {
  return strapi.request('get', '/users/me');
}
