import { RecordProvider, useRecord } from '../../record-provider';
import React, { useMemo, useState } from 'react';
import { ActionContextProvider, FormProvider, SchemaComponent, useActionContext } from '../../schema-component';
import { SyncOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { uid } from '@formily/shared';
import { useCancelAction } from '../action-hooks';
import { FieldsConfigure, PreviewTable, SQLRequestProvider } from '../templates/components/sql-collection';
import { createForm } from '@formily/core';
import { FormLayout } from '@formily/antd-v5';
import { useResourceActionContext, useResourceContext } from '../ResourceActionProvider';
import { useAPIClient } from '../../api-client';
import { useField, useForm } from '@formily/react';

const schema = {
  type: 'object',
  properties: {
    [uid()]: {
      type: 'void',
      title: '{{ t("Sync from database") }}',
      'x-component': 'Action.Drawer',
      'x-decorator': 'FormLayout',
      'x-decorator-props': {
        layout: 'vertical',
      },
      properties: {
        config: {
          type: 'void',
          'x-decorator': SQLRequestProvider,
          'x-decorator-props': {
            manual: false,
          },
          properties: {
            sql: {
              type: 'string',
            },
            sources: {
              type: 'array',
              title: '{{t("Source collections")}}',
              'x-decorator': 'FormItem',
              'x-component': 'Select',
              'x-component-props': {
                multiple: true,
              },
              'x-reactions': ['{{useAsyncDataSource(loadCollections)}}'],
            },
            fields: {
              type: 'array',
              title: '{{t("Fields")}}',
              'x-decorator': 'FormItem',
              'x-component': FieldsConfigure,
              required: true,
            },
            table: {
              type: 'void',
              title: '{{t("Preview")}}',
              'x-decorator': 'FormItem',
              'x-component': PreviewTable,
            },
          },
        },
        footer: {
          type: 'void',
          'x-component': 'Action.Drawer.Footer',
          properties: {
            cancel: {
              title: '{{ t("Cancel") }}',
              'x-component': 'Action',
              'x-component-props': {
                useAction: '{{ useCancelAction }}',
              },
            },
            submit: {
              title: '{{ t("Submit") }}',
              'x-component': 'Action',
              'x-component-props': {
                type: 'primary',
                useAction: '{{ useSyncFromDB }}',
              },
            },
          },
        },
      },
    },
  },
};

const useSyncFromDB = (refreshCMList?: any) => {
  const form = useForm();
  const ctx = useActionContext();
  const cm = useCollectionManager();
  const { refresh } = useResourceActionContext();
  const { targetKey } = useResourceContext();
  const { [targetKey]: filterByTk } = useRecord();
  const api = useAPIClient();
  const field = useField();
  return {
    async run() {
      await form.submit();
      field.data = field.data || {};
      field.data.loading = true;
      try {
        await api.resource('sqlCollection').setFields({
          filterByTk,
          values: {
            fields: form.values.fields,
            sources: form.values.sources,
          },
        });
        ctx.setVisible(false);
        await form.reset();
        field.data.loading = false;
        refresh();
        await cm.reload(refresh);
        await refreshCMList?.();
      } catch (err) {
        field.data.loading = false;
      }
    },
  };
};

export const SyncSQLFieldsAction: React.FC<{
  refreshCMList: any;
}> = ({ refreshCMList }) => {
  const record = useRecord();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const form = useMemo(
    () =>
      createForm({
        initialValues: record,
      }),
    [record],
  );

  return (
    record.template === 'sql' && (
      <RecordProvider record={record}>
        <FormProvider form={form}>
          <ActionContextProvider value={{ visible, setVisible }}>
            <Button icon={<SyncOutlined />} onClick={(e) => setVisible(true)}>
              {t('Sync from database')}
            </Button>
            <SchemaComponent
              schema={schema}
              components={{ FormLayout }}
              scope={{
                useCancelAction,
                useSyncFromDB: () => useSyncFromDB(refreshCMList),
              }}
            />
          </ActionContextProvider>
        </FormProvider>
      </RecordProvider>
    )
  );
};
