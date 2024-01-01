import { useFieldSchema } from '@formily/react';
import { useCallback } from 'react';
import { useCompile } from '../../../hooks';
import { useCollectionV2 } from '../../../../application';

/**
 * label = 'popover' + x-component + [collectionName] + [title] + [postfix]
 * @returns
 */
export const useGetAriaLabelOfPopover = () => {
  const fieldSchema = useFieldSchema();
  const component = fieldSchema['x-component'];
  const compile = useCompile();
  let { name: collectionName } = useCollectionV2();
  let title = compile(fieldSchema.title);
  collectionName = collectionName ? `-${collectionName}` : '';
  title = title ? `-${title}` : '';

  const getAriaLabel = useCallback(
    (postfix?: string) => {
      postfix = postfix ? `-${postfix}` : '';
      return `popover-${component}${collectionName}${title}${postfix}`;
    },
    [collectionName, component, title],
  );

  return { getAriaLabel };
};
