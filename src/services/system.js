/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-underscore-dangle */
import strapi from '@/utils/strapi';

export async function getSystemConfig() {
  return strapi.getEntries('system-config');
}

export async function updateSystemConfig(data) {
  return strapi.request('PUT', '/system-config', { data });
}
