# Transifex integration

This document holds information about [Transifex](https://www.transifex.com) translation system implementation into Superset's frontend application.

## Content

- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Integration](#integration)

## Prerequisites

In order to consider of using Transifex service for translation purposes, following stuff is required:

- Transifex account, make sure you have created native token and secret credentials for your Transifex project: https://developers.transifex.com/docs/managing-a-transifex-native-project#generating-native-credentials
- Enable Superset's `i18n` feature with adding desired languages to LANGUAGES variable inside [config.py](/superset/config.py) configuration file. For example:
    ```python
    LANGUAGES = {
        "en": {"flag": "us", "name": "English"},
        "fr_CH": {"flag": "fr", "name": "French (Switzerland)"},
        "de_CH": {"flag": "de", "name": "German (Switzerland)"},
        "it_CH": {"flag": "it", "name": "Italian (Switzerland)"},
    }
    ```

## Configuration

Feature can be enabled via [config.py `TRANSIFEX` variable](/superset/config.py#L378-384):

```py
TRANSIFEX = {
    "enabled": True,
    "key_prefix": "bi.superset",
    "token": "1/2477acc125008cc20d1cb4558f2c17acae2e0f73",
    "secret": "1/c5aa6411e2dc05001c21c91453c3f79c2b5d3a8f",
}
```

- `enabled` - If set to `False`, Transifex feature along with translation field elements are not loaded.
- `key_prefix` - The first part of translation key that is submitted to Transifex, for example `bi.superset.field_prefix.field_name`.
- `token` and `secret` - Generated native credentials that are using for load of translations and submit of strings.

## Integration

The core of implementation is [Translatable](/superset-frontend/src/components/Input/index.tsx#L72-127) field which is placed inside form as field whose value can be optionally sent to Transifex and translated for it's interface:

![Example of translatable field "Name"](/RESOURCES/img/name_translation_example.png "Example of translatable field 'Name'")

Every translatable field consist of:
- `Field`: `input` and `textarea` are currently supported as `fieldType` property
- `Translation key prefix`: second part of prefix that comes after `key_prefix` described in [Configuration](#configuration). For example:
`bi.superset.102.field_name`. By default this value is passed `slice.id` but can be manually changed to desirable value. Submitted field prefix is stored to charts's `params` field as _key: value_ pair with field name as key, and entered prefix as value so it is be transferable to future versions of the same chart.
- `Preview`: Placeholder with rendered translation for inserted field value, by default, for currently selected locale. Preview can display translation for other languages if language is switched with `Translation preview` select box.


Following dynamic fields are enabled for translation:
- Chart
    - Name
    - Description
