import { Field } from '@formily/core';
import { useField, useFieldSchema } from '@formily/react';
import { useTranslation } from 'react-i18next';
import { SchemaSettings } from '../../../../application/schema-settings/SchemaSettings';
import { useFieldComponentName } from '../../../../common/useFieldComponentName';
import {
  useDesignable,
  useFieldModeOptions,
  useIsAddNewForm,
  useIsFieldReadPretty,
} from '../../../../schema-component';
import { isSubMode } from '../../../../schema-component/antd/association-field/util';

const fieldComponent: any = {
  name: 'fieldComponent',
  type: 'select',
  useComponentProps() {
    const { t } = useTranslation();
    const field = useField<Field>();
    const fieldSchema = useFieldSchema();
    const fieldModeOptions = useFieldModeOptions();
    const isAddNewForm = useIsAddNewForm();
    const fieldComponentName = useFieldComponentName();
    const { dn } = useDesignable();

    return {
      title: t('Field component'),
      options: fieldModeOptions,
      value: fieldComponentName,
      onChange(mode) {
        const schema = {
          ['x-uid']: fieldSchema['x-uid'],
        };
        fieldSchema['x-component-props'] = fieldSchema['x-component-props'] || {};
        fieldSchema['x-component-props']['mode'] = mode;
        schema['x-component-props'] = fieldSchema['x-component-props'];
        field.componentProps = field.componentProps || {};
        field.componentProps.mode = mode;

        // 子表单状态不允许设置默认值
        if (isSubMode(fieldSchema) && isAddNewForm) {
          // @ts-ignore
          schema.default = null;
          fieldSchema.default = null;
          field.setInitialValue(null);
          field.setValue(null);
        }

        void dn.emit('patch', {
          schema,
        });
        dn.refresh();
      },
    };
  },
};
const allowSelectExistingRecord = {
  name: 'allowSelectExistingRecord',
  type: 'switch',
  useVisible() {
    const readPretty = useIsFieldReadPretty();
    return !readPretty;
  },
  useComponentProps() {
    const { t } = useTranslation();
    const field = useField<Field>();
    const fieldSchema = useFieldSchema();
    const { dn, refresh } = useDesignable();
    return {
      title: t('Allow selection of existing records'),
      checked: fieldSchema['x-component-props']?.allowSelectExistingRecord,
      onChange(value) {
        const schema = {
          ['x-uid']: fieldSchema['x-uid'],
        };
        field.componentProps.allowSelectExistingRecord = value;
        fieldSchema['x-component-props'] = fieldSchema['x-component-props'] || {};
        fieldSchema['x-component-props'].allowSelectExistingRecord = value;
        schema['x-component-props'] = fieldSchema['x-component-props'];
        dn.emit('patch', {
          schema,
        });
        refresh();
      },
    };
  },
};
export const subTablePopoverComponentFieldSettings = new SchemaSettings({
  name: 'fieldSettings:component:SubTable',
  items: [fieldComponent, allowSelectExistingRecord],
});
