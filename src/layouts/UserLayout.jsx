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
              <h2>Container Detection</h2>
              <p>Automatically recognizes and decodes international shipping container codes, speeding up the security and overall throughput to process cargo tracking at sea ports</p>
            </div>
            <div className={styles.slide}>
              <img src="https://images.fineartamerica.com/images-medium-large-5/1-cargo-containers-christophe-vander-eeckenreportersscience-photo-library.jpg" alt='' />
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
