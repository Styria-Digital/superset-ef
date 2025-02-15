/*
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

/* eslint no-console: 0 */

import { tx } from '@transifex/native';
import Translator from './Translator';
import { TranslatorConfig, Translations, LocaleData } from './types';

let singleton: Translator | undefined;
let isConfigured = false;

function configure(config?: TranslatorConfig) {
  singleton = new Translator(config);
  isConfigured = true;

  return singleton;
}

function getInstance() {
  if (!isConfigured) {
    console.warn('You should call configure(...) before calling other methods');
  }

  if (typeof singleton === 'undefined') {
    singleton = new Translator();
  }

  return singleton;
}

function resetTranslation() {
  if (isConfigured) {
    isConfigured = false;
    singleton = undefined;
  }
}

function addTranslation(key: string, translations: string[]) {
  return getInstance().addTranslation(key, translations);
}

function addTranslations(translations: Translations) {
  return getInstance().addTranslations(translations);
}

function addLocaleData(data: LocaleData) {
  return getInstance().addLocaleData(data);
}

function t(input: string, ...args: unknown[]) {
  return getInstance().translate(input, ...args);
}

function tn(key: string, ...args: unknown[]) {
  return getInstance().translateWithNumber(key, ...args);
}

/**
 * Constructs translation key for string that is passed to transifex service.
 * Uses `TRANSIFEX.key_prefix` as first part of key
 */
function getTranslationKey(prefix: string, fieldName: string) {
  let baseKeyPrefix = '';

  if (getInstance().transifexConfig?.key_prefix) {
    baseKeyPrefix = getInstance().transifexConfig?.key_prefix;
  }

  return `${baseKeyPrefix}.${prefix}.${fieldName}`;
}

/**
 * returns translation based on passed field prefix and field name along with
 * original string from source.
 */
function getTranslatedString(
  sourceString: string,
  prefix: string,
  fieldName: string,
) {
  return t(sourceString, { _key: getTranslationKey(prefix, fieldName) });
}

/**
 * Shorthand to push list of field objects to Transifex API
 */
function pushToTransifex(
  fields: {
    name: string;
    value: string;
    prefix: string;
  }[],
) {
  const translationData = {};

  fields.forEach(field => {
    const fieldKey = getTranslationKey(field.prefix, field.name);

    translationData[fieldKey] = {
      string: field.value,
      meta: {
        context: field.prefix,
      },
    };
  });

  tx.pushSource(translationData).then(() => {
    console.info('[Transifex] Strings and keys sucessfully sent!');
  });
}

export {
  configure,
  addTranslation,
  addTranslations,
  addLocaleData,
  t,
  tn,
  resetTranslation,
  getInstance as getTranslatorInstance,
  getTranslationKey,
  getTranslatedString,
  pushToTransifex,
};
