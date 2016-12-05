import angular from 'angular';
import llamaSwiper from './swiper.module';

llamaSwiper.directive ( 'next', NextDirective );

/* @ngInject */
function NextDirective () {
  return {
    restrict : 'AE',
    transclude : true,
    replace : true,
    require : '^swiper',
    template : '<div class="swiper-button-next" ng-transclude></div>',
    priority : 2
  };
}
