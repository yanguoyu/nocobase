import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useForm, useField } from '@formily/react';
import { useParams } from 'react-router-dom';
import { useAPIClient, useRecord_deprecated, useResourceActionContext, useActionContext } from '@nocobase/client';

export const useDestroyAction = () => {
  const { refresh } = useResourceActionContext();
  const { name: dataSourceKey } = useParams();
  const { name: filterByTk, collectionName } = useRecord_deprecated();
  const api = useAPIClient();
  return {
    async run() {
      await api.request({
        url: `dataSourcesCollections/${dataSourceKey}.${collectionName}/fields:destroy?filterByTk=${filterByTk}`,
        method: 'post',
      });
      refresh();
    },
  };
};

export const useBulkDestroyAction = () => {
  const { state, setState, refresh } = useResourceActionContext();
  const { t } = useTranslation();
  const { name: dataSourceKey } = useParams();
  const api = useAPIClient();
  const { name } = useRecord_deprecated();
  return {
    async run() {
      if (!state?.selectedRowKeys?.length) {
        return message.error(t('Please select the records you want to delete'));
      }
      await api.request({
        url: `dataSourcesCollections/${dataSourceKey}.${name}/fields:destroy`,
        method: 'post',
        params: { filterByTk: state?.selectedRowKeys || [] },
      });
      setState?.({ selectedRowKeys: [] });
      refresh();
    },
  };
};

export const useBulkDestroyActionAndRefreshCM = () => {
  const { run } = useBulkDestroyAction();
  // const { refreshCM } = useCollectionManager_deprecated();
  return {
    async run() {
      await run();
      // await refreshCM();
    },
  };
};

export const useDestroyActionAndRefreshCM = () => {
  const { run } = useDestroyAction();
  // const { refreshCM } = useCollectionManager_deprecated();
  return {
    async run() {
      await run();
      // await refreshCM();
    },
  };
};
