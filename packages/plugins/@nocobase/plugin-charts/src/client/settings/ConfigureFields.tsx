import { useRecord_deprecated } from '@nocobase/client';
import { Table } from 'antd';
import React from 'react';

export const ConfigureFields = () => {
  const record = useRecord_deprecated();
  return (
    <Table
      columns={[
        {
          title: '字段标识',
          dataIndex: 'name',
        },
      ]}
      dataSource={record.fields || []}
    />
  );
};
