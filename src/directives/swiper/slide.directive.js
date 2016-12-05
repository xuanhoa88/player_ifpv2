import angular from 'angular';
import llamaSwiper from './swiper.module';

llamaSwiper.directive ('slide', ['$rootScope', SlideDirective]);

/* @ngInject */
function SlideDirective ($rootScope) {
  return {
    restrict : 'E',
    replace : true,
    transclude : true,
    template : '<div class="swiper-slide" ng-transclude></div>',
    require : '^slides',
    priority : 3,
    link : function (scope, element, attrs) {
      var eventId = scope.$parent.$parent.$parent.uuid;
      scope.$watch('$last', function (value) {
        if (value)  {
          $rootScope.$broadcast(eventId);
        }
      });
    }
  }
}
