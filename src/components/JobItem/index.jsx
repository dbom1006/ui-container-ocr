import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Row,
  Col,
  Form,
  Icon,
  Input,
  Steps,
  Card,
  DatePicker,
  Tag,
  Radio,
  Select,
  Popconfirm,
  TimePicker,
  InputNumber,
} from 'antd';
import React, { Component } from 'react';
import Link from 'umi/link';
import { connect } from 'dva';
import styles from './style.less';
import moment from 'moment';
import FormItem from 'antd/lib/form/FormItem';
import { converter } from '@/utils/helper';
import { round2 } from '@/utils/utils';

const { Option } = Select;

class JobItem extends Component {
  onChangeDateTime = values => {
    const {
      form: { getFieldValue },
      onChangeDateTime,
    } = this.props;
    const {
      date = getFieldValue('date'),
      start = getFieldValue('start'),
      end = getFieldValue('end'),
      unpaidBreak = getFieldValue('unpaidBreak'),
    } = values;
    onChangeDateTime && onChangeDateTime(date, start, end, unpaidBreak);
  };

  renderRemoveJobItem = () => {
    const { onRemove } = this.props;
    if (!onRemove) return;
    return (
      <Popconfirm
        okType="danger"
        title="Are you sure to remove this job"
        onConfirm={this.props.onRemove}
      >
        <Icon type="delete" />
      </Popconfirm>
    );
  };

  getJobConvert = () => {
    const {
      job,
      form: { getFieldsValue },
    } = this.props;
    return converter.convertFormToJob(getFieldsValue());
  };

  getTitle = () => {
    const {
      positions,
      job,
      form: { getFieldsValue },
    } = this.props;
    const { position = job.position } = getFieldsValue();
    const positionJob = positions.find(x => x.id == position);
    if (!positionJob) return 'Select info job';
    const { originTotal = 0, tip } = this.getJobConvert();
    const textTotal = `Total: $${originTotal}`;
    const info = [positionJob.name, tip, textTotal];
    return info.filter(Boolean).join(' - ');
  };

  onChangePosition = value => {
    const {
      positions,
      form: { setFieldsValue },
    } = this.props;
    const position = positions.find(x => x.id == value);
    setFieldsValue({ originRateHour: position.rateHour, name: position.name, tip: undefined });
  };

  onChangeStart = value => {
    const {
      form: { getFieldValue, setFieldsValue },
    } = this.props;
    if (
      !getFieldValue('end') ||
      moment(getFieldValue('end')).isBefore(moment(value).add(1, 'hours'))
    ) {
      setFieldsValue({ end: moment(value).add(1, 'hours') });
    }
    this.onChangeDateTime({ start: value });
  };

  getDisabledEndTime = () => {
    const {
      form: { getFieldValue },
    } = this.props;
    const startHour = (getFieldValue('start') || moment('5:00', 'h:mm')).hour();
    const availableEndTime = Array.from(Array(48), (d, i) => i)
      .filter(x => startHour < x && x <= startHour + 12)
      .map(x => x % 24);
    return Array.from(Array(24), (d, i) => i).filter(y => !availableEndTime.includes(y));
  };

  getDisabledStartTime = () => {
    const {
      form: { getFieldValue },
    } = this.props;
    const disabledTime = [0, 1, 2, 3, 4, 23, 24];
    if (getFieldValue('date')) {
      const date = moment(getFieldValue('date'));
      let addDisable = [];
      if (moment().isSame(date, 'day')) {
        addDisable = Array.from(Array(24), (d, i) => i).filter(
          x => x <= moment().hour() + Math.round(moment().minute() / 60),
        );
      }
      return [...new Set(disabledTime.concat(addDisable))];
    } return disabledTime;
  };

  getDisabledStartMinute = () => {
    const {
      form: { getFieldValue },
    } = this.props;
    if (getFieldValue('date')) {
      const date = moment(getFieldValue('date'));
      const start = moment(getFieldValue('start'));
      if (moment().isSame(date, 'day') && moment().hour() + 1 == start.hour()) {
        if (moment().minute() <= 30) return [0];
      }
    }
    return [];
  };

  validateTimeStart = (rule, value, callback) => {
    const {
      form: { getFieldValue },
    } = this.props;
    if (value) {
      const date = moment(getFieldValue('date'));
      const start = moment(value);
      console.log(moment().hour(), start.hour(), moment().minute(), start.minute());
      if (moment().isSame(date, 'day') && moment().hour() + 1 == start.hour()) {
        if (moment().minute() <= 30 && start.minute() == 0) callback('Start time must be later');
        else callback();
      } else callback();
    } else callback();
  };

  getDisabledDate = date => {
    if (moment().isSame(date, 'day')) return moment().hour() >= 22;
    return !date || date.isBefore(moment().subtract(1, 'day'));
  };

  getTipTotal = () => {
    const { tipTotal, tip, position, originRateHour, duration, quantity } = this.getJobConvert();
    if (tip == 'Will tip onsite') {
      const { positions } = this.props;
      return round2(
        originRateHour *
          duration *
          quantity *
          positions.find(x => x.id == position).tipData.find(x => x.name == tip).rate,
      );
    }
    return tipTotal || 0;
  };

  onChangeTipOption = () => {
    const {
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;
    setTimeout(() => setFieldsValue({ tipAmount: undefined, tipTotal: undefined }));
  };

  renderTipOption = () => {
    const {
      form: { getFieldDecorator, getFieldValue },
      positions,
      job,
    } = this.props;
    const position = positions.find(x => x.id == getFieldValue('position'));
    if (position && position.hasTip) {
      getFieldDecorator('tipTotal', { initialValue: job.tipTotal });
      return (
        <>
          <Col xl={6} lg={8} sm={12}>
            <FormItem label="Tip Option" hasFeedback>
              {getFieldDecorator('tip', {
                initialValue: job.tip,
                rules: [
                  {
                    message: 'Please select tip option!',
                    required: true,
                  },
                ],
              })(
                <Select placeholder="Select tip" onChange={value => this.onChangeTipOption()}>
                  {position.tipData.map(tip => (
                    <Option key={tip.name} value={tip.name}>
                      {tip.name}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          </Col>
          {getFieldValue('tip') == 'Include tip' && (
            <Col xl={6} lg={8} sm={12}>
              <FormItem label="Tip Amount" hasFeedback>
                {getFieldDecorator('tipAmount', {
                  initialValue: job.tipAmount,
                  rules: [
                    {
                      message: 'Please select tip option!',
                      required: true,
                    },
                  ],
                })(
                  <Select placeholder="Choose amount">
                    {position.tipData
                      .find(x => x.name == getFieldValue('tip'))
                      .options.map(value => (
                        <Option key={value} value={value}>
                          ${value}/hour
                        </Option>
                      ))}
                  </Select>,
                )}
              </FormItem>
            </Col>
          )}
          {['Include tip', 'Will tip onsite'].includes(getFieldValue('tip')) && (
            <Col xl={6} lg={8} sm={12}>
              <FormItem
                label="Tip"
                help={
                  getFieldValue('tip') == 'Will tip onsite' &&
                  'Suggested tip, not included in total'
                }
                hasFeedback
              >
                <Input disabled prefix="$" value={this.getTipTotal()} />
              </FormItem>
            </Col>
          )}
        </>
      );
    }
    return null;
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      positions,
      job,
    } = this.props;
    getFieldDecorator('originRateHour', { initialValue: job.originRateHour });
    getFieldDecorator('name', { initialValue: job.name });
    getFieldDecorator('isNew', { initialValue: job.isNew });
    return (
      <Card title={this.getTitle()} extra={this.renderRemoveJobItem()}>
        <Form className={styles.inlineForm}>
          <Row gutter={24}>
            <Col sm={16}>
              <FormItem label="Position" hasFeedback>
                {getFieldDecorator('position', {
                  initialValue: job.position,
                  rules: [
                    {
                      message: 'Please select position of job!',
                      required: true,
                    },
                  ],
                })(
                  <Select
                    placeholder="Choose position"
                    disabled={!job.isNew}
                    onChange={this.onChangePosition}
                  >
                    {positions.map(position => (
                      <Option key={position.id} value={position.id} disabled={!position.active}>
                        {position.name} (${position.rateHour}/hour)
                      </Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem label="Quantity">
                {getFieldDecorator('quantity', {
                  initialValue: job.quantity || 1,
                  rules: [
                    {
                      message: 'Please select number required!',
                      required: true,
                    },
                  ],
                })(<InputNumber min={1} />)}
              </FormItem>
            </Col>
            <Col xl={6} lg={8} sm={12}>
              <FormItem label="Date" hasFeedback>
                {getFieldDecorator('date', {
                  initialValue: job.date && moment(job.date),
                  rules: [
                    {
                      message: 'Please select date start!',
                      required: true,
                    },
                  ],
                })(
                  <DatePicker
                    disabled={!job.isNew}
                    disabledDate={this.getDisabledDate}
                    format="YYYY-MM-DD"
                    placeholder="Select date"
                    onChange={date => this.onChangeDateTime({ date })}
                  />,
                )}
              </FormItem>
            </Col>
            <Col xl={6} lg={8} sm={12}>
              <FormItem label="Start time" hasFeedback>
                {getFieldDecorator('start', {
                  initialValue: job.start && moment(job.start),
                  rules: [
                    {
                      message: 'Please select time start!',
                      required: true,
                    },
                    {
                      validator: this.validateTimeStart,
                    },
                  ],
                })(
                  <TimePicker
                    onChange={this.onChangeStart}
                    popupClassName={styles.selectTime}
                    hideDisabledOptions
                    disabledHours={this.getDisabledStartTime}
                    disabledMinutes={this.getDisabledStartMinute}
                    format="h:mm A"
                    minuteStep={30}
                  />,
                )}
              </FormItem>
            </Col>
            <Col xl={6} lg={8} sm={12}>
              <FormItem label="End time" hasFeedback>
                {getFieldDecorator('end', {
                  initialValue: job.end && moment(job.end),
                  rules: [
                    {
                      message: 'Please select time end!',
                      required: true,
                    },
                  ],
                })(
                  <TimePicker
                    onChange={end => this.onChangeDateTime({ end })}
                    disabledHours={this.getDisabledEndTime}
                    hideDisabledOptions
                    popupClassName={styles.selectTime}
                    format="h:mm A"
                    minuteStep={30}
                  />,
                )}
              </FormItem>
            </Col>
            <Col xl={6} lg={8} sm={12}>
              <FormItem label="Unpaid Break" hasFeedback>
                {getFieldDecorator('unpaidBreak', {
                  initialValue: job.unpaidBreak,
                  rules: [
                    {
                      message: 'Please select unpaid break time!',
                      required: true,
                    },
                  ],
                })(
                  <Select
                    onChange={unpaidBreak => this.onChangeDateTime({ unpaidBreak })}
                    placeholder="Select options"
                  >
                    <Option value={0}>0 Min</Option>
                    <Option value={0.25}>15 Mins</Option>
                    <Option value={0.5}>30 Mins</Option>
                    <Option value={0.75}>45 Mins</Option>
                    <Option value={1}>1 Hour</Option>
                  </Select>,
                )}
              </FormItem>
            </Col>
            {this.renderTipOption()}
            <Col xl={6} lg={8} sm={12} style={{ float: 'right' }}>
              <FormItem label="Total" help="Total amount">
                <Input disabled prefix="$" value={this.getJobConvert().originTotal || 0} />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>
    );
  }
}

export default Form.create({
  onValuesChange: (props, values) => {
    const {
      form: { getFieldValue, getFieldsValue, setFieldsValue },
    } = props;
    const tip = getFieldValue('tip');
    if (tip == 'Will tip onsite' && !values.tipTotal) {
      const { positions } = props;
      const { quantity, duration, originRateHour, position } = converter.convertFormToJob({
        ...getFieldsValue(),
        ...values,
      });
      if (position) {
        const tipTotal = round2(
          originRateHour *
            duration *
            quantity *
            positions.find(x => x.id == position).tipData.find(x => x.name == tip).rate,
        );
        setFieldsValue({ tipTotal });
      }
    }
  },
})(JobItem);
