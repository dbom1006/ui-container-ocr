/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

const isUrl = path => reg.test(path);

export const isBrowser = () => typeof window !== 'undefined';

export const urlToList = url => {
  if (!url || url === '/') {
    return ['/'];
  }
  const urlList = url.split('/').filter(i => i);
  return urlList.map((urlItem, index) => `/${urlList.slice(0, index + 1).join('/')}`);
};

const isAntDesignPro = () => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }

  return window.location.hostname === 'preview.pro.ant.design';
}; // 给官方演示站点用，用于关闭真实开发环境不需要使用的特性

const isAntDesignProOrDev = () => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV === 'development') {
    return true;
  }

  return isAntDesignPro();
};
// export const convertFilter = x => x;
export const convertFilter = filters =>
  Object.keys(filters)
    .map(x => {
      const value = filters[x];
      if (Array.isArray(value)) return { key: x, value: value[0] };
      return { key: x, value };
    })
    .reduce((acc, cur) => {
      acc[cur.key] = cur.value;
      return acc;
    }, {});

export { isAntDesignProOrDev, isAntDesignPro, isUrl };

export const round2 = num => +`${Math.round(`${num}e+2`)}e-2`;

export const getBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

export const displayFullName = (firstName='', lastName='') =>
  firstName.concat(' ', lastName || '').trim() || lastName;
