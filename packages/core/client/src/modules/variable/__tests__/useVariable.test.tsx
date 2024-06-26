import { renderHook } from '@nocobase/test/client';
import React from 'react';
import { Collection } from '../../../data-source';
import { DeclareVariable } from '../DeclareVariable';
import { useVariable } from '../useVariable';

describe('useVariable', () => {
  it('should return the variable value, title, and collection when the variable name matches', () => {
    const variableName = 'testVariable';
    const value = 'testValue';
    const title = 'Test Variable';
    const collection: Collection = new Collection(
      {
        name: 'testCollection',
        title: 'Test Collection',
      },
      null,
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DeclareVariable name={variableName} value={value} title={title} collection={collection}>
        {children}
      </DeclareVariable>
    );

    const { result } = renderHook(() => useVariable(variableName), { wrapper });

    expect(result.current).toEqual({ value, title, collection });
  });

  it('should return an empty object when the variable name does not match', () => {
    const variableName = 'testVariable';
    const value = 'testValue';
    const title = 'Test Variable';
    const collection = new Collection(
      {
        name: 'testCollection',
        title: 'Test Collection',
      },
      null,
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DeclareVariable name={variableName} value={value} title={title} collection={collection}>
        {children}
      </DeclareVariable>
    );

    const { result } = renderHook(() => useVariable('otherVariable'), { wrapper });

    expect(result.current).toEqual({});
  });
});
