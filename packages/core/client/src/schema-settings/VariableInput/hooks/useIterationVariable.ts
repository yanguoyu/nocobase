import { Schema } from '@formily/json-schema';
import { useTranslation } from 'react-i18next';
import { useBaseVariable } from './useBaseVariable';
import { CollectionFieldOptionsV2 } from '../../../application';

/**
 * 变量：`当前对象`
 * @param param0
 * @returns
 */
export const useIterationVariable = ({
  currentCollection,
  collectionField,
  schema,
  noDisabled,
  targetFieldSchema,
}: {
  currentCollection: string;
  collectionField: CollectionFieldOptionsV2;
  schema?: any;
  noDisabled?: boolean;
  /** 消费变量值的字段 */
  targetFieldSchema?: Schema;
}) => {
  // const { getActiveFieldsName } = useFormActiveFields() || {};
  const { t } = useTranslation();
  const result = useBaseVariable({
    collectionField,
    uiSchema: schema,
    targetFieldSchema,
    maxDepth: 4,
    name: '$iteration',
    title: t('Current object'),
    collectionName: currentCollection,
    noDisabled,
    returnFields: (fields, option) => {
      // fix https://nocobase.height.app/T-2277
      return fields;
      // const activeFieldsName = getActiveFieldsName?.('nester') || [];

      // return option.depth === 0
      //   ? fields.filter((field) => {
      //       return activeFieldsName?.includes(field.name);
      //     })
      //   : fields;
    },
  });

  return result;
};
