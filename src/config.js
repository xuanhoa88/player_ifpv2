config.$inject = ['$routeProvider', '$locationProvider', '$httpProvider'];

export default function config($routeProvider, $locationProvider, $httpProvider) {
    // Route
    $locationProvider.html5Mode({
        enabled: false,
        requireBase: false
    });
    // $locationProvider.hashPrefix('!');
    $routeProvider.otherwise('/');

    // remote HTTP server
    $httpProvider.defaults.cache = false;
    $httpProvider.defaults.headers.common = {
        'Accept': 'application/json',
        // 'Content-Type': 'application/json'
    };
    // alternatively, register the interceptor via an anonymous factory
    $httpProvider.interceptors.push(['$q', $q => {
        return {
            'request': config => {
                // same as above
                return config;
            },
            'requestError': rejection => {
                // do something on error                
                return $q.reject(rejection);
            },
            'response': response => {              
                // same as above
                return $q.resolve(response);
            },
            'responseError': rejection => {
                // do something on error                
                return $q.reject(rejection);
            }
        };
    }]);
}