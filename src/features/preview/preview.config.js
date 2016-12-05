config.$inject = ['$routeProvider'];

export default function config($routeProvider) {
  $routeProvider
    .when('/:clientId?/:key?/:reference?/:pageId?', {
      template: require('./preview.html'),
      controller: 'PreviewController',
      controllerAs: '$ctrl'
    });
}
