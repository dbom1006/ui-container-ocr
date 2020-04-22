import { Avatar, Icon, Menu, Spin } from 'antd';
import { FormattedMessage } from 'umi-plugin-react/locale';
import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import styles from './index.less';

const ACTION_KEY = {
  ACOUNT_INFO: '/ACCOUNT',
  SAFETY: '/SAFETY',
  LOGOUT: '/LOGOUT',
};

@connect(({ user }) => ({
  currentUser: user.currentUser,
}))
class FooterMenu extends React.Component {
  onMenuClick = event => {
    const { key = '' } = event;
    const { dispatch } = this.props;
    switch (key) {
      case ACTION_KEY.LOGOUT:
        dispatch && dispatch({ type: 'account/logout' });
        break;
      case ACTION_KEY.SAFETY:
      case ACTION_KEY.ACOUNT_INFO:
        // case ACTION_KEY.SETTINGS:
        // router.push(`${key.toLowerCase()}`);
        break;
      default:
        // router.push('/account');
        break;
    }
  };

  getSelectedKeys = () => {
    const { pathname, selectedKeys } = this.props;
    return [ACTION_KEY.ACOUNT_INFO, ACTION_KEY.SAFETY]
      .filter(x => pathname.includes(x.toLowerCase()))
      .concat(selectedKeys);
  };

  render() {
    const { currentUser = {}, menu, siderWidth, collapsed } = this.props;
    return (
      <div className={styles.menufooter} style={{ width: collapsed ? 80 : siderWidth }}>
        {currentUser && currentUser.username ? (
          <Menu selectedKeys={this.getSelectedKeys()} onClick={this.onMenuClick}>
            <Menu.Item key="user">
              <div>
                <Avatar className={styles.avatar} src={currentUser.avatar} alt="avatar">
                  {currentUser.name && currentUser.name[0]}
                </Avatar>
              </div>
              <span title={currentUser.username}>
                <b>{currentUser.name}</b>
              </span>
            </Menu.Item>
            {/* <Menu.Item key={ACTION_KEY.SAFETY}>
              <div>
                <Icon className={styles.icon} type="safety" />
              </div>
              <span>Terms Policy</span>
            </Menu.Item> */}
            <Menu.Item key={ACTION_KEY.LOGOUT}>
              <div>
                <Icon className={styles.icon} type="logout" />
              </div>
              <span>Đăng xuất</span>
            </Menu.Item>
          </Menu>
        ) : (
          <Spin size="small" />
        )}
      </div>
    );
  }
}

export default FooterMenu;
