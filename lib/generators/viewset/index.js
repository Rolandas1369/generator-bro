'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var format = require('util').format;
var colors = require('colors');
var yeoman = require('yeoman-generator');
var handlebars = require('../../utils/handlebars');
var generateFilesStruct = require('../../utils/generateFilesStruct');
var f = generateFilesStruct.f;
var helpers = require('../../core/helpers');
var core = require('../../core/generators/core');
var gHelper = require('../../core/generators/helper');

var selfGenerator = {
  _setArguments: function () {
    this.argument('appModelName', {
      desc: 'App name and model name in next format: app.ModelName',
      type: String, required: true
    });
  },

  _setOptions: function () {
    this.option('file', {
      desc: 'File where you want create viewset relatively this app.',
      type: String});
  },

  _afterInit: function () {
    var appModelName = this.appModelName.split('.');

    if (appModelName.length !== 2) {
      this.error('Argument appModelName invalid.');
    }

    this.appName = _.first(appModelName);
    this.modelName = _.last(appModelName);
  },

  _setContext: function() {
    var pyapp = path.join(this.config.get('apps'), this.appName)
        .replace(/\//g, '.');

    var viewsetPyPath = pyapp + '.';

    if (this.opts.file) {
      viewsetPyPath += this.opts.file
          .replace(/\//g, '.')
          .replace(/\.py$/, '');
    } else {
      viewsetPyPath += format('viewsets.%s', this.modelName);
    }

    return {
      apps: this.config.get('apps'),
      app: path.join(this.config.get('apps'), this.appName),
      pyapp: pyapp,
      viewset: viewsetPyPath,
      appName: this.appName,
      modelName: this.modelName
    };
  },

  creating: {
    // viewsetInit.py
    viewsetInit: {
      src: 'init.py',
      dst: '{{app}}/viewsets/__init__.py',
      replacement: function (self, content, src, dst, context) {
        var imports = [
          f('from {{lower viewset}} ' +
          'import {{modelName}}ViewSet', context)];
        return self.includeImports(imports, content, dst);
      }
    },

    // viewset/model_name.py
    viewset: {
      src: '_viewset.py',
      dst: '{{app}}/{{path}}',
      replacement: function (self, content, src, dst, context) {
        var viewSetCode = f(
            self.fs.read(self.templatePath('_viewset_item.py')), context);

        var imports = [
          'from rest_framework import viewsets',
          f('from {{pyapp}}.models.{{lower modelName}} import {{modelName}}', context),
          f('from {{pyapp}}.serializers.{{lower modelName}} import {{modelName}}Serializer', context)];

        return self.includeImports(imports, content, dst) + viewSetCode;
      },
      context: function (self, globalContext) {
        return {
          path: self.opts.file ||
            f('viewsets/{{lower modelName}}.py', globalContext)
        };
      }
    }
  }
};

module.exports = helpers.extendOf(gHelper, core, selfGenerator);