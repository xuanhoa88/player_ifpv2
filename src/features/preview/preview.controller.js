import BaseController from '../base.controller';

export default class PreviewController extends BaseController {
    /**
     * Constructor
     */
    constructor(...args) {
        super(...args);

        // Switcher
        this.llamaLoadingIndicator.show('async');
        (process.env.OFFLINE_MODE ? this.whenOffline() : this.whenOnline()).then(_r => {
            this.asyncCallback(_r['data']);            
        });
    }

    /**
     * 
     */
    onMobile() {
        return this.widthWindow <= 768;
    }

    /**
     * Prepare
     */
    ngOnInit() {
        //
        this.state = {
            showCollapseButtonOnDesktop: false,
            disableMenuOnMobile: true,
            turnOnHighlight: false,
            showFloorImageBackground: true,
            currentHotspotHover: undefined,
            floorImageBackgroundRatio: 1,
            currentHotspotActive: 0
        };

        // Swiper options
        this.primarySwiperOpts = {          
            spaceBetween: 30,
            speed: 750,
            effect: 'fade',
            initialSlide: this.state.currentHotspotActive,
            navigationClickable: false,
            lazyLoading: true,
            lazyLoadingInPrevNext: true,
            virtualTranslate: true,
            onInit: (_swiper) => {
                this.primarySwiperObj = _swiper;
                this.state.currentHotspotActive = _swiper.activeIndex;
            },
            onTransitionStart: (_swiper) => {
                this.state.currentHotspotActive = _swiper.activeIndex;
            }
        };

        this.secondSwiperOpts = {            
            spaceBetween: 30,
            speed: 750,
            effect: 'fade',
            initialSlide: this.state.currentHotspotActive,
            navigationClickable: false,
            lazyLoading: true,
            lazyLoadingInPrevNext: true,
            virtualTranslate: true,
            onInit: (_swiper) => {
                this.secondSwiperObj = _swiper;
                this.state.currentHotspotActive = _swiper.activeIndex;
            },
            onTransitionStart: (_swiper) => {
                this.state.currentHotspotActive = _swiper.activeIndex;
            }
        };

        //
        this.hotspotOpts = {};

        //
        this.events = {
            resize: () => {
                let evt;
                try {
                    evt = new window.CustomEvent('resize', { bubbles: true, cancelable: true });
                } catch (e) {
                    evt = document.createEvent('Event');
                    evt.initEvent('resize', true, true);
                }

                return evt;
            }
        };

        //
        this.elements = {};

        //
        this.floor = {
            current: undefined,
            data: []
        };

        // Stylesheets
        this.style = {
            floorImageBackground: {},
            primarySwiper: {},
            secondSwiper: {},
            arrow: {
                prev: {},
                next: {}
            },
        };

        // Resize event
        window.addEventListener('resize', e => {
            this._resize(e);

            //
            this._rebuildHotspots();

            this.$scope.$apply();
        });

        // When template loaded
        this.$scope.$on('$viewContentLoaded', e => this._resize({}));
    }

    /**
     * Event resize
     */
    _resize(_e) {
        this.heightWindow = window.innerHeight;
        this.widthWindow = window.innerWidth;

        this.primarySwiperOpts['width'] = this.widthWindow;
        this.primarySwiperOpts['height'] = this.heightWindow;

        this.state.showFloorImageBackground = true;
        this.state.enableHighlightFloorMode = false;
        this.state.enableQnA = false;

        this.style.secondSwiper['visibility'] = 'hidden';

        let wFloor, hFloor;
        if (this.onMobile()) {
            this.style.floorImageBackground['left'] = '0px';
            this.style.floorImageBackground['top'] = '0px';

            this.style.secondSwiper['z-index'] = 0;
            this.style.secondSwiper['width'] = '0px';
            this.style.secondSwiper['height'] = '0px';
            this.style.secondSwiper['max-width'] = '0px';
            this.style.secondSwiper['max-height'] = '0px';

            wFloor = this.widthWindow;
            hFloor = wFloor * this.state.floorImageBackgroundRatio;

            if (this.widthWindow < this.heightWindow) {
                this.style.floorImageBackground['width'] = wFloor + 'px';
                this.style.floorImageBackground['height'] = hFloor + 'px';

                this.style.primarySwiper['width'] = wFloor + 'px';
                this.style.primarySwiper['height'] = (this.heightWindow - hFloor) + 'px';
                this.style.primarySwiper['max-width'] = wFloor + 'px';
                this.style.primarySwiper['max-height'] = (this.heightWindow - hFloor) + 'px';

                this.hotspotOpts['currentWidth'] = wFloor;
                this.hotspotOpts['currentHeight'] = hFloor;
            } else {
                this.state.showFloorImageBackground = false;

                this.style.primarySwiper['width'] = wFloor + 'px';
                this.style.primarySwiper['height'] = this.heightWindow + 'px';
                this.style.primarySwiper['max-width'] = wFloor + 'px';
                this.style.primarySwiper['max-height'] = this.heightWindow + 'px';
                
                this.style.floorImageBackground['width'] = wFloor + 'px';
                this.style.floorImageBackground['height'] = hFloor + 'px';

                this.hotspotOpts['currentWidth'] = wFloor;
                this.hotspotOpts['currentHeight'] = hFloor;
            }
        } else {
            this.style.primarySwiper['width'] = this.widthWindow + 'px';
            this.style.primarySwiper['height'] = this.heightWindow + 'px';
            this.style.primarySwiper['max-width'] = this.widthWindow + 'px';
            this.style.primarySwiper['max-height'] = this.heightWindow + 'px';

            wFloor = 400;
            hFloor = wFloor * this.state.floorImageBackgroundRatio;
            this.style.floorImageBackground['width'] = wFloor + 'px';
            this.style.floorImageBackground['height'] = hFloor + 'px';
            this.style.floorImageBackground['left'] = '30px';

            let menuObj;
            if (menuObj = document.getElementById('floor-menu-desktop')) {
                this.style.floorImageBackground['top'] = (menuObj.getBoundingClientRect().height + 26) + 'px';
            }

            this.hotspotOpts['currentWidth'] = wFloor;
            this.hotspotOpts['currentHeight'] = hFloor;
            
            this.style.secondSwiper['z-index'] = 0;
            this.style.secondSwiper['width'] = (this.widthWindow * 0.25) + 'px';
            this.style.secondSwiper['height'] = (this.widthWindow * 0.25 * 0.7) + 'px';
            this.style.secondSwiper['max-width'] = (this.widthWindow * 0.25) + 'px';
            this.style.secondSwiper['max-height'] = (this.widthWindow * 0.25 * 0.7) + 'px';
        }
    }

    /**
     * Mobile menu
     */
    mobileMenu($event) {
        this.state.disableMenuOnMobile = !this.state.disableMenuOnMobile;
    }

    /**
     * When offline mode is enabled
     */
    whenOffline() {
        return new Promise((resolve, reject) => {
            try {                
                resolve({
                    'data': Object.assign({}, require('../../assets/mocks/data.json'))
                });
            } catch (_e) {
                reject(_e.message);
            }
        });
    }

    /**
     * When offline mode is disabled
     */
    whenOnline() {
        let params;
        if (process.env.HYBRID) {
            params = Object.assign({}, require('../../assets/mocks/params.json'));
        } else {
            params = {
                clientId: this.$routeParams['clientId'],
                key: this.$routeParams['key'],
                reference: this.$routeParams['reference']
            };
        }

        return this.$http.get(process.env.API + '/projects', {
            params
        });
    }

    /**
     * 
     */
    asyncCallback(_r) {
        _r = Object.assign({}, _r);
        if (!_r['data'] || !_r['data']['project']) {
            return;
        }
        
        // Create data
        let _json = Object.assign({}, _r['data']['project']);

        // Determine whether template already exists yet
        if (!_json.hasOwnProperty('template')) {
            _json['template'] = {};
        }
        _json['template'] = Object.assign({}, _json['template']);

        if (!_json['template'].hasOwnProperty('config')) {
            _json['template']['config'] = {};
        }
        _json['template']['config'] = Object.assign({}, _json['template']['config']);

        if (!_json['template']['config'].hasOwnProperty('colors') || !Array.isArray(_json['template']['config']['colors'])) {
            _json['template']['config']['colors'] = [];
        }

        // Rebuild template color's config
        let colors = new Object();
        _json['template']['config']['colors'].forEach((color, index) => {
            // Recreate element associate with id
            colors[color['alias']] = color;
        });
        _json['template']['config']['colors'] = colors;

        // Rebuild template logo
        if (!_json['template']['config'].hasOwnProperty('logo')) {
            _json['template']['config']['logo'] = {};
        }
        _json['template']['config']['logo'] = Object.assign({}, _json['template']['config']['logo']);
        if (_json['template']['config']['logo']['logo_url']) {
            this.llamaLoadingIndicator.show('image-loaded');
            
            _json['template']['config']['logo']['logo_url'] = this.$sce.trustAsResourceUrl(_json['template']['config']['logo']['logo_url']);
        }

        // Determine whether pages already exists yet
        if (!_json.hasOwnProperty('pages')) {
            _json['pages'] = [];
        }

        // Rebuild pages
        let pages = new Object();
        _json['pages'].forEach((page, index) => {
            if (!page['enabled']) {
                return;
            }
            
            page['backgroundImage'] = this.$sce.trustAsResourceUrl(page['backgroundImage']);
            page['backgroundCrop'] = this.$sce.trustAsResourceUrl(page['backgroundCrop']);

            // Recreate element associate with id
            pages[page['id']] = page;
        });
        _json['pages'] = pages;

        // Determine whether materials already exists yet
        if (!_json.hasOwnProperty('materials') || !Array.isArray(_json['materials'])) {
            _json['materials'] = [];
        }

        // Rebuild materials
        let materials = new Object();
        _json['materials'].forEach((material, index) => {
            // Recreate element associate with id
            material['file'] = this.$sce.trustAsResourceUrl(material['file']);
            materials[material['id']] = material;
        });
        _json['materials'] = materials;

        // Determine whether hotspots already exists yet
        if (!_json.hasOwnProperty('hotspots') || !Array.isArray(_json['hotspots'])) {
            _json['hotspots'] = [];
        }

        // Determine page have at lease one hotspot
        let _validate = [];

        // Mapping hotspot with material
        let hotspots = new Object();
        _json['hotspots'].forEach((hotspot, index) => {
            hotspot = Object.assign({}, hotspot);

            _validate.push(hotspot['pageId']);

            // Material
            let materialId = hotspot['materialId'];

            // Associate with material
            if (_json['materials'].hasOwnProperty(materialId)) {
                hotspot['__material'] =  _json['materials'][materialId];
            }

            // Icon
            if (!hotspot.hasOwnProperty('icon')) {
                hotspot['icon'] = {};
            }
            hotspot['icon'] = Object.assign({}, hotspot['icon']);

            if (hotspot['icon']['path']) {
                hotspot['icon']['path'] = this.$sce.trustAsResourceUrl(hotspot['icon']['path']);
            }

            // Config
            hotspot['config'] = _json['template']['config'];

            // Recreate element associate with id
            hotspots[hotspot['id']] = hotspot;
        });
        _json['hotspots'] = hotspots;

        // Remove pages
        Object.keys(_json['pages']).filter((pageId) => {
            if (_validate.indexOf(parseFloat(pageId)) === -1) {
                delete _json['pages'][pageId];
            }
        });

        this.floor.data = _json;

        //
        this.style.arrow.prev['color'] = this.floor.data['template']['config']['colors']['arrowColor']['color'];
        this.style.arrow.next['color'] = this.floor.data['template']['config']['colors']['arrowColor']['color'];
        
        let _indexOf;
        let pageIds = Object.keys(_json['pages']);
        if (!(_indexOf = this.$routeParams['pageId'])) {
            _indexOf = pageIds.shift();
        } else if (pageIds.indexOf(_indexOf) > -1) {
            _indexOf = pageIds[pageIds.indexOf(_indexOf)];
        }

        this.switchFloor(_indexOf);
    }

    toggleFloorImageBackgroundHighlight($event) {
        this.state.turnOnHighlight = !this.state.turnOnHighlight;
    }

    toggleButtonFloorImageBackgroundOnOnMobile($event, status) {
        this.state.showFloorImageBackground = status;
        this.state.enableHighlightFloorMode = status;
        this.state.enableQnA = false;
        this.state.turnOnHighlight = false;
        
        //
        if (status) {
            this._rebuildHotspots();
        }               
    }

    toggleButtonFloorImageBackgroundOnDesktop($event, status) {
        this.state.showFloorImageBackground = status;
        this.state.enableQnA = false;

        this.style.floorImageBackground['height'] = hFloor + 'px';

        //
        if (status) {
            this._rebuildHotspots();
        }
    }

    floorImageBackgroundExpandButtonOnDesktop($event) {
        this.state.showCollapseButtonOnDesktop = true;
        this.state.showFloorImageBackground = true;

        let wFloor, hFloor;
        this.style.secondSwiper['visibility'] = 'visible';
        
        if (!this.onMobile()) {            
            this.style.secondSwiper['z-index'] = 5;
                        
            this.state.enableQnA = false;
            
            wFloor = (this.widthWindow * 0.41);
            
            this.style.floorImageBackground['left'] = (this.widthWindow * 0.09) + 'px';
        } else {
            wFloor = this.widthWindow;

            this.style.floorImageBackground['left'] = '0px';
        }

        //
        if (this.secondSwiperObj) {
            // this.secondSwiperObj.slideTo(this.state.currentHotspotActive);
        }

        //
        this.style.floorImageBackground['width'] = wFloor + 'px';
        this.hotspotOpts['currentWidth'] = wFloor;

        hFloor = (wFloor * this.state.floorImageBackgroundRatio);
        this.style.floorImageBackground['height'] = hFloor + 'px';
        this.hotspotOpts['currentHeight'] = hFloor;
        
        //
        this._rebuildHotspots();
    }

    floorImageBackgroundCollapseButtonOnDesktop($event) {
        this.state.showCollapseButtonOnDesktop = false;
        this.state.showFloorImageBackground = true;

        let wFloor, hFloor;
        this.style.secondSwiper['visibility'] = 'hidden';

        if (!this.onMobile()) {
            this.style.secondSwiper['z-index'] = 0;
            
            this.state.enableQnA = false;

            wFloor = 400;

            this.style.floorImageBackground['left'] = '30px';        
        } else {
            wFloor = this.widthWindow;

            this.style.floorImageBackground['left'] = '0px';
        }

        this.style.floorImageBackground['width'] = wFloor + 'px';
        this.hotspotOpts['currentWidth'] = wFloor;

        hFloor = (wFloor * this.state.floorImageBackgroundRatio);
        this.style.floorImageBackground['height'] = hFloor + 'px';
        this.hotspotOpts['currentHeight'] = hFloor;
        
        //
        this._rebuildHotspots();
    }

    /**
     * Rebuild hotspots
     */
    _rebuildHotspots() {
        this.state.rebuildHotspot = Math.random() * (new Date).getTime();
    }

    /**
     * Show/Hide QnA button
     */
    toggleFAQButton($event) {
        this.state.enableQnA = !this.state.enableQnA;
    }

    /**
     * Load specific floor information
     */
    switchFloor(_floorNumber) {
        if (this.floor.current === _floorNumber) {
            return false;
        }

        if (!this.floor.data['pages'].hasOwnProperty(_floorNumber)) {
            return;
        }

        let pageObj = Object.assign({}, this.floor.data['pages'][_floorNumber]);
        if (!Object.keys(pageObj).length) {
            return;
        }

        // 
        this.state.rebuildSlide = Math.random() * (new Date).getTime();

        //
        this.llamaLoadingIndicator.show('floor-image-background');

        // 
        this.floor.current = _floorNumber;

        // Floor       
        this._defaultFloor = pageObj;
        
        if (this._defaultFloor['backgroundCrop']) {
            this.llamaLoadingIndicator.show('image-loaded');

            let _img = new Image();
            _img.src = this._defaultFloor['backgroundCrop'];

            const fnCallback = () => {
                
                this.llamaLoadingIndicator.stop('image-loaded');

                this.llamaLoadingIndicator.hide('floor-image-background');

                this.state.floorImageBackgroundRatio = (_img.width ? _img.height / _img.width : 0);

                // Hotspots
                this._defaultFloor['hotspots'] = new Object();
                Object.values(this.floor.data['hotspots']).forEach(hotspot => {
                    if (this._defaultFloor['id'] === hotspot['pageId']) {
                        // Add loading mask
                        this.llamaLoadingIndicator.show('image-loaded');

                        // Hide loading mask
                        const _hideIndicator = () => {
                            this.llamaLoadingIndicator.hide('image-loaded');
                        };

                        let _material = new Image();
                        _material.src = hotspot['__material']['file'];
                        _material.onload = _hideIndicator;
                        _material.onerror = _hideIndicator;

                        // 
                        this._defaultFloor['hotspots'][hotspot['id']] = hotspot;
                    }
                });

                // Fires event resize
                let timer = this.$timeout(() => window.dispatchEvent(this.events['resize']()), 10);
                this.$scope.$on('$destroy', e => this.$timeout.cancel(timer));
            };

            _img.onload = fnCallback.bind(this);
            _img.onerror = fnCallback.bind(this);
        }
    }

    /**
     * Handle event when icon has trigger click
     */
    handleEventIconClick($index) {
        return ($scope) => {
            this._rebuildHotspots();

            this.state.currentHotspotHover = undefined;
            this.state.currentHotspotActive = $index;
            
            if (this.primarySwiperObj) {
                this.primarySwiperObj.slideTo($index);
            }

            if (this.secondSwiperObj) {
                this.secondSwiperObj.slideTo($index);
            }
        };
    }

    /**
     * 
     */
    handleEventArrowMouseUp($event, $position) {
        $event.preventDefault();

        this.style.arrow[$position]['color'] = this.floor.data['template']['config']['colors']['arrowHoverColor']['color'];
    }

    /**
     * 
     */
    handleEventArrowMouseDown($event, $position) {
        $event.preventDefault();

        this.style.arrow[$position]['color'] = this.floor.data['template']['config']['colors']['arrowActiveColor']['color'];
    }

    /**
     * 
     */
    handleEventArrowMouseEnter($event, $position) {
        $event.preventDefault();

        this.style.arrow[$position]['color'] = this.floor.data['template']['config']['colors']['arrowHoverColor']['color'];
    }

    /**
     * 
     */
    handleEventArrowMouseLeave($event, $position) {      
        $event.preventDefault();
          
        this.style.arrow[$position]['color'] = this.floor.data['template']['config']['colors']['arrowColor']['color'];
    }

    /**
     * 
     */
    handleEventPageMouseOver($event, $index) {
        this.state.pageHover = $index;
    }

    /**
     * 
     */
    handleEventPageMouseLeave($event, $index) {
        this.state.pageHover = undefined;
    }

    /**
     * 
     */
    logoEventLoading() {
        return event => {
            this.llamaLoadingIndicator.hide('image-loaded');

            let _css = {
                'padding-top': this.floor.data.template.config.logo.padding_top + 'px',
                'padding-right': this.floor.data.template.config.logo.padding_right + 'px',
                'padding-left': this.floor.data.template.config.logo.padding_left + 'px',
                'padding-bottom': this.floor.data.template.config.logo.padding_bottom + 'px'
            };
            
            let _target = event.target;
            if (!_target) {
                _target = event.path[0];
            }

            let _logo = angular.element(_target);

            switch (this.floor.data.template.config.logo.horizontal_align) {
                case 'left':
                    _css['left'] = 0;
                    break;
                case 'right':
                    _css['right'] = 0;
                    break;
                case 'center':
                    _css['left'] = 'calc(50% - ' + _logo[0].getBoundingClientRect().width + 'px)';
                    break;
            }

            switch (this.floor.data.template.config.logo.vertical_align) {
                case 'top':
                    _css['top'] = 0;
                    break;
                case 'bottom':
                    _css['bottom'] = 0;
                    break;
                case 'center':
                    _css['top'] = 'calc(50% - ' + _logo[0].getBoundingClientRect().height + 'px)';
                    break;
            }
            _logo.parent().css(_css);
        };
    }

    /**
     * 
     */
    floorImageBackgroundEventLoading() {
        return event => {
            this.llamaLoadingIndicator.hide('async');
        }
    }

    /**
     * 
     */
    primarySwiperImageEventLoading () {
        return event => {
        };
    }

    /**
     * 
     */
    secondSwiperImageEventLoading() {
        return event => {
        };
    }

    /**
     * 
     */
    primarySwiperPrev($event) {
        $event.preventDefault();

        if (this.llamaLoadingIndicator.enabled('floor-image-background')) {
            return;
        }

        if (this.primarySwiperObj) {
            if (this.state.currentHotspotActive === 0) {
                let _pages = Object.keys(this.floor.data.pages);
                let _prevId = _pages[(_pages.indexOf(this.floor.current) - 1 + _pages.length) % _pages.length];
                let _initialSlide = Object.values(this.floor.data['hotspots']).filter(hotspot => {
                    return (parseFloat(hotspot['pageId']) === parseFloat(_prevId))
                }).length - 1;
                this.primarySwiperOpts['initialSlide'] = _initialSlide;
                this.secondSwiperOpts['initialSlide'] = _initialSlide;
                this.switchFloor(_prevId);           
            } else {
                this.primarySwiperObj.slideTo(this.state.currentHotspotActive - 1);
                this._rebuildHotspots();
            }       
        }
    }

    /**
     * 
     */
    primarySwiperNext($event) {
        $event.preventDefault();

        if (this.llamaLoadingIndicator.enabled('floor-image-background')) {
            return;
        }
        
        if (this.primarySwiperObj) {
            if (this.state.currentHotspotActive === (Object.keys(this._defaultFloor['hotspots']).length - 1)) {
                let _pages = Object.keys(this.floor.data.pages);
                let _nextId = _pages[(_pages.indexOf(this.floor.current) + 1) % _pages.length];
                this.primarySwiperOpts['initialSlide'] = 0;
                this.secondSwiperOpts['initialSlide'] = 0;
                this.switchFloor(_nextId);
            } else {
                this.primarySwiperObj.slideTo(this.state.currentHotspotActive + 1);
                this._rebuildHotspots();
            }
        }
    }
}

PreviewController.$inject = [
    ...BaseController.$inject,
    '$http',
    '$routeParams',
    '$timeout',
    '$sce',
    'llamaLoadingIndicator'
];