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
import styles from './style.less';

const FormItem = Form.Item;

@connect(({ loading }) => ({
  submitting: loading.effects['sources/add'],
}))
class PopupAddSource extends Component {

  state = {
    typeOfSource: "Video"
  }

  openNotificationWithIcon = type => {
    notification[type]({
      message: 'Send Notification Success',
      description: 'Send notification success.',
    });
  };

  onChangeType = type => {
    this.setState({ typeOfSource: type });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    if (form) {
      form.validateFields(this.submit);
    }
  };

  submit = (err, values) => {
    if (!err) {
      const { type, dataPopup, dispatch } = this.props;
      if (type != 'Add') values.id = dataPopup.id;
      values.state="Pending"
      dispatch({
        type: type == 'Add' ? 'sources/add' : 'sources/update',
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
    console.log(e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  render() {
    const { typeOfSource } = this.state;
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
    const { name = '', isOffline = true, type: typeSource, url, tag, file } = dataPopup || {};
    const files = getFieldValue('files') || [];
    return (
      <GridContent>
        <Modal
          visible={show}
          title={type + ' Source'}
          okText="Submit"
          width={680}
          onCancel={this.closePopup}
          onOk={this.handleSubmit}
          confirmLoading={submitting}
        >
          <Form onSubmit={onSubmit} layout="vertical">
            <Row gutter={12}>
              <Col md={12}>
                <FormItem label="Name">
                  {getFieldDecorator('name', {
                    rules: [
                      {
                        required: true,
                        message: 'Please input source name!',
                      },
                    ],
                    initialValue: name,
                  })(<Input placeholder="Enter source name" />)}
                </FormItem>
              </Col>
              <Col md={8}>
                <FormItem label="Type">
                  {getFieldDecorator('type', {
                    initialValue: typeSource || 'Video',
                  })(
                    <Select placeholder="Select type of source" onChange={this.onChangeType}>
                      {/* <Select.Option value="Image">Image</Select.Option> */}
                      <Select.Option value="Video">Video</Select.Option>
                      <Select.Option value="Camera">Camera</Select.Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
              <Col md={4}>
                <FormItem label="Offline">
                  {getFieldDecorator('isOffline', {
                    rules: [],
                    initialValue: isOffline,
                    valuePropName: 'checked',
                  })(<Switch />)}
                </FormItem>
              </Col>              
              {
                typeOfSource !== "Camera" &&
                <Col md={10}>
                  <Form.Item
                    label="Upload Source"
                    extra="Select Image or Video (Max: 100MB)"
                    className={styles.upload}
                  >
                    {getFieldDecorator('files', {
                      valuePropName: 'fileList',
                      getValueFromEvent: this.normFile,
                      initialValue: [file].filter(Boolean),
                    })(
                      <Upload
                        name="file"
                        listType="picture-card"
                        accept="video/*,image/*"
                        showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
                      >
                        {files.length == 0 && (
                          <div>
                            <Icon type="plus" />
                            <div className="ant-upload-text">Upload</div>
                          </div>
                        )}
                      </Upload>,
                    )}
                  </Form.Item>
                </Col>
              }
              {
                typeOfSource !== "Image" &&
                <Col md={14}>
                  <FormItem label="URL Source">
                    {getFieldDecorator('url', {
                      // rules: [
                      //   {
                      //     required: files.length == 0,
                      //     message: 'Please input url source!',
                      //   },
                      //   {
                      //     type: 'url',
                      //     message: 'Please input valid url!',
                      //   },
                      // ],
                      initialValue: url,
                    })(<Input placeholder="Enter url source" />)}
                  </FormItem>
                </Col>
              }              
              <Col md={24}>
                <FormItem label="Tags">
                  {getFieldDecorator('tag', {
                    initialValue: tag,
                  })(<Input placeholder="Enter source tag" />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      </GridContent>
    );
  }
}

export default Form.create()(PopupAddSource);
