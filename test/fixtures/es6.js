import _ from 'lodash';
import RootClass from './es6-extended';

export default class StoreItem extends RootClass {
  constructor(...args) {
    super(...args);
  }

  get idAttribute() {
    return '_id';
  }

  parse(response) {
    let { _data: data, _meta: meta } = response || {
      _data: null
    };
    let nested = this.nestedFields();
    let { values: defaults, types } = this.defaults({
      withType: true
    });
    let model = {};

    if (!_.isObject(data)) {
      data = response;
    }
    _.each(data, (value, key) => {
      if (_.has(defaults, key) || key === this.idAttribute) {
      model[key] = types[key] === 'datetime' ? new Date(value) : value;
    } else if (nested[key] && nested[key].store instanceof Backbone.Collection) {
      nested[key].store.add(value, {
        parse: true
      });
    }
  });
    if (meta) {
      model.meta = meta;
    }

    return model;
  }

  defaults({ withType=false }={}) {
    let defaults = {};
    let defaultTypes = {};

    _.each(_.result(this, 'fields'), ({ key, value, type, group }) => {
      let splitKey = key.split('.');

    _.reduce(splitKey, ([lastAdded, lastAddedTypes], key, i) => {
      lastAdded[key] = lastAdded[key] || {};
    if (withType) {
      lastAddedTypes[key] = {};
    }
    if (splitKey.length-1 === i) {
      lastAdded[key] = value;
      if (withType) {
        lastAddedTypes[key] = type;
      }
    }
    return [
      lastAdded[key],
      withType ? lastAddedTypes[key] : null
    ];
  }, [
      defaults,
      defaultTypes
    ]);
  });

    return withType ? {
      values: defaults,
      types: defaultTypes
    } : defaults;
  }

  toJSON({ type, excludeClientOnlyAttributes=false, keepMomentObjects=false }={}) {
    switch (type) {
      case 'full':
        return this.includeExternalModels(this.toJSON({excludeClientOnlyAttributes, keepMomentObjects}));
      case 'form':
        return this.asFormFields(this.toJSON({excludeClientOnlyAttributes, keepMomentObjects}));
      default:
        let jsonified = _.clone(this.attributes);

        if (excludeClientOnlyAttributes) {
          let clientOnlyAttributes = _.chain(_.result(this, 'fields'))
              .filter(field => !!field.clientOnly)
        .pluck('key')
            .value();
          clientOnlyAttributes.push('meta');
          jsonified = _.omit(jsonified, clientOnlyAttributes);
        }

        return !keepMomentObjects ? _.mapObject(jsonified, attr => +new Date(attr) ? attr.toISOString() : attr) : jsonified;
    }
  }

  includeExternalModels(modelData = this.toJSON()) {
    _.each(_.result(this, 'nestedFields'), ({ store, foreignKey }, nestedKey) => {
      let ids = [].concat(this.get(foreignKey));

    if (!modelData[nestedKey]) {
      modelData[nestedKey] = [];
    }
    _.chain(ids)
      .map(id => store.get(id))
  .each(model => {
      if (model) {
      modelData[nestedKey].push(model.toJSON());
    }
  });
  });

    return modelData;
  }

  asFormFields(modelData = this.toJSON()) {
    let fields = this.fields();
    let translatableFields = _.filter(fields, field => field.type === 'translatable');
    let languagesFields = _.pluck(translatableFields, 'availableLanguagesKey');
    let availableLanguages = _.chain(languagesFields)
        .map(field => modelData[field])
  .flatten()
      .value();

    if (!availableLanguages || availableLanguages.length === 0) {
      let availableLanguagesFromValues = _.chain(translatableFields)
          .pluck('key')
          .map(field => _.keys(modelData[field]))
    .flatten()
        .value();

      _.chain(fields)
        .filter(field => _.contains(languagesFields, field.key))
    .each(field => {
        field.value = availableLanguagesFromValues;
      this.set(field.key, availableLanguagesFromValues || [''], {
        silent: true
      });
      modelData[field.key] = availableLanguagesFromValues;
    });
      availableLanguages = availableLanguagesFromValues;
    }

    let formFields = _.map(this.fields(), field => {
      let { type, group, availableLanguagesKey='', filterOptionsBy, options, key } = field;

    if (type !== 'nested-parent') {
      field.value = (group ? modelData[group] : modelData)[key];
    }
    if (type === 'translatable' && availableLanguagesKey && modelData[availableLanguagesKey]) {
      let filteredValues = {};
      _.each(availableLanguages, language => {
        if (language) {
        filteredValues[language] = field.value[language] || '';
      }
    });
      field.value = filteredValues;
    } else if (type === 'select' && filterOptionsBy && modelData[filterOptionsBy]) {
      field.options = _.filter(options, ({ value }) => _.indexOf(modelData[filterOptionsBy], value) !== -1);
    } else if (type === 'select' && field.value.length === 0) {
      field.value = [''];
    }

    return field;
  });

    return formFields;
  }

  fields() {
    return [
      {
        label: 'Created at',
        key: 'created_at',
        value: '',
        type: 'datetime',
        editable: false
      },
      {
        label: 'Updated at',
        key: 'updated_at',
        value: '',
        type: 'datetime',
        editable: false
      },
      {
        label: 'Created by',
        key: 'created_by',
        value: '',
        editable: false
      },
      {
        label: 'Updated by',
        key: 'updated_by',
        value: '',
        editable: false
      }
    ];
  }

  nestedFields() {
    return {};
  }

  includedFields() {
    return [];
  }
}
