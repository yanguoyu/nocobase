import { createForm, onFieldValueChange } from '@formily/core';
import { FieldContext, FormContext } from '@formily/react';
import { merge } from '@formily/shared';
import React, { useCallback, useContext, useMemo } from 'react';
import { SchemaComponent } from '../../core';
import { useComponent } from '../../hooks';
import { FilterContext } from './context';
import { CollectionFieldOptionsV2 } from '../../../application';

export interface DynamicComponentProps {
  value: any;
  /**
   * `Filter` 组件左侧选择的字段
   */
  collectionField: CollectionFieldOptionsV2;
  onChange: (value: any) => void;
  renderSchemaComponent: () => React.JSX.Element;
}

interface Props {
  schema: any;
  value: any;
  collectionField: CollectionFieldOptionsV2;
  onChange: (value: any) => void;
}

export const DynamicComponent = (props: Props) => {
  const { dynamicComponent, disabled } = useContext(FilterContext);
  const component = useComponent(dynamicComponent);
  const form = useMemo(() => {
    return createForm({
      values: {
        value: props.value,
      },
      disabled,
      effects() {
        onFieldValueChange('value', (field) => {
          props?.onChange?.(field.value);
        });
      },
    });
  }, [JSON.stringify(props.value), props.schema]);
  const renderSchemaComponent = useCallback(() => {
    return (
      <FieldContext.Provider value={null}>
        <SchemaComponent
          schema={{
            'x-component': 'Input',
            ...props.schema,
            'x-component-props': merge(props?.schema?.['x-component-props'] || {}, {
              style: {
                minWidth: 150,
              },
            }),
            name: 'value',
            'x-read-pretty': false,
            'x-validator': undefined,
            'x-decorator': undefined,
          }}
        />
      </FieldContext.Provider>
    );
  }, [props.schema]);
  return (
    <FormContext.Provider value={form}>
      {component
        ? React.createElement<DynamicComponentProps>(component, {
            value: props.value,
            collectionField: props.collectionField,
            onChange: props?.onChange,
            renderSchemaComponent,
          })
        : renderSchemaComponent()}
    </FormContext.Provider>
  );
};
