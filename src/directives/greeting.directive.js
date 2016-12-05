import angular from 'angular';

export default angular.module('app.directives', [])
  .component('greeting', {
    bindings: {
      name: '='
    },
    template: `
      <h1>Hello, {{ $ctrl.name }}</div>
      <input type="text" ng-model="$ctrl.name" class="form-control" />
    `
  })
  .name;
