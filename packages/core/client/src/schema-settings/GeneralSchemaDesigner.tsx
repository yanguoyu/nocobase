import { DragOutlined, MenuOutlined, PlusOutlined } from '@ant-design/icons';
import { css } from '@emotion/css';
import { useField, useFieldSchema } from '@formily/react';
import { Space } from 'antd';
import classNames from 'classnames';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DragHandler, useCompile, useDesignable, useGridContext, useGridRowContext } from '../schema-component';
import { gridRowColWrap } from '../schema-initializer/utils';
import { SchemaSettingsDropdown } from './SchemaSettings';
import { useGetAriaLabelOfDesigner } from './hooks/useGetAriaLabelOfDesigner';
import { SchemaDesignerProvider, useSchemaInitializerRender, useSchemaSettingsRender } from '../application';

const titleCss = css`
  pointer-events: none;
  position: absolute;
  font-size: 12px;
  /* background: var(--colorSettings);
  color: #fff; */
  padding: 0;
  line-height: 16px;
  height: 16px;
  border-bottom-right-radius: 2px;
  border-radius: 2px;
  top: 2px;
  left: 2px;
  .title-tag {
    padding: 0 3px;
    border-radius: 2px;
    background: var(--colorSettings);
    color: #fff;
    display: block;
  }
`;

const overrideAntdCSS = css`
  & .ant-space-item .anticon {
    margin: 0;
  }

  &:hover {
    display: block !important;
  }
`;

export interface GeneralSchemaDesignerProps {
  disableInitializer?: boolean;
  title?: string;
  template?: any;
  schemaSettings?: string;
  contextValue?: any;
  /**
   * @default true
   */
  draggable?: boolean;
}

export const GeneralSchemaDesigner: FC<GeneralSchemaDesignerProps> = (props: any) => {
  const { disableInitializer, title, template, schemaSettings, contextValue, draggable = true } = props;
  const { dn, designable } = useDesignable();
  const field = useField();
  const { t } = useTranslation();
  const fieldSchema = useFieldSchema();
  const compile = useCompile();
  const { getAriaLabel } = useGetAriaLabelOfDesigner();
  const schemaSettingsProps = {
    dn,
    field,
    fieldSchema,
  };
  const { render: schemaSettingsRender, exists: schemaSettingsExists } = useSchemaSettingsRender(
    fieldSchema['x-settings'] || schemaSettings,
    fieldSchema['x-settings-props'],
  );
  const rowCtx = useGridRowContext();
  const ctx = useGridContext();
  const templateName = ['FormItem', 'ReadPrettyFormItem'].includes(template?.componentName)
    ? `${template?.name} ${t('(Fields only)')}`
    : template?.name;
  const initializerProps = useMemo(() => {
    return {
      insertPosition: 'afterEnd',
      wrap: rowCtx?.cols?.length > 1 ? undefined : gridRowColWrap,
      Component: (props: any) => (
        <PlusOutlined
          {...props}
          role="button"
          aria-label={getAriaLabel('schema-initializer')}
          style={{ cursor: 'pointer', fontSize: 14 }}
        />
      ),
    };
  }, [getAriaLabel, rowCtx?.cols?.length]);

  if (!designable) {
    return null;
  }

  return (
    <SchemaDesignerProvider {...contextValue}>
      <div className={classNames('general-schema-designer', overrideAntdCSS)}>
        {title && (
          <div className={classNames('general-schema-designer-title', titleCss)}>
            <Space size={2}>
              <span className={'title-tag'}>{compile(title)}</span>
              {template && (
                <span className={'title-tag'}>
                  {t('Reference template')}: {templateName || t('Untitled')}
                </span>
              )}
            </Space>
          </div>
        )}
        <div className={'general-schema-designer-icons'}>
          <Space size={3} align={'center'}>
            {draggable && (
              <DragHandler>
                <DragOutlined role="button" aria-label={getAriaLabel('drag-handler')} />
              </DragHandler>
            )}
            {!disableInitializer &&
              (ctx?.InitializerComponent ? (
                <ctx.InitializerComponent {...initializerProps} />
              ) : (
                ctx?.renderSchemaInitializer?.(initializerProps)
              ))}
            {schemaSettingsExists ? (
              schemaSettingsRender(contextValue)
            ) : (
              <SchemaSettingsDropdown
                title={
                  <MenuOutlined
                    role="button"
                    aria-label={getAriaLabel('schema-settings')}
                    style={{ cursor: 'pointer', fontSize: 12 }}
                  />
                }
                {...schemaSettingsProps}
              >
                {props.children}
              </SchemaSettingsDropdown>
            )}
          </Space>
        </div>
      </div>
    </SchemaDesignerProvider>
  );
};

export interface SchemaDesignerToolbarProps {
  title?: string;
  draggable?: boolean;
  initializer?: string | boolean;
  settings?: string | boolean;
}

export const SchemaDesignerToolbar: FC<SchemaDesignerToolbarProps> = (props) => {
  const { title, initializer, settings, draggable = true } = props;
  const { designable } = useDesignable();
  const fieldSchema = useFieldSchema();
  const compile = useCompile();
  const { getAriaLabel } = useGetAriaLabelOfDesigner();

  const { render: schemaSettingsRender, exists: schemaSettingsExists } = useSchemaSettingsRender(
    fieldSchema['x-settings'] || settings,
    fieldSchema['x-settings-props'],
  );
  const { render: schemaInitializerRender, exists: schemaInitializerExists } = useSchemaInitializerRender(
    fieldSchema['x-initializer'] || initializer,
    fieldSchema['x-initializer-props'],
  );
  const rowCtx = useGridRowContext();
  const gridContext = useGridContext();

  const initializerProps: any = useMemo(() => {
    return {
      insertPosition: 'afterEnd',
      wrap: rowCtx?.cols?.length > 1 ? undefined : gridRowColWrap,
      Component: (props: any) => (
        <PlusOutlined
          {...props}
          role="button"
          aria-label={getAriaLabel('schema-initializer')}
          style={{ cursor: 'pointer', fontSize: 14 }}
        />
      ),
    };
  }, [getAriaLabel, rowCtx?.cols?.length]);

  const dragElement = useMemo(() => {
    if (draggable === false) return null;
    return (
      <DragHandler>
        <DragOutlined role="button" aria-label={getAriaLabel('drag-handler')} />
      </DragHandler>
    );
  }, [draggable, getAriaLabel]);

  const initializerElement = useMemo(() => {
    if (initializer !== false) return null;
    if (gridContext?.InitializerComponent || gridContext?.renderSchemaInitializer) {
      return gridContext?.InitializerComponent ? (
        <gridContext.InitializerComponent {...initializerProps} />
      ) : (
        gridContext.renderSchemaInitializer?.(initializerProps)
      );
    }
    if (!schemaInitializerExists) return null;
    return schemaInitializerRender(initializerProps);
  }, [gridContext, initializer, initializerProps, schemaInitializerExists, schemaInitializerRender]);

  const settingsElement = useMemo(() => {
    return settings !== false && schemaSettingsExists ? schemaSettingsRender() : null;
  }, [schemaSettingsExists, schemaSettingsRender, settings]);

  if (!designable) {
    return null;
  }

  return (
    <div className={classNames('general-schema-designer', overrideAntdCSS)}>
      {title && (
        <div className={classNames('general-schema-designer-title', titleCss)}>
          <Space size={2}>
            <span className={'title-tag'}>{compile(title)}</span>
          </Space>
        </div>
      )}
      <div className={'general-schema-designer-icons'}>
        <Space size={3} align={'center'}>
          {dragElement}
          {initializerElement}
          {settingsElement}
        </Space>
      </div>
    </div>
  );
};
