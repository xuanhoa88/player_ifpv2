import angular from 'angular';
import jQuery from 'jquery';

class llamaLoadingIndicator {
    constructor() {
        this._indicators = {};
    }

    set type(_type = '__default') {
        if (!this._indicators.hasOwnProperty(_type)) {
            this._indicators[_type] = 0;
        }        
    }

    show(_type = '__default') {
        if (!this._indicators.hasOwnProperty(_type)) {
            this._indicators[_type] = 0;
        }
        this._indicators[_type]++;
    }

    hide(_type) {
        if (this.enabled(_type)) {
            this._indicators[_type]--;
        }
    }

    enabled(_type = '__default') {
        return this._indicators[_type] > 0;
    }

    disabled(_type = '__default') {
        return !this.enabled(_type);
    }

    stop(_type = '__default') {
        this._indicators[_type] = 0;
    }

    $get() {
        return this;
    }
}

export default angular.module('app.providers', [])
    .provider('llamaLoadingIndicator', llamaLoadingIndicator)
    .name;