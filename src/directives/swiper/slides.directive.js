import angular from 'angular';
import llamaSwiper from './swiper.module';

llamaSwiper.directive ( 'slides', SlidesDirective );

/* @ngInject */
function SlidesDirective () {
  return {
    restrict : 'E',
    transclude : true,
    replace : true,
    require : '^swiper',
    template : '<div class="swiper-wrapper" ng-transclude></div>',
    priority : 2,
    controller : function () {}
  };
}
