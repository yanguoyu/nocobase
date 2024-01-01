import { ISchema, useField, useFieldSchema } from '@formily/react';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFormBlockContext } from '../../../block-provider';
import {
  GeneralSchemaDesigner,
  SchemaSettingsDataScope,
  SchemaSettingsDefaultSortingRules,
  SchemaSettingsModalItem,
  SchemaSettingsRemove,
  SchemaSettingsSelectItem,
  SchemaSettingsSwitchItem,
} from '../../../schema-settings';
import { useCompile, useDesignable } from '../../hooks';
import { useCollectionManagerV2, useCollectionV2 } from '../../../application';

export const AssociationFilterItemDesigner = (props) => {
  const fieldSchema = useFieldSchema();
  const { form } = useFormBlockContext();

  const field = useField();
  const { t } = useTranslation();
  const cm = useCollectionManagerV2();
  const collection = useCollectionV2();

  const collectionField =
    collection.getField(fieldSchema['name']) || cm.getCollectionField(fieldSchema['x-collection-field']);

  const compile = useCompile();
  const { dn } = useDesignable();

  const targetFields = collectionField?.target ? cm.getCollectionFields(collectionField?.target) : [];

  const options = targetFields
    .filter((field) => !field?.target && field.type !== 'boolean')
    .map((field) => ({
      value: field?.name,
      label: compile(field?.uiSchema?.title) || field?.name,
    }));

  const onTitleFieldChange = (label) => {
    const schema = {
      ['x-uid']: fieldSchema['x-uid'],
    };
    const fieldNames = {
      label,
    };
    fieldSchema['x-component-props'] = fieldSchema['x-component-props'] || {};
    fieldSchema['x-component-props']['fieldNames'] = fieldNames;
    schema['x-component-props'] = fieldSchema['x-component-props'];
    dn.emit('patch', {
      schema,
    });
    dn.refresh();
  };

  return (
    <GeneralSchemaDesigner {...props} disableInitializer={true}>
      <SchemaSettingsModalItem
        title={t('Custom title')}
        schema={
          {
            type: 'object',
            title: t('Custom title'),
            properties: {
              title: {
                default: fieldSchema?.title,
                description: `${t('Original title: ')}${collectionField?.uiSchema?.title || fieldSchema?.title}`,
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {},
              },
            },
          } as ISchema
        }
        onSubmit={({ title }) => {
          if (title) {
            // field.title = title;
            fieldSchema.title = title;
            dn.emit('patch', {
              schema: {
                'x-uid': fieldSchema['x-uid'],
                title: fieldSchema.title,
              },
            });
          }
          dn.refresh();
        }}
      />
      <SchemaSettingsSwitchItem
        title={t('Default collapse')}
        checked={field.componentProps.defaultCollapse}
        onChange={(v) => {
          field.componentProps.defaultCollapse = v;
          fieldSchema['x-component-props']['defaultCollapse'] = v;
          dn.emit('patch', {
            schema: {
              ['x-uid']: fieldSchema['x-uid'],
              'x-component-props': fieldSchema['x-component-props'],
            },
          });
          dn.refresh();
        }}
      />
      <SchemaSettingsDataScope
        collectionName={collectionField?.target}
        defaultFilter={fieldSchema?.['x-component-props']?.params?.filter || {}}
        form={form}
        onSubmit={({ filter }) => {
          _.set(field.componentProps, 'params', {
            ...field.componentProps?.params,
            filter,
          });
          fieldSchema['x-component-props']['params'] = field.componentProps.params;
          dn.emit('patch', {
            schema: {
              ['x-uid']: fieldSchema['x-uid'],
              'x-component-props': fieldSchema['x-component-props'],
            },
          });
        }}
      />
      <SchemaSettingsDefaultSortingRules name={collectionField?.target} />
      <SchemaSettingsSelectItem
        key="title-field"
        title={t('Title field')}
        options={options}
        value={fieldSchema['x-component-props']?.fieldNames?.label}
        onChange={onTitleFieldChange}
      />
      <SchemaSettingsRemove
        breakRemoveOn={{
          'x-component': 'Grid',
        }}
      />
    </GeneralSchemaDesigner>
  );
};
