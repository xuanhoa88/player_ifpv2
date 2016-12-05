import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';

import angular from 'angular';
import ngRoute from 'angular-route';
import ngResource from 'angular-resource';

import config from './config';

import llamaLoadingIndicator from './providers/loadingIndicator.provider';

import home from './features/home';
import preview from './features/preview';

angular.module('app', [ngRoute, ngResource, llamaLoadingIndicator, home, preview])
  .config(config);

// Apply webpack hot loader
module.hot.accept();
