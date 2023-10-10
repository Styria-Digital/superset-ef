/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { forwardRef, useImperativeHandle } from 'react';

import { useUiConfig } from 'src/components/UiConfigContext';

import { styled } from '@superset-ui/core';
import { Input as AntdInput, InputNumber as AntdInputNumber } from 'antd';

import { tx } from '@transifex/native';
import { AntdForm } from 'src/components';

export const Input = styled(AntdInput)`
  border: 1px solid ${({ theme }) => theme.colors.secondary.light3};
  border-radius: ${({ theme }) => theme.borderRadius}px;
`;

export const InputNumber = styled(AntdInputNumber)`
  border: 1px solid ${({ theme }) => theme.colors.secondary.light3};
  border-radius: ${({ theme }) => theme.borderRadius}px;
`;

export const TextArea = styled(AntdInput.TextArea)`
  border: 1px solid ${({ theme }) => theme.colors.secondary.light3};
  border-radius: ${({ theme }) => theme.borderRadius}px;
`;

const StyledFormItem = styled(AntdForm.Item)`
  margin-bottom: 0;
`;

interface Props {
  name: string;
  label: string;
  rows?: number;
  value?: string;
  translatePrefix?: string;
}

export const TextAreaTranslatable = forwardRef((props: Props, ref) => {
  const uiConfig = useUiConfig();
  const { name, label, rows, value, translatePrefix } = props;

  const getTranslationKey = (fieldName: string) =>
    `${translatePrefix}_${fieldName}`;

  useImperativeHandle(
    ref,
    () => ({
      async onFormSaved(payload: object) {
        const submittedValue = payload[name];

        if (submittedValue !== value) {
          const fieldKey = getTranslationKey(name);
          const translationData = {};

          translationData[fieldKey] = {
            string: submittedValue,
            meta: {
              context: translatePrefix,
            },
          };

          await tx.pushSource(translationData);
        }
      },
    }),
    [],
  );

  const otherLanguages = Object.fromEntries(
    Object.entries(uiConfig.availableLanguages || {}).filter(
      ([key]) => key !== uiConfig.defaultLocale,
    ),
  );

  return (
    <div>
      <StyledFormItem label={label} name={name}>
        <TextArea
          rows={rows}
          style={{ maxWidth: '100%' }}
          name={name}
          id={name}
          defaultValue={value}
        />
      </StyledFormItem>
      <div style={{ padding: '8px 0px' }}>Translations</div>
      {uiConfig.availableLanguages &&
        Object.entries(otherLanguages).map(([lang, config]) => (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              paddingBottom: '10px',
            }}
          >
            <span className="f16">
              <i
                className={`flag ${config.flag}`}
                style={{ marginRight: '5px' }}
              />
              {config.name}
            </span>
            <TextArea
              rows={rows}
              style={{ maxWidth: '100%' }}
              data-language={lang}
              data-field-name={name}
              name={`${name}_${lang}`}
            />
          </div>
        ))}
    </div>
  );
});
