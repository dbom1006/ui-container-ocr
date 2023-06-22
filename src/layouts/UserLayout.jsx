import { getMenuData, getPageTitle } from '@ant-design/pro-layout';
import { Layout } from 'antd';
import { connect } from 'dva';
import React from 'react';
import DocumentTitle from 'react-document-title';
import { formatMessage } from 'umi-plugin-react/locale';
import Link from 'umi/link';
import loginBanner from '../assets/login-banner.png';
import logo from '../assets/logo.png';
import styles from './UserLayout.less';

const UserLayout = (props) => {
  const { Sider, Content } = Layout;
  const {
    route = {
      routes: [],
    },
  } = props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;
  const { breadcrumb } = getMenuData(routes);
  return (
    <DocumentTitle
      title={getPageTitle({
        pathname: location.pathname,
        breadcrumb,
        formatMessage,
        ...props,
      })}
    >
      <div className={styles.container}>
        <Layout>
          <Sider className={styles.sider} width="40%">
            <div className={styles.logo}>
              <Link to="/">
                <img alt="logo" src={logo} />
              </Link>
              <h2>Bệnh viện Đa khoa khu vực miền núi phía Bắc Quảng Nam</h2>
              <p>Bệnh viện hạng I trực thuộc Sở Y tế Quảng Nam; có nhiệm vụ khám chữa bệnh cho nhân dân các huyện miền núi phía Bắc của tỉnh Quảng Nam</p>
            </div>
            <div className={styles.slide}>
              <img src={loginBanner} />
            </div>
          </Sider>
          <Content width="60%" className={styles.wrapper}>
            {children}
          </Content>
        </Layout>
      </div>
    </DocumentTitle>
  );
};

export default connect(({ settings }) => ({ ...settings }))(UserLayout);
