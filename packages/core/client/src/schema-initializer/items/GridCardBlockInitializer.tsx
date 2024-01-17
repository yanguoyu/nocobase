import React from 'react';
import { OrderedListOutlined } from '@ant-design/icons';
import { createGridCardBlockSchema } from '../utils';
import { DataBlockInitializer } from './DataBlockInitializer';
import { useCollectionManager } from '../../collection-manager';
import { useSchemaInitializer, useSchemaInitializerItem } from '../../application';

export const GridCardBlockInitializer = () => {
  const { insert } = useSchemaInitializer();
  const { getCollection } = useCollectionManager();
  const itemConfig = useSchemaInitializerItem();
  return (
    <DataBlockInitializer
      {...itemConfig}
      icon={<OrderedListOutlined />}
      componentType={'GridCard'}
      onCreateBlockSchema={async ({ item }) => {
        const collection = getCollection(item.name, item.namespace);
        const schema = createGridCardBlockSchema({
          collection: item.name,
          namespace: item.namespace,
          rowKey: collection.filterTargetKey || 'id',
        });
        insert(schema);
      }}
    />
  );
};
