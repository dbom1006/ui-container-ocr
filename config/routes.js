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
                name: 'containers',
                path: '/sources/:id/containers',
                component: './sources/$id/containers',
              },
            ],
          },
        ],
      },
      {
        path: '/containers',
        name: 'containers',
        icon: 'carry-out',
        authority: ['admin'],
        routes: [
          {
            path: '/containers',
            component: './containers',
          },
          {
            name: 'detail',
            path: '/containers/:id',
            component: './containers/$id',
            hideInMenu: true,
          },
        ],
      },

      {
        component: '404',
        authority: ['admin'],
      },
    ],
  },
];
