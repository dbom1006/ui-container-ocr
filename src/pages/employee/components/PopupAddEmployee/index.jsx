import {
  Alert,
  Icon,
  Menu,
  Form,
  Input,
  Modal,
  Row,
  Checkbox,
  notification,
  Col,
  Switch,
  Select,
  Upload,
  Button,
} from 'antd';
import React, { Component } from 'react';
import classNames from 'classnames';
import { GridContent } from '@ant-design/pro-layout';
import { connect } from 'dva';
import { API_URL } from '@/utils/constants';
import strapi from '@/utils/strapi';
import styles from './style.less';

const FormItem = Form.Item;

const OPTION_TEAM = [
  'Phòng Điều dưỡng',
  'Phòng Tài Chính',
  'Phòng Nhân Sự',
  'Ban giám đốc',
  'Khoa Sản',
  'Khoa Mắt',
  'Khoa Tai - Mũi - Họng',
  'Khoa Ngoại',
  'Khoa Nội',
];

@connect(({ loading }) => ({
  submitting: loading.effects['employees/add'],
}))
class PopupAddEmployee extends Component {
  openNotificationWithIcon = type => {
    notification[type]({
      message: 'Send Notification Success',
      description: 'Send notification success.',
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    if (form) {
      form.validateFields(this.submit);
    }
  };

  submit = async (err, values) => {
    if (!err) {
      const { type, dataPopup, dispatch } = this.props;
      if (type != 'Add') values.id = dataPopup.id;
      if (values?.avatar.length) {
        const avatarId = await strapi.upload(values?.avatar);
        values.avatar = avatarId;
      }
      if (values?.video.length) {
        const videoId = await strapi.upload(values?.video);
        values.video = videoId;
      }
      const imageIds = await strapi.upload(values?.images);
      values.images = imageIds;
      dispatch({
        type: type == 'Add' ? 'employees/add' : 'employees/update',
        payload: values,
        callback: () => {
          this.props.form.resetFields();
          const { onClose, refreshList } = this.props;
          refreshList && refreshList();
          onClose && onClose();
        },
      });
    }
  };

  closePopup = () => {
    const { onClose } = this.props;
    onClose && onClose();
  };

  normFile = e => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  render() {
    const {
      type = 'Add',
      dataPopup,
      show = false,
      className,
      onSubmit,
      form: { getFieldDecorator, getFieldValue },
      onCancel,
      visible,
      submitting,
    } = this.props;
    const { firstName = '', lastName = '', code = 'BVQN-', team = '', avatar, file } =
      dataPopup || {};
    const files = getFieldValue('files') || [];
    return (
      <GridContent>
        <Modal
          visible={show}
          title={type + ' Employee'}
          okText="Submit"
          width={680}
          onCancel={this.closePopup}
          onOk={this.handleSubmit}
          confirmLoading={submitting}
        >
          <Form onSubmit={onSubmit} layout="vertical">
            <Row gutter={12}>
              <Col md={12}>
                <FormItem label="First name">
                  {getFieldDecorator('firstName', {
                    rules: [
                      {
                        required: true,
                        message: 'Please input first name!',
                      },
                    ],
                    initialValue: firstName,
                  })(<Input placeholder="" />)}
                </FormItem>
              </Col>
              <Col md={12}>
                <FormItem label="Last name">
                  {getFieldDecorator('lastName', {
                    rules: [
                      {
                        required: true,
                        message: 'Please input last name!',
                      },
                    ],
                    initialValue: lastName,
                  })(<Input placeholder="" />)}
                </FormItem>
              </Col>

              <Col md={12}>
                <FormItem label="Code">
                  {getFieldDecorator('code', {
                    rules: [
                      {
                        required: true,
                        message: 'Please input code!',
                      },
                    ],
                    initialValue: code,
                  })(<Input placeholder="" />)}
                </FormItem>
              </Col>

              <Col md={12}>
                <FormItem label="Team">
                  {getFieldDecorator('team', {
                    rules: [
                      {
                        required: true,
                        message: 'Please select team!',
                      },
                    ],
                    initialValue: team,
                  })(
                    <Select>
                      {OPTION_TEAM.map(x => (
                        <Select.Option key={x}>{x}</Select.Option>
                      ))}
                    </Select>,
                  )}
                </FormItem>
              </Col>
              <Col md={24}>
                <Form.Item label="Images" style={{ width: '100%' }}>
                  {getFieldDecorator('images', {
                    rules: [
                      {
                        required: true,
                        message: 'Please upload images!',
                      },
                    ],
                    valuePropName: 'fileList',
                    getValueFromEvent: this.normFile,
                    initialValue: [],
                  })(
                    <Upload
                      name="images"
                      multiple
                      beforeUpload={() => false}
                      listType="picture-card"
                      accept="image/*"
                    >
                      <div>
                        <Icon type="plus" />
                        <div className="ant-upload-text">Upload</div>
                      </div>
                    </Upload>,
                  )}
                </Form.Item>
              </Col>
              <Col md={12}>
                <Form.Item label="Avatar" className={styles.upload}>
                  {getFieldDecorator('avatar', {
                    valuePropName: 'fileList',
                    getValueFromEvent: this.normFile,
                    initialValue: [],
                  })(
                    <Upload
                      name="avatar"
                      listType="picture-card"
                      accept="image/*"
                      beforeUpload={() => false}
                      showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
                    >
                      {getFieldValue('avatar')?.length == 0 && (
                        <div>
                          <Icon type="plus" />
                          <div className="ant-upload-text">Upload</div>
                        </div>
                      )}
                    </Upload>,
                  )}
                </Form.Item>
              </Col>

              <Col md={12}>
                <Form.Item label="Video" className={styles.upload}>
                  {getFieldDecorator('video', {
                    valuePropName: 'fileList',
                    getValueFromEvent: this.normFile,
                    initialValue: [],
                  })(
                    <Upload
                      name="video"
                      listType="picture-card"
                      accept="video/*"
                      beforeUpload={() => false}
                      showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
                    >
                      {getFieldValue('video')?.length == 0 && (
                        <div>
                          <Icon type="plus" />
                          <div className="ant-upload-text">Upload</div>
                        </div>
                      )}
                    </Upload>,
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </GridContent>
    );
  }
}

export default Form.create()(PopupAddEmployee);
