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
import UntypedJed from 'jed';
import { tx, t as transifexTranslate } from '@transifex/native';

import logging from '../utils/logging';
import {
  Jed,
  TranslatorConfig,
  Locale,
  Translations,
  LocaleData,
  LanguagePack,
} from './types';

const DEFAULT_LANGUAGE_PACK: LanguagePack = {
  domain: 'superset',
  locale_data: {
    superset: {
      '': {
        domain: 'superset',
        lang: 'en',
        plural_forms: 'nplurals=2; plural=(n != 1)',
      },
    },
  },
};

// TODO: load token and secret from config as secret
tx.init({
  token: '1/2477acc125008cc20d1cb4558f2c17acae2e0f73',
  secret: '1/c5aa6411e2dc05001c21c91453c3f79c2b5d3a8f',
});
// End TODO

export default class Translator {
  i18n: Jed;

  locale: Locale;

  transifexLoaded: boolean;

  constructor(config: TranslatorConfig = {}) {
    let { languagePack = DEFAULT_LANGUAGE_PACK } = config;

    if (languagePack === null) {
      languagePack = DEFAULT_LANGUAGE_PACK;
      console.warn(
        '[Translations] no language pack found for selceted language, falling back to default one!',
      );
    }

    this.i18n = new UntypedJed(languagePack) as Jed;
    this.locale = this.i18n.options.locale_data.superset[''].lang as Locale;
    this.transifexLoaded = false;

    tx.setCurrentLocale(this.locale)
      .then(() => {
        console.info(`[Transifex] Language ('${this.locale}') content loaded.`);

        this.transifexLoaded = true;
      })
      .catch(error => console.error(`[Transifex] ${error}`));
  }

  /**
   * Add additional translations on the fly, used by plugins.
   */
  addTranslation(key: string, texts: ReadonlyArray<string>) {
    const translations = this.i18n.options.locale_data.superset;
    if (process.env.WEBPACK_MODE !== 'test' && key in translations) {
      logging.warn(`Duplicate translation key "${key}", will override.`);
    }
    translations[key] = texts;
  }

  /**
   * Add a series of translations.
   */
  addTranslations(translations: Translations) {
    if (translations && !Array.isArray(translations)) {
      Object.entries(translations).forEach(([key, vals]) =>
        this.addTranslation(key, vals),
      );
    } else {
      logging.warn('Invalid translations');
    }
  }

  addLocaleData(data: LocaleData) {
    // always fallback to English
    const translations = data?.[this.locale] || data?.en;
    if (translations) {
      this.addTranslations(translations);
    } else {
      logging.warn('Invalid locale data');
    }
  }

  translate(input: string, ...args: unknown[]): string {
    let translated = input;

    if (this.transifexLoaded) {
      let transifexMeta = {};

      if (args[0] && typeof args[0] === 'object') {
        transifexMeta = args[0];
      }

      translated = transifexTranslate(input, transifexMeta);
    }

    if (this.transifexLoaded === false || input === translated) {
      translated = this.i18n.translate(input).fetch(...args);
    }

    return translated;
  }

  translateWithNumber(key: string, ...args: unknown[]): string {
    const [plural, num, ...rest] = args;
    if (typeof plural === 'number') {
      return this.i18n
        .translate(key)
        .ifPlural(plural, key)
        .fetch(plural, num, ...args);
    }
    return this.i18n
      .translate(key)
      .ifPlural(num as number, plural as string)
      .fetch(...rest);
  }
}
