import { Avatar, Card, Col, Divider, Icon, Input, Row, Tag } from 'antd';
import React, { Component } from 'react';
import { GridContent, PageHeaderWrapper } from '@ant-design/pro-layout';
import Link from 'umi/link';
import { connect } from 'dva';
import router from 'umi/router';
import moment from 'moment';
import styles from './style.less';

@connect(({ upcomingEvent, loading }) => ({
  event: upcomingEvent.current,
  loading: loading.effects['upcomingEvent/fetchCurrent'],
}))
class UpcomingDetail extends Component {
  tabList = [
    {
      key: 'detail',
      tab: 'Info',
    },
    {
      key: 'staffing',
      tab: 'Staffing',
    },
  ];

  componentDidMount = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'upcomingEvent/fetchCurrent',
      payload: match.params.id,
    });
  };

  handleTabChange = key => {
    const { match } = this.props;
    const url = (match.url === '/' ? '' : match.url).replace('/detail', '');

    switch (key) {
      case 'detail':
      case 'staffing':
      case 'payment':
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
      <PageHeaderWrapper title="Staffing Detail">
        <Card
          className={styles.tabsCard}
          bordered={false}
          tabList={this.tabList}
          onTabChange={this.handleTabChange}
          activeTabKey={this.getTabKey()}
          loading={loading}
        >
          {children}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default UpcomingDetail;
