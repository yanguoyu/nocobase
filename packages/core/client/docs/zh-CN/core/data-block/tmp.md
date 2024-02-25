# 临时


## 区块介绍


## 区块扩展

### 1. 先简单定义一个 Table 组件

```tsx | pure
const MyTable = () => {
    const dataSource = [
      {
        key: '1',
        name: 'Mike',
        age: 32,
        address: '10 Downing Street',
      },
      {
        key: '2',
        name: 'John',
        age: 42,
        address: '10 Downing Street',
      },
    ];

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
      },
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
      },
    ];

   return <Table dataSource={dataSource} columns={columns} />;
}
```

<code src="./tmp-demos/demo1.tsx"></code>


### 2. 将组件注册到 NocoBase 应用中

```tsx | pure
import { Plugin } from '@nocobase/client';

class MyPlugin extends Plugin {
    async load() {
        this.app.addComponents({ MyTable })
    }
}
```

### 3. 使用 UI Schema 的方式将组件渲染到页面上

```tsx | pure
const tableSchema = {
  name: 'demo',
  type: 'void',
  'x-component': 'CardItem',
  properties: {
    [uid()]: {
      type: 'array',
      'x-component': 'MyTable',
    },
  },
}

const Root = () => {
  return <SchemaComponent schema={tableSchema} />
}

app.router.add('root', {
  path: '/',
  Component: Root,
})
```

<code src="./tmp-demos/demo2.tsx"></code>

关于 UI Schema 的更多信息请参考 [UI Schema](/core/ui-schema/schema-component) 和 [UI Schema Quick Start](https://docs-cn.nocobase.com/development/client/ui-schema/quick-start)

其中 `CardItem` 是 NocoBase 的内置组件，相当于外层的容器。

### 4. 使用 `SchemaInitializer` 将组件动态添加到页面上

首先我们将 `Root` 组件更换 Schema 为 `rootSchema`。

```tsx | pure
const rootSchema: ISchema = {
  type: 'void',
  name: 'root',
  'x-component': 'Page',
  'x-initializer': 'myInitializer',
};

const Root = () => {
  return <SchemaComponent schema={rootSchema}></SchemaComponent>;
};
```

其中 `Page` 的定义如下：

```tsx | pure
import { observer } from "@formily/react";

const AddBlockButton = observer(() => {
  const fieldSchema = useFieldSchema();
  const { render } = useSchemaInitializerRender(fieldSchema['x-initializer']);
  return render();
});

const Page = observer(
  (props) => {
    return (
      <div>
        {props.children}
        <AddBlockButton />
      </div>
    );
  },
  { displayName: 'Page' },
);
```

其中：

- `useSchemaInitializerRender()`：用于获取 `SchemaInitializer` 的渲染函数，具体用法请参考 [useSchemaInitializerRender](/core/ui-schema/schema-initializer#useschemainitializer)。
- `useFieldSchema()`：用于获取当前字段的 schema，具体用法请参考 [useFieldSchema](/core/ui-schema/designable#usefieldschema)。
- `observer`：用于将函数组件转换为响应式组件，具体用法请参考 [observer](https://react.formilyjs.org/api/shared/observer)。

`myInitializer` 的定义如下：

```tsx | pure
const TableDataBlockInitializer = () => {
  const { insert, setVisible } = useSchemaInitializer();

  const handleClick = ({ item }) => {
    const tableSchema = {
      type: 'void',
      'x-component': 'CardItem',
      properties: {
        [uid()]: {
          type: 'array',
          'x-component': 'MyTable',
        },
      },
    }
    insert(tableSchema);
    setVisible(false);
  };

  return <SchemaInitializerItem title={'Table'} onClick={handleClick} />;
};

const myInitializer = new SchemaInitializer({
  name: 'myInitializer',
  title: 'Add Block',
  insertPosition: 'beforeEnd',
  items: [
    {
      name: 'table',
      Component: TableDataBlockInitializer,
    },
  ],
});
```

我们将 `tableSchema` 放到了 `TableDataBlockInitializer` 中，当点击 `Add Block` 时，会将 `tableSchema` 插入到页面上。

关于 SchemaInitializer 的更多信息请参考 [SchemaInitializer](/core/ui-schema/schema-initializer) 和 [SchemaInitializer Quick Start](https://docs-cn.nocobase.com/development/client/ui-schema/quick-start#schemainitializer)。

最后将 `myInitializer` 注册到 NocoBase 应用中。

```diff
class MyPlugin extends Plugin {
  async load() {
    this.app.addComponents({ MyTable })
+   this.app.schemaInitializerManager.add(myInitializer);
  }
}
```

<code src="./tmp-demos/demo3.tsx"></code>

在真正的插件开发过程中只需要定义和添加 `myInitializer` 和 `MyTable` 即可，`Page` 和 `Root` 是 NocoBase 内置的组件，无需重复定义。


### 5. 从数据表中读取数据

上述 Table 中的数据是固定数据，我们需要动态的获取数据并渲染。

```diff
+ function useCollectionMenuItems() {
+   const dataSourceManager = useDataSourceManager();
+   const allCollections = dataSourceManager.getAllCollections();
+   const menus = useMemo(
+     () => allCollections.map((item) => {
+       const { key, displayName, collections } = item;
+       return {
+         name: key,
+         label: displayName,
+         type: 'subMenu',
+         children: collections.map((collection) => {
+           return {
+             name: collection.name,
+             label: collection.title,
+             collection: collection.name,
+             dataSource: key,
+           }
+         })
+       };
+     }),
+     [allCollections],
+   );
+
+   return menus;
+ }

const TableDataBlockInitializer = () => {
  const { insert, setVisible } = useSchemaInitializer();

  const handleClick = ({ item }) => {
    const tableSchema = {
      type: 'void',
+     'x-decorator': 'DataBlockProvider',
+     'x-decorator-props': {
+        collection: item.collection,
+        dataSource: item.dataSource,
+        action: 'list',
+     },
      'x-component': 'CardItem',
      properties: {
        [uid()]: {
          type: 'array',
          'x-component': 'MyTable',
        },
      },
    }
    insert(tableSchema);
    setVisible(false);
  };

+ const collectionMenuItems = useCollectionMenuItems();
  return <SchemaInitializerItem title={'Table'} items={collectionMenuItems} onClick={handleClick} />;
};
```

其中：

- [DataBlockProvider](/core/data-block/data-block-provider) 是 NocoBase 的内置组件，主要作用有4个：
  - 提供 Collection 表结构信息
  - 提供 Collection 表的数据
  - 提供对数据增删改查的 [Resource](https://docs.nocobase.com/api/sdk#action-api) 对象
  - 提供区块的配置信息

- item：是当前点击的菜单对象，包括 `collection` 和 `dataSource`。
- `useCollectionMenuItems`：是一个自定义的 hook，用于获取所有的 Collection 表信息，返回一个菜单数组。
  - `dataSourceManager`：用于获取数据源管理器，具体用法请参考 [useDataSourceManager](/core/data-source/data-source-manager-provider#usedatasourcemanager)。


然后我们修改 `MyTable` 组件

```diff
const MyTable = () => {
-  const dataSource = [
-    {
-      key: '1',
-      name: 'Mike',
-      age: 32,
-      address: '10 Downing Street',
-    },
-    {
-      key: '2',
-      name: 'John',
-      age: 42,
-      address: '10 Downing Street',
-    },
-  ];
-
-  const columns = [
-    {
-      title: 'Name',
-      dataIndex: 'name',
-      key: 'name',
-    },
-    {
-      title: 'Age',
-      dataIndex: 'age',
-      key: 'age',
-    },
-    {
-      title: 'Address',
-      dataIndex: 'address',
-      key: 'address',
-    },
-  ];


+  const { data, loading } = useDataBlockRequest<any[]>();
+  const dataSource = useMemo(() => data?.data || [], [data]);

+  const collection = useCollection();
+  const columns = useMemo(() => {
+    return collection.getFields().map((field) => {
+      return {
+        title: compile(field.uiSchema?.title || field.name),
+        dataIndex: field.name,
+      };
+    });
+  }, [collection, compile]);

  return <Table dataSource={dataSource} columns={columns} loading={loading} />;
}
```

其中：

- `useDataBlockRequest()`：由 [DataBlockProvider](/core/data-block/data-block-provider) 组件里面的 [DataBlockRequestProvider](/core/data-block/data-block-request-provider) 提供，用于获取对应的数据表结构。
- `useCollection()`：由 [DataBlockProvider](/core/data-block/data-block-provider) 组件里面的 [DataBlockRequestProvider](/core/data-source/collection-provider) 提供，用于获取当前 Collection 的信息。

<code src="./tmp-demos/demo4.tsx"></code>


### 6. 将字段渲染为自定义组件

上面一步仅是把数据渲染成普通的字符串，还需要进一步把字段渲染成不同的组件。

我们以 `nickname` 字段为例，其数据结构如下：

```json
{
  "name": "favoriteColor",
  "type": "string",
  "interface": "color",
  "uiSchema": {
    "type": "string",
    "x-component": "ColorPicker",
    "default": "#1677FF",
    "title": "Favorite Color"
  }
}
```

其和渲染相关的是 `uiSchema` 字段和 `interface` 字段，`interface` 相当于一些公共的配置，`uiSchema` 相当于一些私有的配置，更多信息请参考 [CollectionField](/core/data-source/collection-field)。

```diff
  const columns = useMemo(() => {
    return collection.getFields().map((field) => {
      return {
        title: field.uiSchema?.title || field.name,
        dataIndex: field.name,
+       render(value, record) {
+         return <SchemaComponent schema={{
+           name: field.name,
+           'x-component': 'CollectionField',
+           'x-decorator': 'FormItem',
+           'x-read-pretty': true,
+           'x-component-props': {
+             value,
+           },
+           'x-decorator-props': {
+             labelStyle: {
+               display: 'none',
+             },
+           },
+         }} />
        }
      };
    });
  }, [collection]);
```

<code src="./tmp-demos/demo5.tsx"></code>


### 6. 区块属性配置

首先我们先修改 `tableSchema`。

```diff
 const tableSchema = {
  type: 'void',
  'x-component': 'CardItem',
+ 'x-settings': 'myTableSettings',
  'x-decorator': 'DataBlockProvider',
  'x-decorator-props': {
    collection: item.collection,
    dataSource: item.dataSource,
    action: 'list',
+   tableProps: {
+     bordered: true,
+   },
  },
  properties: {
    [uid()]: {
      type: 'array',
      'x-component': 'MyTable',
+     'x-use-component-props': 'useTableProps',
    },
  },
}
```

其中：

- `x-settings`：用于指定区块的配置信息，具体用法请参考 [SchemaSettings](/core/ui-schema/schema-settings)。
- `tableProps`：Table 的属性
- `x-use-component-props`：用于动态读取的 UI Schema 属性

关于 `useTableProps` 的定义，我们先将 `MyTable` 的属性单独抽离为一个 Hook。

```tsx | pure
function useTableProps(): TableProps<any> {
const { data, loading } = useDataBlockRequest<any[]>();
  const dataSource = useMemo(() => data?.data || [], [data]);
  const collection = useCollection();
  const columns = useMemo(() => {
    return collection.getFields().map((field) => {
      return {
        title: field.uiSchema?.title || field.name,
        dataIndex: field.name,
        render(value, record) {
          return <SchemaComponent schema={{
            name: field.name,
            'x-component': 'CollectionField',
            'x-decorator': 'FormItem',
            'x-read-pretty': true,
            'x-component-props': {
              value,
            },
            'x-decorator-props': {
              labelStyle: {
                display: 'none',
              },
            },
          }} />
        }
      };
    });
  }, [collection]);

  return {
    loading,
    dataSource,
    columns,
  };
}
```

然后增加如下内容：

```diff
function useTableProps(): TableProps<any> {
+ const { tableProps } = useDataBlockProps();
  const { data, loading } = useDataBlockRequest<any[]>();
  const dataSource = useMemo(() => data?.data || [], [data]);
  const collection = useCollection();
  const columns = useMemo(() => {
    return collection.getFields().map((field) => {
      return {
        title: field.uiSchema?.title || field.name,
        dataIndex: field.name,
        render(value, record) {
          return <SchemaComponent schema={{
            name: field.name,
            'x-component': 'CollectionField',
            'x-decorator': 'FormItem',
            'x-read-pretty': true,
            'x-component-props': {
              value,
            },
            'x-decorator-props': {
              labelStyle: {
                display: 'none',
              },
            },
          }} />
        }
      };
    });
  }, [collection]);

  return {
+   ...tableProps,
    loading,
    dataSource,
    columns,
  };
}
```

其中：

- `useDataBlockProps()`：用于获取区块的配置信息，具体用法请参考 [useDataBlockProps](/core/data-block/data-block-provider#usedatablockprops)。


再将 `MyTable` 组件使用 `withDynamicSchemaProps` 包裹。

```tsx | pure
const MyTable = withDynamicSchemaProps(Table, { displayName: 'MyTable' });
```

`withDynamicSchemaProps` 的作用是能读取 Schema 中的 `x-use-component-props` 属性，将其解析并执行，然后将结果传递给组件。

然后我们实现 `myTableSettings`：

```tsx | pure
const myTableSettings = new SchemaSettings({
  name: 'myTableSettings',
  items: [
    {
      name: 'bordered',
      type: 'switch',
      useComponentProps() {
        const { props: blockSettingsProps, dn } = useDataBlock();

        return {
          title: 'Bordered',
          checked: !!blockSettingsProps.tableProps?.bordered,
          onChange: (checked) => {
            // 修改 schema
            dn.deepMerge({ 'x-decorator-props': { tableProps: { bordered: checked } } });
          },
        };
      },
    },
  ],
});
```

然后我们将 `myTableSettings` 和 `useTableProps` 注册到 NocoBase 应用中。

```diff
class MyPlugin extends Plugin {
  async load() {
    this.app.addComponents({ MyTable })
    this.app.schemaInitializerManager.add(myInitializer);
+   this.app.schemaSettingsManager.add(myTableSettings);
+   this.app.addScopes({ useTableProps });
  }
}
```

以上各个部分的关系如下：

- `tableSchema`：`tableProps` 存储属性配置信息
- `DataBlockProvider`：读取 `tableSchema` 的配置，并通过 `useDataBlockProps` 传递子组件
- `useTableProps`：通过 `useDataBlockProps` 获取 `DataBlockProvider` 提供的配置
- `MyTable`：通过 `withDynamicSchemaProps` 自动读取到 `'x-use-component-props': 'useTableProps'` 进行编译，执行 `useTableProps()` 获取到配置传递给 `Table`
- `myTableSettings`：通过 `useDataBlock()` 并修改配置 `DataBlockProvider` 提供的配置

然后在右上角的 `Settings` 中可以看到 `Bordered` 选项，可以动态修改 `Table` 的 `bordered` 属性。

<code src="./tmp-demos/demo6.tsx"></code>


### 7. 区块 Toolbar 配置

我们还可以给区块增加 Toolbar 配置，让其在左上角显示所属的 Collection 表信息。

我们先修改 `tableSchema`。

```diff
 const tableSchema = {
  type: 'void',
  'x-component': 'CardItem',
+ 'x-toolbar': 'MyToolbar',
  // ...
}
```

然后我们实现 `MyToolbar`。

```tsx | pure
const MyToolbar = (props) => {
  const collection = useCollection();
  const dataSource = useDataSource();
  const compile = useCompile();
  return <SchemaToolbar title={`${compile(dataSource.displayName)} > ${compile(collection.title)}`} {...props} />
}
```

然后我们将 `MyToolbar` 注册到 NocoBase 应用中。

```diff
class MyPlugin extends Plugin {
  async load() {
    this.app.addComponents({ MyTable })
    this.app.schemaInitializerManager.add(myInitializer);
    this.app.schemaSettingsManager.add(myTableSettings);
    this.app.addScopes({ useTableProps });
+   this.app.addComponents({ MyToolbar });
  }
}
```

这样左上角 Toolbar 就会显示所属的 Collection 表信息。

关于 `SchemaToolbar` 的更多信息请参考 [SchemaToolbar](/core/ui-schema/schema-toolbar)。

<code src="./tmp-demos/demo7.tsx"></code>

### 8. 增加顶部操作按钮

我们可以给区块增加顶部操作按钮，比如增加 `Add New` 和 `Refresh` 新增列表数据按钮。

我们先修改 `tableSchema`。

```diff
 const tableSchema = {
  type: 'void',
  'x-component': 'CardItem',
  // ...
  properties: {
+   actions: {
+     type: 'void',
+     'x-component': 'ActionBar',
+   },
    // ...
  }
}
```

然后我们实现 `ActionBar`。

```tsx | pure
const CreateAction = () => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const compile = useCompile();
  const collection = useCollection();
  const title = compile(collection.title);

  return <>
    <Button type='primary' onClick={showDrawer}>Add New</Button>
    <Drawer title={`${title} | Add New`} onClose={onClose} open={open}>
      <p>Some contents...</p>
    </Drawer>
  </>
}

const RefreshAction = () => {
  const { refresh } = useDataBlockRequest();
  return <Button onClick={refresh}>Refresh</Button>
}

const ActionBar = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: "var(--nb-spacing)" }}>
      <Space>
        <CreateAction></CreateAction>
        <RefreshAction></RefreshAction>
      </Space>
    </div>
  )
};
```

其中：

- `useDataBlockRequest()`： 用于获取区块的请求对象，具体用法请参考 [useDataBlockRequest](/core/data-block/data-block-request-provider#usedatablockrequest)。

然后我们将 `ActionBar` 注册到 NocoBase 应用中。

```diff
class MyPlugin extends Plugin {
  async load() {
    // ...
+   this.app.addComponents({ ActionBar });
  }
}
```

<code src="./tmp-demos/demo8.tsx"></code>

### 9. 动态配置顶部操作按钮

上面的 `ActionBar` 里面的 `CreateAction` 和 `RefreshAction` 是固定的，我们可以将其配置动态化。

首先修改 `tableSchema`。

```diff
 const tableSchema = {
  type: 'void',
  'x-component': 'CardItem',
  // ...
  properties: {
    actions: {
      type: 'void',
      'x-component': 'ActionBar',
+     'x-initializer': 'tableActionInitializers',
    },
    // ...
  }
}
```

然后我们实现 `tableActionInitializers`。

```tsx | pure
const CreateActionInitializer = () => {
  const { insert } = useSchemaInitializer();
  const handleClick = () => {
    insert({
      type: 'void',
      'x-component': 'CreateAction',
    });
  };
  return <SchemaInitializerItem title={'Add New'} onClick={handleClick}></SchemaInitializerItem>;
}


const RefreshActionInitializer = () => {
  const { insert } = useSchemaInitializer();
  const handleClick = () => {
    insert({
      type: 'void',
      'x-component': 'RefreshAction',
    });
  };
  return <SchemaInitializerItem title={'Add New'} onClick={handleClick}></SchemaInitializerItem>;
}

const tableActionInitializers = new SchemaInitializer({
  name: 'tableActionInitializers',
  title: "Configure actions",
  icon: 'SettingOutlined',
  style: {
    marginLeft: 8,
  },
  items: [
    {
      type: 'item',
      name: 'addNew',
      title: "Add New",
      Component: CreateActionInitializer,
    },
    {
      type: 'item',
      name: 'refresh',
      title: "Refresh",
      Component: RefreshActionInitializer,
    },
  ]
})
```

然后修改 `ActionBar`：

```diff
const ActionBar = ({ children }) => {
+ const fieldSchema = useFieldSchema();
+ const { render } = useSchemaInitializerRender(fieldSchema['x-initializer']);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: "var(--nb-spacing)" }}>
      <Space>
+       {children}
+       {render()}
      </Space>
    </div>
  )
};
```

然后我们将 `tableActionInitializers` 和 `CreateAction`、`RefreshAction` 注册到 NocoBase 应用中。

```diff
class MyPlugin extends Plugin {
  async load() {
    // ...
+   this.app.addComponents({ CreateAction, RefreshAction });
+   this.app.schemaInitializerManager.add(tableActionInitializers);
  }
}
```

<code src="./tmp-demos/demo9.tsx"></code>

### 10. 动态配置 table 列

首先修改 `tableSchema`。

```diff
const tableSchema = {
  type: 'void',
  'x-component': 'CardItem',
  // ...
  properties: {
    action: {
      // ...
    },
    [uid()]: {
      type: 'array',
      'x-component': 'MyTable',
+     'x-initializer': 'tableColumnInitializers',
      'x-use-component-props': 'useTableProps',
    },
  }
}
```

然后我们实现 `tableColumnInitializers`。

```tsx | pure
const tableColumnInitializers = new SchemaInitializer({
  name: 'tableColumnInitializers',
  insertPosition: 'beforeEnd',
  icon: 'SettingOutlined',
  title: 'Configure columns',
  items: [
    {
      name: 'displayFields',
      type: 'itemGroup',
      title: 'Display fields',
      useChildren: useTableColumnInitializerFields,
    }
  ],
})

const useTableColumnInitializerFields = () => {
  const collection = useCollection();
  return collection.fields.map((field) => {
    return {
      type: 'item',
      name: field.name,
      title: field?.uiSchema?.title || field.name,
      'x-collection-field': `${collection.name}.${field.name}`,
      Component: 'TableCollectionFieldInitializer',
      schema: {
        type: 'void',
        name: field.name,
        title: field?.uiSchema?.title || field.name,
        'x-component': 'CollectionField',
        'x-decorator': 'FormItem',
        'x-read-pretty': true,
        'x-decorator-props': {
          labelStyle: {
            display: 'none',
          },
        },
      }
    }
  });
}

export const TableCollectionFieldInitializer = () => {
  const itemConfig = useSchemaInitializerItem();
  const { insert } = useSchemaInitializer();
  const { exists, remove } = useCurrentSchema(itemConfig['x-collection-field'], 'x-collection-field');
  return <SchemaInitializerSwitch
    checked={exists}
    title={itemConfig.title}
    onClick={() => {
      if (exists) {
        return remove();
      }
      insert(itemConfig.schema);
    }}
  />;
};
```

然后我们修改 `useTableProps`，增加 `useTableColumns`：

```diff
function useTableProps(): TableProps<any> {
  const { tableProps } = useDataBlockProps();
  const { data, loading } = useDataBlockRequest<any[]>();
  const dataSource = useMemo(() => data?.data || [], [data]);
+ const columns = useTableColumns();

  return {
    ...tableProps,
    loading,
    dataSource,
    columns,
  };
}
```

```tsx | pure
function useTableColumns() {
  const schema = useFieldSchema();
  const { designable } = useDesignable();
  const { render } = useSchemaInitializerRender(schema['x-initializer'], schema['x-initializer-props']);
  const columns = schema.mapProperties((field: any, name) => {
    return {
      title: field.title || name,
      dataIndex: name,
      key: name,
      render(value, record) {
        return (
          <RecordProvider record={record}>
            <SchemaComponent
              schema={field.toJSON()}
            />
          </RecordProvider>
        );
      },
    }
  });
  const tableColumns = useMemo(() => {
    return [
      ...columns,
      {
        title: render(),
        dataIndex: 'TABLE_COLUMN_INITIALIZER',
        key: 'TABLE_COLUMN_INITIALIZER',
        render: designable ? () => <div style={{ minWidth: 300 }} /> : null,
      }
    ];
  }, [columns, render, designable]);

  return tableColumns;
}
```

然后我们将 `tableColumnInitializers` 和 `TableCollectionFieldInitializer` 注册到 NocoBase 应用中。

```diff
class MyPlugin extends Plugin {
  async load() {
    // ...
+   this.app.schemaInitializerManager.add(tableColumnInitializers);
+   this.app.addComponents({ TableCollectionFieldInitializer });
  }
}
```

<code src="./tmp-demos/demo10.tsx"></code>

### 11. 增加操作列

<code src="./tmp-demos/demo11.tsx"></code>