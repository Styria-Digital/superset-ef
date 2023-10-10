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
import React, { useState } from 'react';
import { debounce } from 'lodash';

import { useUiConfig } from 'src/components/UiConfigContext';

import { styled } from '@superset-ui/core';
import { Input as AntdInput, InputNumber as AntdInputNumber } from 'antd';

// TODO: Remove this?
// import { MainNav as Menu } from 'src/components/Menu';
// import LanguagePicker from 'src/features/home/LanguagePicker';
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

export const TextAreaTranslatable: React.FC<Props> = ({
  name,
  label,
  rows = 3,
  value = '',
  translatePrefix,
  ...props
}) => {
  const uiConfig = useUiConfig();

  // TODO remove this?
  // const [shownLangField, setShownLangField] = useState<string>(uiConfig.currentLocale);

  // const showTranslation = (mainFieldName: string, langKey: string) => {
  //   setShownLangField(langKey);
  // };

  const otherLanguages = Object.fromEntries(
    Object.entries(uiConfig.availableLanguages || {}).filter(
      ([key]) => key !== uiConfig.defaultLocale,
    ),
  );

  const onKeyUpTranslateField = debounce(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      console.log(event.target.value);
    },
    1000
  );

  return (
    <div>
      {/* TODO remove this? */}
      {/* <Menu mode="horizontal">
        <LanguagePicker
          locale={uiConfig.currentLocale}
          languages={uiConfig.availableLanguages}
          mainFieldName="description"
          callback={showTranslation}
        />
      </Menu> */}
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
      {/* TODO: implement send to Transifex upon save/change */}
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
              name={`${name}_${lang}`}
              onChange={event => {
                event.persist();
                onKeyUpTranslateField(event);
              }}
            />
          </div>
        ))}
    </div>
  );
};
