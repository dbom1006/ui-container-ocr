export default [
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      {
        path: '/user',
        redirect: '/user/login',
      },
      {
        name: 'login',
        path: '/user/login',
        component: './user/login',
      },
      {
        component: '404',
      },
    ],
  },
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      {
        path: '/',
        redirect: '/sources',
        authority: ['admin'],
      },
      {
        path: '/sources',
        name: 'sources',
        icon: 'video-camera',
        authority: ['admin'],
        routes: [
          {
            path: '/sources',
            component: './sources',
          },
          {
            name: 'detail',
            path: '/sources/:id',
            component: './sources/$id',
            hideInMenu: true,
            routes: [
              {
                name: 'info',
                path: '/sources/:id/detail',
                component: './sources/$id/info',
              },
              {
                name: 'checkin',
                path: '/sources/:id/checkin',
                component: './sources/$id/checkin',
              },
            ],
          },
        ],
      },
      {
        path: '/checkin',
        name: 'checkin',
        icon: 'clock-circle',
        authority: ['admin'],
        routes: [
          {
            path: '/checkin',
            component: './checkin',
          },
          {
            name: 'detail',
            path: '/checkin/:id',
            component: './checkin/$id',
            hideInMenu: true,
          },
        ],
      },
      {
        path: '/timekeeping',
        name: 'timekeeping',
        icon: 'carry-out',
        authority: ['admin'],
        component: './timekeeping',
      },
      {
        path: '/setting',
        name: 'setting',
        icon: 'setting',
        authority: ['admin'],
        component: './setting',
      },
      {
        component: '404',
        authority: ['admin'],
      },
    ],
  },
];
