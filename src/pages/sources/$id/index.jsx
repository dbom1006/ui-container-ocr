import { Avatar, Card, Col, Divider, Icon, Input, Row, Tag } from 'antd';
import React, { Component } from 'react';
import { GridContent, PageHeaderWrapper } from '@ant-design/pro-layout';
import Link from 'umi/link';
import { connect } from 'dva';
import router from 'umi/router';
import styles from './style.less';

const tabList = [
  {
    key: 'detail',
    tab: 'Thông tin',
  },
  {
    key: 'checkin',
    tab: 'Xử lý Checkin',
  },
];

@connect(({ sourceDetail, loading }) => ({
  event: sourceDetail.current,
  loading: loading.effects['sourceDetail/fetchCurrent'],
}))
class PastStaffings extends Component {
  componentDidMount = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'sourceDetail/fetchCurrent',
      payload: match.params.id,
    });
  };

  handleTabChange = key => {
    const { match } = this.props;
    const url = (match.url === '/' ? '' : match.url).replace('/detail', '');

    switch (key) {
      case 'detail':
      case 'checkin':
        router.push(`${url}/${key}`);
        break;
      default:
        break;
    }
  };

  getTabKey = () => {
    const { match, location } = this.props;
    const url = (match.path === '/' ? '' : match.path).replace(':id', match.params.id);
    const tabKey = location.pathname.replace(`${url}/`, '');
    if (tabKey && tabKey !== '/') {
      return tabKey;
    }
    return 'detail';
  };

  render() {
    const { children, loading } = this.props;
    return (
      <PageHeaderWrapper title="Chi tiết nguồn dữ liệu - Camera">
        <Card
          className={styles.tabsCard}
          bordered={false}
          tabList={tabList}
          activeTabKey={this.getTabKey()}
          onTabChange={this.handleTabChange}
          loading={loading}
        >
          {children}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PastStaffings;
