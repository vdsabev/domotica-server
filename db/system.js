var _ = require('lodash'),
    utils = require('../utils');

module.exports = {
  statics: {
    fields: {
      query: utils.processFields(['_id', 'name', 'description', 'created']),
      options: utils.processFields(['limit', 'sort']),

      index: utils.processFields(['_id', 'name', 'description', 'access', 'created']),
      show: utils.processFields(['_id', 'name', 'description', 'access', 'created']),

      create: utils.processFields(['name', 'description', 'access']),
      update: utils.processFields(['name', 'description', 'access'])
    }
  },
  methods: {
    canBeAdministeredBy: function (user) {
      return _.contains(this.access.admin, user);
    },
    canBeEditedBy: function (user) {
      return this.access.edit.level === 'custom' && _.contains(this.access.edit.users, user) ||
             this.canBeAdministeredBy(user);
    },
    canBeControlledBy: function (user) {
      return this.access.control.level === 'public' ||
             this.access.control.level === 'custom' && _.contains(this.access.control.users, user) ||
             this.canBeEditedBy(user);
    },
    canBeViewedBy: function (user) {
      return this.access.view.level === 'public' ||
             this.access.view.level === 'custom' && _.contains(this.access.view.users, user) ||
             this.canBeControlledBy(user) ||
             this.canBeEditedBy(user);
    }
  },
  validators: {
    name: [
      {
        validator: function (value) {
          return value.length >= 2;
        },
        msg: 'INVALID_SYSTEM_NAME'
      }
    ]
  },
  pre: function (db) {
    return function (next) {
      // Timestamp
      if (this.isNew) this.created = new Date();

      next();
    };
  }
};
