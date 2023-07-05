import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Icon, Row, DatePicker, Col, Card, Button } from 'antd';
import { connect } from 'dva';
import React, { Component } from 'react';
import styles from './style.less';
import classNames from 'classnames';
import moment from 'moment';
import { Column } from '@ant-design/plots';

const MAPPING_COUNT_BOX = [
  { key: 'employee', label: 'Nhân viên', icon: 'team' },
  { key: 'checked', label: 'Đã checkin', icon: 'check-square' },
  { key: 'late', label: 'Đi muộn', icon: 'clock-circle' },
  { key: 'notChecked', label: 'Chưa checkin', icon: 'api' },
];

const MOCK_DATA_CHART = [
  {
    date: '20/06',
    type: 'late',
    value: 38,
  },
  {
    date: '20/06',
    type: 'notChecked',
    value: 6,
  },
  {
    date: '21/06',
    type: 'late',
    value: 24,
  },
  {
    date: '21/06',
    type: 'notChecked',
    value: 10,
  },
  {
    date: '22/06',
    type: 'late',
    value: 50,
  },
  {
    date: '22/06',
    type: 'notChecked',
    value: 10,
  },
  {
    date: '23/06',
    type: 'late',
    value: 5,
  },
  {
    date: '23/06',
    type: 'notChecked',
    value: 8,
  },
  {
    date: '24/06',
    type: 'late',
    value: 38,
  },
  {
    date: '24/06',
    type: 'notChecked',
    value: 6,
  },
  {
    date: '25/06',
    type: 'late',
    value: 16,
  },
  {
    date: '25/06',
    type: 'notChecked',
    value: 8,
  },
  {
    date: '26/06',
    type: 'late',
    value: 38,
  },
  {
    date: '26/06',
    type: 'notChecked',
    value: 6,
  },
];

const renderLabel = type => {
  switch (type) {
    case 'late':
      return 'Đi muộn';
    case 'notChecked':
      return 'Không checkin';
    default:
      return null;
  }
};

const config = {
  data: MOCK_DATA_CHART,
  xField: 'date',
  yField: 'value',
  seriesField: 'type',
  isGroup: true,
  // meta: {
  //   value: {
  //     min: 0,
  //     max: 100,
  //   },
  // },
  colorField: 'type', // or seriesField in some cases
  color: ['#faad14', '#f5222d'],
  legend: {
    position: 'top',
    itemName: {
      formatter: type => {
        return renderLabel(type);
      },
    },
  },
  tooltip: {
    formatter: item => {
      return { name: renderLabel(item.type), value: item.value };
    },
  },
};

@connect(({ dashboard, loading }) => ({
  boxes: dashboard.boxes,
  loadingBoxes: loading.effects['dashboard/fetchBoxes'],
}))
class Setting extends Component {
  state = {
    valueDatePicker: moment(),
  };

  disabledDate(current) {
    return current && current > moment().endOf('day');
  }

  componentDidMount() {
    this.fetchDataBoxes();
  }

  fetchDataBoxes = (date = this.state.valueDatePicker) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dashboard/fetchBoxes',
      payload: {
        date: moment(date).format('YYYY-MM-DD'),
      },
    });
  };

  handleDatePickerChange = date => {
    this.setState({ valueDatePicker: date });
    this.fetchDataBoxes(date);
  };

  render() {
    const { boxes, loadingBoxes } = this.props;
    return (
      <PageHeaderWrapper title="Tổng quan" className={styles.dashboard}>
        <Row justify="end" type="flex" align="middle">
          <Icon
            type="sync"
            spin={loadingBoxes}
            onClick={this.fetchDataBoxes}
            style={{ fontSize: 18, cursor: 'pointer', marginRight: 16 }}
          />
          <DatePicker
            value={this.state.valueDatePicker}
            format="DD-MM-YYYY"
            disabledDate={this.disabledDate}
            onChange={this.handleDatePickerChange}
            allowClear={false}
            size="large"
          />
        </Row>

        <Row gutter={24}>
          {MAPPING_COUNT_BOX.map(x => (
            <Col xs={24} sm={24} md={12} lg={6} key={x}>
              <Card loading={loadingBoxes} className={styles.box} hoverable>
                <Row justify="space-between" align="middle" type="flex">
                  <div>
                    <h4 className={styles.value}>{boxes?.[x.key]}</h4>
                    <p className={styles.label}>{x.label}</p>
                  </div>
                  <Icon type={x.icon} className={classNames(styles.icon, styles[x.key])} />
                </Row>
              </Card>
            </Col>
          ))}
        </Row>

        <Card className={styles.checkinChart}>
          <h2>Checkin</h2>
          <p>Tổng lượt đi muộn và không checkin trong 7 ngày</p>
          <Column {...config} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Setting;
