import './index.less';

import { Icon, Menu } from 'antd';
import React, { Component } from 'react';
import classNames from 'classnames';
import { MenuMode } from 'antd/es/menu';
import { MenuTheme } from 'antd/es/menu/MenuContext';
import { getMenuMatches } from './SiderMenuUtils';

import { isUrl, urlToList } from '@/utils/utils';
import IconFont from '../IconFont';
import FooterMenu from './FooterMenu';

const { SubMenu } = Menu;

// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'icon-geren' #For Iconfont ,
//   icon: 'http://demo.com/icon.png',
//   icon: '/favicon.png',
//   icon: <Icon type="setting" />,
const getIcon = icon => {
  if (typeof icon === 'string') {
    if (isUrl(icon)) {
      return (
        <Icon component={() => <img src={icon} alt="icon" className="ant-pro-sider-menu-icon" />} />
      );
    }
    if (icon.startsWith('icon-')) {
      return <IconFont type={icon} />;
    }
    return <Icon type={icon} />;
  }
  return icon;
};

export default class BaseMenu extends Component {
  static defaultProps = {
    flatMenuKeys: [],
    onCollapse: () => undefined,
    isMobile: false,
    openKeys: [],
    collapsed: false,
    handleOpenChange: () => undefined,
    menuData: [],
    onOpenChange: () => undefined,
  };

  constructor(props) {
    super(props);
  }

  state = {};

  getNavMenuItems = (menusData = []) =>
    menusData
      .filter(item => item.name && !item.hideInMenu)
      .map(item => this.getSubMenuOrItem(item))
      .filter(item => item);

  // Get the currently selected menu
  getSelectedMenuKeys = pathname => {
    const { flatMenuKeys, selectedKeys } = this.props;
    if (selectedKeys !== undefined) {
      return selectedKeys;
    }
    return urlToList(pathname)
      .map(itemPath => getMenuMatches(flatMenuKeys, itemPath).pop())
      .filter(item => item);
  };

  /**
   * get SubMenu or Item
   */
  getSubMenuOrItem = item => {
    if (
      Array.isArray(item.children) &&
      !item.hideChildrenInMenu &&
      item.children.some(child => child && !!child.name)
    ) {
      const name = this.getIntlName(item);
      return (
        <SubMenu
          title={
            item.icon ? (
              <span>
                {getIcon(item.icon)}
                <span>{name}</span>
              </span>
            ) : (
              name
            )
          }
          key={item.key || item.path}
        >
          {this.getNavMenuItems(item.children)}
        </SubMenu>
      );
    }
    return <Menu.Item key={item.key || item.path}>{this.getMenuItemPath(item)}</Menu.Item>;
  };

  getIntlName = item => {
    const { name, locale } = item;
    const {
      menu = {
        locale: false,
      },
      formatMessage,
    } = this.props;
    if (locale && menu.locale && formatMessage) {
      return formatMessage({
        id: locale,
        defaultMessage: name,
      });
    }
    return name;
  };

  /**
   * 判断是否是http链接.返回 Link 或 a
   * Judge whether it is http link.return a or Link
   * @memberof SiderMenu
   */
  getMenuItemPath = item => {
    const itemPath = this.conversionPath(item.path);
    const icon = getIcon(item.icon);
    const { location = { pathname: '/' }, isMobile, onCollapse, menuItemRender } = this.props;
    const { target } = item;
    // if local is true formatMessage all name。
    const name = this.getIntlName(item);
    let defaultItem = (
      <>
        {icon}
        <span>{name}</span>
      </>
    );
    const isHttpUrl = isUrl(itemPath);
    // Is it a http link
    if (isHttpUrl) {
      defaultItem = (
        <a href={itemPath} target={target}>
          {icon}
          <span>{name}</span>
        </a>
      );
    }
    if (menuItemRender) {
      return menuItemRender(
        {
          ...item,
          isUrl: isHttpUrl,
          itemPath,
          isMobile,
          replace: itemPath === location.pathname,
          onClick: () => onCollapse && onCollapse(true),
        },
        defaultItem,
      );
    }
    return defaultItem;
  };

  conversionPath = path => {
    if (path && path.indexOf('http') === 0) {
      return path;
    }
    return `/${path || ''}`.replace(/\/+/g, '/');
  };

  getPopupContainer = (fixedHeader, layout) => {
    if (fixedHeader && layout === 'topmenu' && this.warp) {
      return this.warp;
    }
    return document.body;
  };

  getRef = ref => {
    this.warp = ref;
  };

  render() {
    const {
      openKeys,
      theme,
      mode,
      location = {
        pathname: '/',
      },
      className,
      collapsed,
      handleOpenChange,
      style,
      fixedHeader = false,
      layout = 'sidemenu',
      menuData,
      siderWidth,
      selectedKeys: defaultSelectedKeys,
    } = this.props;
    // if pathname can't match, use the nearest parent's key
    let selectedKeys = this.getSelectedMenuKeys(location.pathname);
    if (defaultSelectedKeys === undefined && !selectedKeys.length && openKeys) {
      selectedKeys = [openKeys[openKeys.length - 1]];
    }
    let props = {};
    if (openKeys && !collapsed && layout === 'sidemenu') {
      props = {
        openKeys: openKeys.length === 0 ? [...selectedKeys] : openKeys,
      };
    }
    const cls = classNames(className, {
      'top-nav-menu': mode === 'horizontal',
    });
    return (
      <>
        <Menu
          {...props}
          key="Menu"
          mode={mode}
          theme={theme}
          onOpenChange={handleOpenChange}
          selectedKeys={selectedKeys}
          style={style}
          className={cls}
          getPopupContainer={() => this.getPopupContainer(fixedHeader, layout)}
        >
          {this.getNavMenuItems(menuData)}
        </Menu>
        <FooterMenu
          pathname={location.pathname}
          selectedKeys={selectedKeys}
          collapsed={collapsed}
          siderWidth={siderWidth}
        />
        <div ref={this.getRef} />
      </>
    );
  }
}
