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
  message,
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
    const { form, type } = this.props;
    if (form) {
      form.validateFields(type == 'Add' ? this.submit : this.edit);
    }
  };

  submit = async (err, values) => {
    if (!err) {
      const { type, dataPopup, dispatch } = this.props;
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
        type: 'employees/add',
        payload: values,
        callback: () => {
          this.props.form.resetFields();
          const { onClose, refreshList } = this.props;
          refreshList && refreshList();
          message.success('Thêm mới nhân viên thành công!');
          onClose && onClose();
        },
      });
    }
  };

  edit = async (err, values) => {
    if (!err) {
      const { type, dataPopup, dispatch } = this.props;
      if (values?.avatar.length && !values?.avatar?.[0]?.id) {
        const avatarId = await strapi.upload(values?.avatar);
        values.avatar = avatarId;
      }

      if (values?.video.length && !values?.video?.[0]?.id) {
        const videoId = await strapi.upload(values?.video);
        values.video = videoId;
      }

      const oldImages = values?.images?.filter(x => !!x?.id);
      const newImages = values?.images?.filter(x => !x?.id);

      values.images = oldImages;
      if (newImages.length) {
        const imageIds = await strapi.upload(newImages);
        values.images = [...oldImages, ...imageIds];
      }
      dispatch({
        type: 'employees/update',
        employeeId: dataPopup?.employeeId,
        payload: values,
        callback: () => {
          this.props.form.resetFields();
          const { onClose, refreshList } = this.props;
          refreshList && refreshList();
          message.success('Cập nhật thành công!');
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
    const { firstName = '', lastName = '', code = 'BVQN-', team = '', avatar, images, video } =
      dataPopup || {};
    const files = getFieldValue('files') || [];

    const renderTitleModal = () => {
      if (type == 'Add') return 'Thêm mới nhân viên';
      if (type == 'Edit') return 'Chỉnh sửa thông tin nhân viên';
    };

    return (
      <GridContent>
        <Modal
          visible={show}
          title={renderTitleModal()}
          okText={type == 'Add' ? 'Thêm' : 'Cập nhật'}
          cancelText="Huỷ"
          width={680}
          onCancel={this.closePopup}
          onOk={this.handleSubmit}
          confirmLoading={submitting}
          centered
        >
          <Form onSubmit={onSubmit} layout="vertical">
            <Row gutter={12}>
              <Col md={12}>
                <FormItem label="Tên">
                  {getFieldDecorator('firstName', {
                    rules: [
                      {
                        required: true,
                        message: 'Trường này không được bỏ trống',
                      },
                    ],
                    initialValue: firstName,
                  })(<Input placeholder="" />)}
                </FormItem>
              </Col>
              <Col md={12}>
                <FormItem label="Họ">
                  {getFieldDecorator('lastName', {
                    rules: [
                      {
                        required: true,
                        message: 'Trường này không được bỏ trống',
                      },
                    ],
                    initialValue: lastName,
                  })(<Input placeholder="" />)}
                </FormItem>
              </Col>

              <Col md={12}>
                <FormItem label="Mã NV">
                  {getFieldDecorator('code', {
                    rules: [
                      {
                        required: true,
                        message: 'Trường này không được bỏ trống',
                      },
                    ],
                    initialValue: code,
                  })(<Input placeholder="" />)}
                </FormItem>
              </Col>

              <Col md={12}>
                <FormItem label="Phòng/Ban">
                  {getFieldDecorator('team', {
                    rules: [
                      {
                        required: true,
                        message: 'Trường này không được bỏ trống',
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
                <Form.Item label="Ảnh nhận diện" style={{ width: '100%' }}>
                  {getFieldDecorator('images', {
                    rules: [
                      {
                        required: true,
                        message: 'Trường này không được bỏ trống',
                      },
                    ],
                    valuePropName: 'fileList',
                    getValueFromEvent: this.normFile,
                    initialValue: images?.data?.length
                      ? images?.data?.map(x => ({
                          ...x?.attributes,
                          id: x?.id,
                          uid: x?.id,
                          url: API_URL + x?.attributes?.url,
                        }))
                      : [],
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
                <Form.Item label="Ảnh đại diện" className={styles.upload}>
                  {getFieldDecorator('avatar', {
                    valuePropName: 'fileList',
                    getValueFromEvent: this.normFile,
                    initialValue: avatar?.data
                      ? [
                          {
                            ...avatar?.data?.attributes,
                            id: avatar?.data?.id,
                            uid: avatar?.data?.id,
                            url: API_URL + avatar?.data?.attributes?.url,
                          },
                        ]
                      : [],
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
                    initialValue: video?.data
                      ? [
                          {
                            ...video?.data?.attributes,
                            id: video?.data?.id,
                            uid: video?.data?.id,
                            url: API_URL + video?.data?.attributes?.url,
                          },
                        ]
                      : [],
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
