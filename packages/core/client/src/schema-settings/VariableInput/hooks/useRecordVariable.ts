import { Schema } from '@formily/json-schema';
import { useTranslation } from 'react-i18next';
import { useBaseVariable } from './useBaseVariable';
import { CollectionFieldOptionsV2 } from '../../../application';

interface Props {
  collectionField: CollectionFieldOptionsV2;
  schema: any;
  collectionName: string;
  noDisabled?: boolean;
  /** 消费变量值的字段 */
  targetFieldSchema?: Schema;
}

export const useRecordVariable = (props: Props) => {
  const { t } = useTranslation();

  const currentRecordVariable = useBaseVariable({
    collectionField: props.collectionField,
    uiSchema: props.schema,
    name: '$nRecord',
    title: t('Current record'),
    collectionName: props.collectionName,
    noDisabled: props.noDisabled,
    targetFieldSchema: props.targetFieldSchema,
  });

  return currentRecordVariable;
};
