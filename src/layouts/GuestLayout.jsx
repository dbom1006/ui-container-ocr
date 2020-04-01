import React, { useEffect } from 'react';
import Link from 'umi/link';
import { connect } from 'dva';
import { Col, Row, Layout, Button } from 'antd';
import { DefaultHeader } from '@ant-design/pro-layout';
import logo from '../assets/logo.png';
import styles from './GuestLayout.less';

const { Header } = Layout;

const GuestLayout = props => {
  const { dispatch, children, settings } = props;

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'settings/getSetting',
      });
      dispatch({
        type: 'settings/fetchPositions',
      });
    }
  }, []);

  return (
    <div>
      <Header className={styles.header}>
        <div className={styles.logo}>
          <img src={logo} />
          <span>HireTend Portal</span>
        </div>
        <div>
          <Link to="/user/signup">
            <Button type="primary">Sign up</Button>
          </Link>
          <Link to="/user/login">
            <Button>Login</Button>
          </Link>
        </div>
      </Header>
      <Row type="flex" justify="center">
        <Col lg={20} md={24}>
          <div className={styles.guestLayout}>{children}</div>
        </Col>
      </Row>
    </div>
  );
};

export default connect(({ settings }) => ({
  settings,
}))(GuestLayout);
