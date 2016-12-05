import angular from 'angular';
import llamaSwiper from './swiper.module';

llamaSwiper.directive ( 'pagination', PaginationDirective );

/* @ngInject */
function PaginationDirective () {
  return {
    restrict : 'AE',
    transclude : true,
    replace : true,
    require : '^swiper',
    template : '<div class="swiper-pagination" ng-transclude></div>',
    priority : 2
  };
}
