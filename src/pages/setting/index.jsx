import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Button, Row, Spin, TimePicker, message } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import React, { Component } from 'react';

@connect(({ system, loading }) => ({
  checkinTime: system.checkinTime,
  isLoading: loading.effects['system/fetch'],
  isLoadingUpdate: loading.effects['system/update'],
}))
class Setting extends Component {
  state = {
    valueTimepicker: this.props.checkinTime,
  };

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.checkinTime !== this.props.checkinTime) {
      this.setState({ valueTimepicker: this.props.checkinTime });
    }
  }

  fetchData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'system/fetch',
    });
  };

  handleCheckinTimeChange = (_, timeString) => {
    this.setState({ valueTimepicker: moment(timeString, 'HH:mm').format('HH:mm:ss.SSS') });
  };

  handleSave = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'system/update',
      payload: { data: { checkinTime: this.state.valueTimepicker } },
      callback: () => message.success('Cập nhật thành công!'),
    });
  };

  render() {
    const { checkinTime, isLoading, isLoadingUpdate } = this.props;
    const { valueTimepicker } = this.state;

    return (
      <PageHeaderWrapper title="Cấu hình hệ thống">
        <Spin spinning={isLoading}>
          <span>Thời gian checkin: </span>
          <TimePicker
            value={moment(this.state.valueTimepicker, 'HH:mm:ss.SSS')}
            format="HH:mm"
            onChange={this.handleCheckinTimeChange}
          />
          <div style={{ marginTop: 40 }}>
            <Button
              type="primary"
              onClick={this.handleSave}
              loading={isLoadingUpdate}
              style={{ minWidth: 120 }}
            >
              Lưu
            </Button>
          </div>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default Setting;
