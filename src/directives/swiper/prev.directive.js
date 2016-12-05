import angular from 'angular';
import llamaSwiper from './swiper.module';

llamaSwiper.directive ( 'prev', PrevDirective );

/* @ngInject */
function PrevDirective () {
  return {
    restrict : 'AE',
    transclude : true,
    replace : true,
    require : '^swiper',
    template : '<div class="swiper-button-prev" ng-transclude></div>',
    priority : 2,
    scope: true
  };
}
