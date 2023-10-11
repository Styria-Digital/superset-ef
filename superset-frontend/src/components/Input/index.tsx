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
import React, { forwardRef, useImperativeHandle, useState } from 'react';

import { styled, t } from '@superset-ui/core';
import { Input as AntdInput, InputNumber as AntdInputNumber } from 'antd';

import { tx } from '@transifex/native';
import { T, LanguagePicker } from '@transifex/react';
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

const StyledHelpBlock = styled.span`
  margin-bottom: 0;
`;

const translationPreviewStyle = {
  display: 'inline-block',
  // eslint-disable-next-line theme-colors/no-literal-colors
  backgroundColor: '#F0F0F0',
  padding: '8px',
  borderRadius: '4px',
  textAlign: 'center',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  width: '100%',
  minHeight: '38px',
};

interface Props {
  name: string;
  label: string;
  translatePrefix: string;
  rows?: number;
  value?: string;
}

export const TextAreaTranslatable = forwardRef((props: Props, ref) => {
  const { name, label, rows, value, translatePrefix } = props;
  const [prefix, setPrefix] = useState(translatePrefix);

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
              context: prefix,
            },
          };

          await tx.pushSource(translationData);
        }
      },
    }),
    [],
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
      <div
        className="translation_fields_wrap"
        style={{ display: 'flex', marginBottom: '1rem' }}
      >
        <StyledFormItem label={t('Translation key prefix')} required>
          <Input
            aria-label={t('Translation key prefix')}
            name="transifex-key-prefix"
            type="text"
            value={translatePrefix}
            onChange={event => {
              setPrefix(event.target.value);
            }}
          />
          <StyledHelpBlock className="help-block">
            {`Default: ${translatePrefix}`}
          </StyledHelpBlock>
        </StyledFormItem>
        <div style={{ marginLeft: '2rem', padding: '2.5rem 0 0' }}>
          <LanguagePicker />
        </div>
      </div>
      <div style={{ padding: '0 0 8px' }}>{t('Preview')}</div>
      <div className="translation_preview" style={translationPreviewStyle}>
        <T _key={getTranslationKey(name)} />
      </div>
    </div>
  );
});
