import './home.css';

import angular from 'angular';
import ngRoute from 'angular-route';

import config from './home.config';
import HomeController from './home.controller';
import randomNames from '../../services/randomNames.service';
import greeting    from '../../directives/greeting.directive';

export default angular.module('app.home', [ngRoute, randomNames, greeting])
  .config(config)
  .controller('HomeController', HomeController)
  .name;
