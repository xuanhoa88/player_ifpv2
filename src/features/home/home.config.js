config.$inject = ['$routeProvider'];

export default function config($routeProvider) {
  $routeProvider
    .when('/home', {
      template: require('./home.html'),
      controller: 'HomeController',
      controllerAs: '$ctrl'
    });
}
