import 'swiper/dist/css/swiper.css';
import '../../assets/css/preview.css';

import angular from 'angular';
import ngRoute from 'angular-route';

import LlamaImgDirective from '../../directives/img.directive';
import '../../directives/swiper.directive';

import config from './preview.config';

import LlamaFloorHotspotDirective from './directives/hotspot.directive';

import PreviewController from './preview.controller';

export default angular.module('app.preview', [
    ngRoute,
    LlamaImgDirective,
    //LlamaSwiperDirective,
    'ui.swiper',
    LlamaFloorHotspotDirective
]).config(config).controller('PreviewController', PreviewController).name;