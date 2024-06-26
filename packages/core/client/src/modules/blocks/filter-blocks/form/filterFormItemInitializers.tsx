import { CompatibleSchemaInitializer } from '../../../../application/schema-initializer/CompatibleSchemaInitializer';
import {
  FilterAssociatedFields,
  FilterParentCollectionFields,
} from '../../../../schema-initializer/buttons/FormItemInitializers';
import { gridRowColWrap, useFilterFormItemInitializerFields } from '../../../../schema-initializer/utils';

/**
 * @deprecated
 * use `filterFormItemInitializers` instead
 */
export const filterFormItemInitializers_deprecated = new CompatibleSchemaInitializer({
  name: 'FilterFormItemInitializers',
  wrap: gridRowColWrap,
  icon: 'SettingOutlined',
  title: '{{t("Configure fields")}}',
  items: [
    {
      type: 'itemGroup',
      name: 'displayFields',
      title: '{{t("Display fields")}}',
      useChildren: useFilterFormItemInitializerFields,
    },
    {
      name: 'parentCollectionFields',
      Component: FilterParentCollectionFields,
    },
    {
      name: 'associationFields',
      Component: FilterAssociatedFields,
    },
    {
      name: 'divider',
      type: 'divider',
    },
    {
      title: '{{t("Add text")}}',
      Component: 'MarkdownFormItemInitializer',
      name: 'addText',
    },
  ],
});

export const filterFormItemInitializers = new CompatibleSchemaInitializer(
  {
    name: 'filterForm:configureFields',
    wrap: gridRowColWrap,
    icon: 'SettingOutlined',
    title: '{{t("Configure fields")}}',
    items: [
      {
        type: 'itemGroup',
        name: 'displayFields',
        title: '{{t("Display fields")}}',
        useChildren: useFilterFormItemInitializerFields,
      },
      {
        name: 'parentCollectionFields',
        Component: FilterParentCollectionFields,
      },
      {
        name: 'associationFields',
        Component: FilterAssociatedFields,
      },
      {
        name: 'divider',
        type: 'divider',
      },
      {
        title: '{{t("Add text")}}',
        Component: 'MarkdownFormItemInitializer',
        name: 'addText',
      },
    ],
  },
  filterFormItemInitializers_deprecated,
);
