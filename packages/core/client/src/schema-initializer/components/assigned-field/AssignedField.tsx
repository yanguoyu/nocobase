import { Field } from '@formily/core';
import { useField, useFieldSchema } from '@formily/react';
import { merge } from '@formily/shared';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useFormBlockContext } from '../../../block-provider';
import { InheritanceCollectionMixin, useCollectionFilterOptions } from '../../../collection-manager';
import { useRecord } from '../../../record-provider';
import { useCompile, useComponent } from '../../../schema-component';
import { VariableInput, getShouldChange } from '../../../schema-settings/VariableInput/VariableInput';
import { Option } from '../../../schema-settings/VariableInput/type';
import { formatVariableScop } from '../../../schema-settings/VariableInput/utils/formatVariableScop';
import { useLocalVariables, useVariables } from '../../../variables';
import { DeletedField } from '../DeletedField';
import {
  CollectionFieldProviderV2,
  useCollectionFieldV2,
  useCollectionManagerV2,
  useCollectionV2,
} from '../../../application';

interface AssignedFieldProps {
  value: any;
  onChange: (value: any) => void;
  [key: string]: any;
}

const InternalField: React.FC = (props) => {
  const field = useField<Field>();
  const fieldSchema = useFieldSchema();
  const { uiSchema } = useCollectionFieldV2();
  const component = useComponent(uiSchema?.['x-component']);
  const compile = useCompile();
  const setFieldProps = (key, value) => {
    field[key] = typeof field[key] === 'undefined' ? value : field[key];
  };
  const setRequired = () => {
    if (typeof fieldSchema['required'] === 'undefined') {
      field.required = !!uiSchema['required'];
    }
  };
  const ctx = useFormBlockContext();

  useEffect(() => {
    if (ctx?.field) {
      ctx.field.added = ctx.field.added || new Set();
      ctx.field.added.add(fieldSchema.name);
    }
  });

  useEffect(() => {
    if (!uiSchema) {
      return;
    }
    setFieldProps('content', uiSchema['x-content']);
    setFieldProps('title', uiSchema.title);
    setFieldProps('description', uiSchema.description);
    setFieldProps('initialValue', uiSchema.default);
    // if (!field.validator && uiSchema['x-validator']) {
    //   field.validator = uiSchema['x-validator'];
    // }
    if (fieldSchema['x-disabled'] === true) {
      field.disabled = true;
    }
    if (fieldSchema['x-read-pretty'] === true) {
      field.readPretty = true;
    }
    setRequired();
    // @ts-ignore
    field.dataSource = uiSchema.enum;
    const originalProps = compile(uiSchema['x-component-props']) || {};
    const componentProps = merge(originalProps, field.componentProps || {});
    field.componentProps = componentProps;
    // field.component = [component, componentProps];
  }, [JSON.stringify(uiSchema)]);
  if (!uiSchema) {
    return null;
  }
  return React.createElement(component, props, props.children);
};

const CollectionField = (props) => {
  const fieldSchema = useFieldSchema();
  return (
    <CollectionFieldProviderV2 name={fieldSchema.name} fallback={<DeletedField />}>
      <InternalField {...props} />
    </CollectionFieldProviderV2>
  );
};

export enum AssignedFieldValueType {
  ConstantValue = 'constantValue',
  DynamicValue = 'dynamicValue',
}

export const AssignedField = (props: AssignedFieldProps) => {
  const { value, onChange } = props;
  const cm = useCollectionManagerV2<InheritanceCollectionMixin>();
  const collection = useCollectionV2();
  const { form } = useFormBlockContext();
  const fieldSchema = useFieldSchema();
  const record = useRecord();
  const variables = useVariables();
  const localVariables = useLocalVariables();
  const currentFormFields = useCollectionFilterOptions(collection);

  const { name } = collection;
  const collectionField = collection.getField(fieldSchema.name);

  const shouldChange = useMemo(
    () => getShouldChange({ collectionField, variables, localVariables, collectionManager: cm }),
    [collectionField, cm, localVariables, variables],
  );

  const returnScope = useCallback(
    (scope: Option[]) => {
      const currentForm = scope.find((item) => item.value === '$nForm');
      const fields = cm.getCollectionFields(name);

      // fix https://nocobase.height.app/T-1355
      // 工作流人工节点的 `自定义表单` 区块，与其它表单区块不同，根据它的数据表名称，获取到的字段列表为空，所以需要在这里特殊处理一下
      if (!fields?.length && currentForm) {
        currentForm.children = formatVariableScop(currentFormFields);
      }

      return scope;
    },
    [currentFormFields, name],
  );

  const renderSchemaComponent = useCallback(
    ({ value, onChange }): React.JSX.Element => {
      return <CollectionField {...props} value={value} onChange={onChange} />;
    },
    [JSON.stringify(_.omit(props, 'value'))],
  );
  return (
    <VariableInput
      form={form}
      record={record}
      value={value}
      onChange={onChange}
      renderSchemaComponent={renderSchemaComponent}
      collectionField={collectionField}
      shouldChange={shouldChange}
      returnScope={returnScope}
      targetFieldSchema={fieldSchema}
    />
  );
};
