import { TableOutlined } from '@ant-design/icons';
import {
  Plugin,
  SchemaComponentOptions,
  SchemaInitializer,
  SchemaInitializerContext,
  SettingsCenterProvider,
} from '@nocobase/client';
import { Button, Card, Checkbox, Table } from 'antd';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelloDesigner } from './HelloDesigner';

import { InboxOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Modal, Result, Upload, message } from 'antd';

const LearnMore: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const dataSource = [
    {
      key: '1',
      name: 'Collection 1',
      description: 'collection1',
    },
    {
      key: '2',
      name: 'Collection 2',
      description: 'collection2',
    },
    {
      key: '3',
      name: 'Collection 3',
      description: 'collection3',
    },
  ];

  const columns = [
    {
      title: 'Collection display name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Collection name',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <>
      <a onClick={showModal}>Learn more</a>
      <Modal open={isModalOpen} footer={null} onOk={handleOk} onCancel={handleCancel}>
        <h3>System metadata</h3>
        <Table bordered size={'small'} dataSource={dataSource} columns={columns} />
        <h3>System config</h3>
        <Table bordered size={'small'} dataSource={dataSource} columns={columns} />
        <h3>Business data</h3>
        <Table bordered size={'small'} dataSource={dataSource} columns={columns} />
      </Modal>
    </>
  );
};

const { Dragger } = Upload;

const props: UploadProps = {
  name: 'file',
  multiple: true,
  action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
  onChange(info) {
    const { status } = info.file;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};

const RestoreUpload: React.FC = () => (
  <Dragger {...props}>
    <p className="ant-upload-drag-icon">
      <InboxOutlined />
    </p>
    <p className="ant-upload-text">Click or drag file to this area to upload</p>
    <p className="ant-upload-hint">
      Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.
    </p>
  </Dragger>
);

export const HelloBlockInitializer = (props) => {
  const { insert } = props;
  const { t } = useTranslation();
  return (
    <SchemaInitializer.Item
      {...props}
      icon={<TableOutlined />}
      onClick={() => {
        insert({
          type: 'void',
          'x-component': 'CardItem',
          'x-designer': 'HelloDesigner',
          properties: {
            hello: {
              type: 'void',
              'x-component': 'div',
              'x-content': 'Hello World',
            },
          },
        });
      }}
      title={t('Hello block')}
    />
  );
};

const HelloProvider = React.memo((props) => {
  const items = useContext<any>(SchemaInitializerContext);
  const mediaItems = items.BlockInitializers.items.find((item) => item.key === 'media');

  if (process.env.NODE_ENV !== 'production' && !mediaItems) {
    throw new Error('media block initializer not found');
  }

  const children = mediaItems.children;
  if (!children.find((item) => item.key === 'hello')) {
    children.push({
      key: 'hello',
      type: 'item',
      title: '{{t("Hello block")}}',
      component: 'HelloBlockInitializer',
    });
  }

  return (
    <SettingsCenterProvider
      settings={{
        'sample-hello': {
          title: 'Backup & Restore',
          icon: 'ApiOutlined',
          tabs: {
            tab1: {
              title: 'Backup',
              component: () => (
                <div>
                  <Card bordered={false}>
                    <strong style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>
                      Select the data to be backed up (
                      <LearnMore />
                      ):
                    </strong>
                    <div style={{ lineHeight: 2, marginBottom: 8 }}>
                      <Checkbox defaultChecked disabled /> System metadata
                      <br />
                      <Checkbox /> System config
                      <br />
                      <Checkbox /> Business data
                    </div>
                    <Button type="primary">Start backup</Button>{' '}
                  </Card>
                  <br />
                  <br />
                  <Card bordered={false}>
                    <Result icon={<LoadingOutlined />} title="Backing up" subTitle="message..." />
                  </Card>
                  <br />
                  <br />
                  <Card bordered={false}>
                    <Result
                      status="success"
                      title="Backed up successfully"
                      extra={[
                        <Button type="primary" key="console">
                          Download
                        </Button>,
                      ]}
                    />
                  </Card>
                </div>
              ),
            },
            tab2: {
              title: 'Restore',
              component: () => (
                <div>
                  <Card bordered={false}>
                    <RestoreUpload />
                  </Card>
                  <br />
                  <br />
                  <Card bordered={false}>
                    <strong style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>
                      Select the data to be restored (<LearnMore />
                      ):
                    </strong>
                    <div style={{ lineHeight: 2, marginBottom: 16 }}>
                      <Checkbox defaultChecked disabled /> System metadata
                      <br />
                      <Checkbox /> System config
                      <br />
                      <Checkbox /> Business data
                    </div>
                    <Button type="primary">Start restore</Button>{' '}
                  </Card>

                  <br />
                  <br />
                  <Card bordered={false}>
                    <Result icon={<LoadingOutlined />} title="Restoring" subTitle="message..." />
                  </Card>
                </div>
              ),
            },
          },
        },
      }}
    >
      <SchemaComponentOptions components={{ HelloDesigner, HelloBlockInitializer }}>
        <SchemaInitializerContext.Provider value={items}>{props.children}</SchemaInitializerContext.Provider>
      </SchemaComponentOptions>
    </SettingsCenterProvider>
  );
});
HelloProvider.displayName = 'HelloProvider';

class HelloPlugin extends Plugin {
  async load() {
    this.app.addProvider(HelloProvider);
  }
}

export default HelloPlugin;
