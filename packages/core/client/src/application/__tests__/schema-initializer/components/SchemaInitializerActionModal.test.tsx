import { screen, userEvent, waitFor } from '@nocobase/test/client';

import React from 'react';
import { Action, Form, FormItem, Input, SchemaInitializerActionModal } from '@nocobase/client';

import { createApp } from '../fixures/createApp';
import { createAndHover } from './fixtures/createAppAndHover';

describe('SchemaInitializerDivider', () => {
  it('component mode', async () => {
    const onSubmit = vitest.fn();
    const Demo = () => {
      return (
        <SchemaInitializerActionModal
          title="Modal title"
          buttonText="button text"
          onSubmit={onSubmit}
          schema={{
            title: {
              type: 'string',
              title: 'Title',
              required: true,
              'x-component': 'Input',
              'x-decorator': 'FormItem',
            },
          }}
        ></SchemaInitializerActionModal>
      );
    };
    await createApp(
      {
        Component: Demo,
        items: [],
      },
      {
        components: {
          FormItem,
          Action,
          Input,
          Form,
        },
      },
    );

    expect(screen.getByText('button text')).toBeInTheDocument();
    await userEvent.click(screen.getByText('button text'));

    await waitFor(() => {
      expect(screen.queryByText('Modal title')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByRole('textbox'), 'test');

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveValue('test');
    });

    await userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toBeCalled();
  });

  it('item mode', async () => {
    const onSubmit = vitest.fn();
    const Demo = () => {
      return (
        <SchemaInitializerActionModal
          title="Modal title"
          buttonText="button text"
          onSubmit={onSubmit}
          isItem
          schema={{
            title: {
              type: 'string',
              title: 'Title',
              required: true,
              'x-component': 'Input',
              'x-decorator': 'FormItem',
            },
          }}
        ></SchemaInitializerActionModal>
      );
    };
    await createAndHover(
      [
        {
          name: 'a',
          Component: Demo,
        },
      ],
      {
        components: {
          FormItem,
          Action,
          Input,
          Form,
        },
      },
    );

    expect(screen.getByText('button text')).toBeInTheDocument();
    await userEvent.click(screen.getByText('button text'));

    await waitFor(() => {
      expect(screen.queryByText('Modal title')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByRole('textbox'), 'test');

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveValue('test');
    });

    await userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toBeCalled();
  });
});
