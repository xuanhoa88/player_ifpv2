import angular from 'angular';
import Swiper from 'swiper';
import llamaSwiper from './swiper.module';

llamaSwiper.directive('swiper', ['$rootScope', '$timeout', SwiperDirective]);

/* @ngInject */
function SwiperDirective($rootScope, $timeout) {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            overrideParameters: '=',
            reInit: '='
        },
        priority: 0,
        template: '<div class="swiper-container" ng-transclude></div>',
        link: function($scope, $element, $attrs) {
            $scope.$watch('reInit', () => {
                $scope.uuid = generateUUID();
                $element.addClass($scope.uuid);

                let params = angular.extend({}, $scope.overrideParameters);
                if (params.paginationClickable) {
                    params.pagination = '.' + $scope.uuid + ' .swiper-pagination';
                }

                if (params.navigationClickable) {
                    params.nextButton = '.' + $scope.uuid + ' .swiper-button-next';
                    params.prevButton = '.' + $scope.uuid + ' .swiper-button-prev';
                }

                let timer = $timeout(() => {
                    $scope.instance = new Swiper('.' + $scope.uuid, params);
                });

                $scope.$on('$destroy', () => {
                    $timeout.cancel(timer);
                });

                let _rTimer;
                $rootScope.$on($scope.uuid, () => {
                    _rTimer = $timeout(() => {
                        $scope.instance = new Swiper('.' + $scope.uuid, params);
                    });
                });

                $rootScope.$on('$destroy', () => {
                    $timeout.cancel(_rTimer);
                });
            });
        }
    };
}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'axxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};