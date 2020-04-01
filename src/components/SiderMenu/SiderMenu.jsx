import React, { Component } from 'react';
import { Layout, Icon } from 'antd';
import classNames from 'classnames';
import { MenuProps } from 'antd/lib/menu';

import styles from './index.less';
import BaseMenu from './BaseMenu';
import { getDefaultCollapsedSubMenus } from './SiderMenuUtils';
import FooterMenu from './FooterMenu';
import debounce from 'lodash/debounce';
import { isBrowser } from '@/utils/utils';

const { Sider } = Layout;

let firstMount = true;

export const defaultRenderLogo = logo => {
  if (typeof logo === 'string') {
    return <img src={logo} alt="logo" />;
  }
  if (typeof logo === 'function') {
    return logo();
  }
  return logo;
};

export const defaultRenderLogoAndTitle = (logo, title, menuHeaderRender) => {
  if (menuHeaderRender === false) {
    return null;
  }
  const logoDom = defaultRenderLogo(logo);
  const titleDom = <h1>{title}</h1>;

  if (menuHeaderRender) {
    return menuHeaderRender(logoDom, titleDom);
  }
  return (
    <a href="/">
      {logoDom}
      {titleDom}
    </a>
  );
};

export default class SiderMenu extends Component {
  static defaultProps = {
    flatMenuKeys: [],
    isMobile: false,
    collapsed: false,
    menuData: [],
  };

  static getDerivedStateFromProps(props, state) {
    const { pathname, flatMenuKeysLen } = state;
    const { location = { pathname: '/' }, flatMenuKeys = [] } = props;
    if (location.pathname !== pathname || flatMenuKeys.length !== flatMenuKeysLen) {
      return {
        pathname: location.pathname,
        flatMenuKeysLen: flatMenuKeys.length,
        openKeys: getDefaultCollapsedSubMenus(props),
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      openKeys: getDefaultCollapsedSubMenus(props),
    };
  }

  componentDidMount() {
    firstMount = false;
  }

  componentWillUnmount = () => {
    this.triggerResizeEvent.cancel();
  };

  isMainMenu = key => {
    const { menuData = [] } = this.props;
    return menuData.some(item => {
      if (key) {
        return item.key === key || item.path === key;
      }
      return false;
    });
  };

  handleOpenChange = openKeys => {
    const { onOpenChange, openKeys: defaultOpenKeys } = this.props;
    if (onOpenChange) {
      onOpenChange(openKeys);
      return;
    }
    // if defaultOpenKeys existence, don't change
    if (defaultOpenKeys !== undefined) {
      return;
    }
    const moreThanOne = openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
    if (moreThanOne) {
      this.setState({
        openKeys: [openKeys.pop()].filter(item => item),
      });
    } else {
      this.setState({ openKeys: [...openKeys] });
    }
  };

  triggerResizeEvent = debounce(() => {
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    if (isBrowser()) {
      window.dispatchEvent(event);
    }
  });

  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    if (onCollapse) onCollapse(!collapsed);
    this.triggerResizeEvent();
  };

  renderCollapsedButton = () => {
    const { collapsed } = this.props;
    return (
      <span className={styles.triggerMenu} onClick={this.toggle}>
        {collapsed ? <Icon type="menu-unfold" /> : <Icon type="menu-fold" />}
      </span>
    );
  };

  render() {
    const {
      collapsed,
      fixSiderbar,
      onCollapse,
      theme,
      siderWidth = 256,
      isMobile,
      layout,
      logo = 'https://gw.alipayobjects.com/zos/antfincdn/PmY%24TNNDBI/logo.svg',
      title,
      menuHeaderRender: renderLogoAndTitle,
      onMenuHeaderClick,
    } = this.props;
    const { openKeys } = this.state;

    // 如果收起，并且为顶部布局，openKeys 为 false 都不控制 openKeys
    const defaultProps =
      collapsed || layout !== 'sidemenu' || openKeys === false ? {} : { openKeys };

    const siderClassName = classNames('ant-pro-sider-menu-sider', {
      'fix-sider-bar': fixSiderbar,
      light: theme === 'light',
    });

    return (
      <Sider
        collapsible
        trigger={null}
        collapsed={collapsed}
        breakpoint="lg"
        onCollapse={collapse => {
          if (firstMount || !isMobile) {
            if (onCollapse) {
              onCollapse(collapse);
            }
          }
        }}
        width={siderWidth}
        theme={theme}
        className={siderClassName}
      >
        {this.renderCollapsedButton()}
        <div className="ant-pro-sider-menu-logo" onClick={onMenuHeaderClick} id="logo">
          {defaultRenderLogoAndTitle(logo, title, renderLogoAndTitle)}
        </div>
        <BaseMenu
          {...this.props}
          siderWidth={siderWidth}
          mode="inline"
          handleOpenChange={this.handleOpenChange}
          onOpenChange={this.handleOpenChange}
          style={{ padding: '16px 0', width: '100%' }}
          {...defaultProps}
          {...this.props.menuProps}
        />
      </Sider>
    );
  }
}
