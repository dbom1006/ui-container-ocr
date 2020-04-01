import './PortalLayout.less';

import React, { useState } from 'react';
import { BreadcrumbProps as AntdBreadcrumbProps } from 'antd/es/breadcrumb';
import { ContainerQuery } from 'react-container-query';
import DocumentTitle from 'react-document-title';
import { Layout, Spin } from 'antd';
import classNames from 'classnames';
import useMedia from 'react-media-hook2';
import warning from 'warning';

import { getBreadcrumbProps } from '@ant-design/pro-layout/lib/utils/getBreadcrumbProps';
import { getPageTitle, RouteContext, getMenuData } from '@ant-design/pro-layout';
import { isBrowser } from '@/utils/utils';
import SiderMenu from '@/components/SiderMenu';

const { Content } = Layout;

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};

const renderSiderMenu = (props) => {
  const { layout, isMobile, menuRender } = props;
  if (props.menuRender === false) {
    return null;
  }
  if (layout === 'topmenu' && !isMobile) {
    return null;
  }
  if (menuRender) {
    return menuRender(props, <SiderMenu {...props} />);
  }

  return <SiderMenu {...props} {...props.menuProps} />;
};

const defaultPageTitleRender = (pageProps, props) => {
  const { pageTitleRender } = props;
  if (pageTitleRender === false) {
    return props.title || '';
  }
  if (pageTitleRender) {
    const title = pageTitleRender(pageProps);
    if (typeof title === 'string') {
      return title;
    }
    warning(
      typeof title === 'string',
      'pro-layout: renderPageTitle return value should be a string',
    );
  }
  return getPageTitle(pageProps);
};

function useCollapsed(collapsed, onCollapse) {
  warning(
    (collapsed === undefined) === (onCollapse === undefined),
    'pro-layout: onCollapse and collapsed should exist simultaneously',
  );

  const [nativeCollapsed, setCollapsed] = useState(false);
  if (collapsed !== undefined && onCollapse) {
    return [collapsed, onCollapse];
  }
  if (collapsed !== undefined && !onCollapse) {
    return [collapsed, undefined];
  }
  if (collapsed === undefined && onCollapse) {
    return [undefined, onCollapse];
  }
  return [nativeCollapsed, setCollapsed];
}

const getPaddingLeft = (hasLeftPadding, collapsed, siderWidth) => {
  if (hasLeftPadding) {
    return collapsed ? 80 : siderWidth;
  }
  return undefined;
};

const PortalLayout = (props) => {
  const {
    children,
    onCollapse: propsOnCollapse,
    location = { pathname: '/' },
    fixedHeader,
    fixSiderbar,
    navTheme,
    layout: PropsLayout,
    route = {
      routes: [],
    },
    siderWidth = 256,
    menu,
    menuDataRender,
    loading,
  } = props;

  const formatMessage = ({ id, defaultMessage, ...rest }) => {
    if (props.formatMessage) {
      return props.formatMessage({
        id,
        defaultMessage,
        ...rest,
      });
    }
    const locales = getLocales();
    if (locales[id]) {
      return locales[id];
    }
    if (defaultMessage) {
      return defaultMessage;
    }
    return id;
  };

  const { routes = [] } = route;
  const { breadcrumb, menuData } = getMenuData(routes, menu, formatMessage, menuDataRender);
  /**
   * init variables
   */
  const isMobile =
    useMedia({
      id: 'PortalLayout',
      query: '(max-width: 599px)',
      targetWindow: window || {
        matchMedia: () => true,
      },
    })[0] && !props.disableMobile;

  // If it is a fix menu, calculate padding
  // don't need padding in phone mode
  const hasLeftPadding = fixSiderbar && PropsLayout !== 'topmenu' && !isMobile;

  // whether to close the menu
  const [collapsed, onCollapse] = useCollapsed(props.collapsed, propsOnCollapse);

  // Splicing parameters, adding menuData and formatMessage in props
  const defaultProps = {
    ...props,
    formatMessage,
    breadcrumb,
  };

  // gen page title
  const pageTitle = defaultPageTitleRender(
    {
      pathname: location.pathname,
      ...defaultProps,
    },
    props,
  );

  // gen breadcrumbProps, parameter for pageHeader
  const breadcrumbProps = getBreadcrumbProps({
    ...props,
    breadcrumb,
  });

  return (
    <DocumentTitle title={pageTitle}>
      <ContainerQuery query={query}>
        {params => (
          <div className={classNames(params, 'ant-design-pro', 'portalLayout')}>
            <Layout>
              {renderSiderMenu({
                ...defaultProps,
                menuData,
                onCollapse,
                isMobile,
                theme: navTheme,
                collapsed,
              })}
              <Layout
                style={{
                  paddingLeft: getPaddingLeft(!!hasLeftPadding, collapsed, siderWidth),
                  minHeight: '100vh',
                }}
              >
                <Content
                  className="ant-pro-portalLayout-content"
                  style={!fixedHeader ? { paddingTop: 0 } : {}}
                >
                  <RouteContext.Provider
                    value={{
                      breadcrumb: breadcrumbProps,
                      ...props,
                      menuData,
                      isMobile,
                      collapsed,
                      title: pageTitle.split('-')[0].trim(),
                    }}
                  >
                    {loading ? (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          margin: 'auto',
                          paddingTop: 50,
                          textAlign: 'center',
                        }}
                      >
                        <Spin size="large" />
                      </div>
                    ) : (
                      children
                    )}
                  </RouteContext.Provider>
                </Content>
              </Layout>
            </Layout>
          </div>
        )}
      </ContainerQuery>
    </DocumentTitle>
  );
};

PortalLayout.defaultProps = {
  logo: 'https://gw.alipayobjects.com/zos/antfincdn/PmY%24TNNDBI/logo.svg',
  location: isBrowser() ? window.location : undefined,
};
export default PortalLayout;
