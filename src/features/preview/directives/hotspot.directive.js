import angular from 'angular';

export default angular.module('preview.directives', []).directive('llamaFloorHotspot', ['$interpolate', ($interpolate) => {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        template: '<div ng-transclude />',
        scope: {
            hotspot: '=',
            options: '=',
            rebuild: '=',
            actived: '&',
            hovered: '&',
            ratio: '&',
            order: '&',
            onClick: '&'
        },
        link: function($scope, $element, $attrs, $ctrl, $transclude) {
            const createUUID = () => {
                // http://www.ietf.org/rfc/rfc4122.txt
                let s = [];
                let hexDigits = '0123456789abcdef';
                for (let i = 0; i < 36; i++) {
                    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
                }
                s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
                s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
                s[8] = s[13] = s[18] = s[23] = '-';
                s.unshift('llamaFloorHotspot');
                
                return s.join('');
            };
            
            //
            $scope.hotspot = Object.assign({}, $scope.hotspot);

            // Remove if hotspot invalid
            if (!$scope.hotspot.hasOwnProperty('data')) {
                $element.remove();
                return;
            }

            $scope.hotspot['data'] = Object.assign({}, $scope.hotspot['data']);

            // Remove if hotspot invalid
            if (!$scope.hotspot['data'].hasOwnProperty('shape') || !$scope.hotspot['data'].hasOwnProperty('icon')) {
                $element.remove();
                return;
            }

            $scope.hotspot['data']['shape'] = Object.assign({}, $scope.hotspot['data']['shape']);
            $scope.hotspot['data']['icon'] = Object.assign({}, $scope.hotspot['data']['icon']);

            // Remove if hotspot invalid
            if (!$scope.hotspot['data']['shape'].hasOwnProperty('data')) {
                $element.remove();
                return;
            }

            $scope.hotspot['data']['shape']['data'] = Object.assign({}, $scope.hotspot['data']['shape']['data']);
            
            //
            let svg, svgG, svgImage, svgText, svgPolygon, divIcon;
            let shape, icon, colors;
            
            let _id = createUUID();

            const _rebuild = (isActived, isHovered) => { 
                if (isActived) {
                    isHovered = undefined;
                }

                shape = $scope.hotspot['data']['shape']['__new'];
                icon = $scope.hotspot['data']['icon'];
                colors = $scope.hotspot['config']['colors'];
                
                switch ($scope.hotspot.type) {
                    case 'directionIcon':
                        $element.css({
                            'top': parseFloat(shape['y'] - shape['h']) + 'px',
                            'left': parseFloat(shape['x'] - shape['w']) + 'px',
                            'width': parseFloat(shape['w'] * 3) + 'px',
                            'height': parseFloat(shape['h'] * 3) + 'px',
                            'position': 'absolute'
                        });
                        break;
                    default:
                        $element.css({
                            'top': parseFloat(shape['y']) + 'px',
                            'left': parseFloat(shape['x']) + 'px',
                            'width': parseFloat(shape['w']) + 'px',
                            'height': parseFloat(shape['h']) + 'px',
                            'position': 'absolute'
                        });
                        break;
                }

                divIcon = angular.element('<div/>');
                divIcon.css('overflow', 'hidden');

                svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttributeNS(null, 'height', shape['h']);
                svg.setAttributeNS(null, 'width', shape['w']);
                svg.setAttributeNS(null, 'style', 'cursor: pointer; position: absolute; top: 0; left: 0');

                svgG = document.createElementNS(svg.namespaceURI, 'g');

                /**
                 * Events
                 */
                const _fnMouseenter = (e) => {
                    let _elm = document.getElementById(_id);
                    switch ($scope.hotspot.type) {
                        case 'polygon':
                            _elm.style.stroke = isActived ? colors['hotspotActiveColor']['color'] : colors['hotspotHoverColor']['color'];
                            break;
                        case 'text':
                            _elm.style.fill = isActived ? colors['hotspotActiveColor']['color'] : colors['hotspotHoverColor']['color'];
                            break;
                        default:
                            _elm.style.backgroundColor = isActived ? colors['hotspotActiveColor']['color'] : colors['hotspotHoverColor']['color'];
                            if ($scope.hotspot.type === 'directionIcon') {
                                document.getElementById('rotate' + _id).style.display = 'block';
                            }
                            break;
                    }
                };
                divIcon.unbind('mouseenter', _fnMouseenter);
                divIcon.bind('mouseenter', _fnMouseenter); 

                const _fnMouseleave = (e) => {
                    let _elm = document.getElementById(_id);
                    switch ($scope.hotspot.type) {
                        case 'polygon':
                            _elm.style.stroke = isActived ? colors['hotspotActiveColor']['color'] : colors['hotspotColor']['color'];
                            break;
                        case 'text':
                            _elm.style.fill = isActived ? colors['hotspotActiveColor']['color'] : colors['hotspotColor']['color'];
                            break;
                        default:
                            _elm.style.backgroundColor = isActived ? colors['hotspotActiveColor']['color'] : colors['hotspotColor']['color'];
                            if ($scope.hotspot.type === 'directionIcon') {
                                document.getElementById('rotate' + _id).style.display = 'none';
                            }
                            break;
                    }
                };
                divIcon.unbind('mouseleave', _fnMouseleave);
                divIcon.bind('mouseleave', _fnMouseleave);
                
                const _fnClick = (e) => {
                    $scope.$apply(() => {
                        let fn = $scope.onClick();
                        if (fn && fn.constructor) {
                            fn($scope);
                        }
                    });
                };
                divIcon.unbind('click', _fnClick).bind('click', _fnClick); 

                switch ($scope.hotspot.type) {
                    case 'icon':                        
                        _createIcon(isActived, isHovered);
                        break;
                    case 'directionIcon':
                        _createDirectionIcon(isActived, isHovered);
                        break;
                    case 'text':
                        _createText(isActived, isHovered);
                        break;
                    case 'polygon':
                        _createPolygon(isActived, isHovered);
                        break;
                }
            };
            
            const _createIcon = (isActived, isHovered) => {
                svgImage = document.createElementNS(svg.namespaceURI, 'image');
                svgImage.setAttributeNS(null, 'height', shape['h']);
                svgImage.setAttributeNS(null, 'width', shape['w']);
                svgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', icon['path']);
                svgImage.setAttributeNS(null, 'x', 0);
                svgImage.setAttributeNS(null, 'y', 0);
                svgImage.setAttributeNS(null, 'visibility', 'visible');

                svgG.appendChild(svgImage);
                svg.appendChild(svgG);

                divIcon.attr('id', _id);
                divIcon.css({
                    'width': shape['w'] + 'px',
                    'height': shape['h'] + 'px',
                    'position': 'absolute',
                    'top': '0',
                    'left': '0',
                    'background-color': isActived ? colors['hotspotActiveColor']['color'] : (isHovered ? colors['hotspotHoverColor']['color'] : colors['hotspotColor']['color']),
                    'border-radius': '50%'
                }).append(svg);

                $element.empty().append(divIcon);
            };

            const _createDirectionIcon = (isActived, isHovered) => {
                svgImage = document.createElementNS(svg.namespaceURI, 'image');
                svgImage.setAttributeNS(null, 'height', shape['h']);
                svgImage.setAttributeNS(null, 'width', shape['w']);
                svgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', icon['path']);
                svgImage.setAttributeNS(null, 'x', 0);
                svgImage.setAttributeNS(null, 'y', 0);
                svgImage.setAttributeNS(null, 'visibility', 'visible');

                svgG.appendChild(svgImage);
                svg.appendChild(svgG);
                
                divIcon.attr('id', _id);
                divIcon.css({
                    'width': shape['w'] + 'px',
                    'height': shape['h'] + 'px',
                    'position': 'absolute',
                    'top': (shape['h']) + 'px',
                    'left': (shape['w']) + 'px',
                    'background-color': isActived ? colors['hotspotActiveColor']['color'] : (isHovered ? colors['hotspotHoverColor']['color'] : colors['hotspotColor']['color']),
                    'border-radius': '50%',
                    'z-index': 1
                }).append(svg);

                let divRotate = angular.element('<div/>');
                
                divRotate.attr('id', 'rotate' + _id);
                divRotate.css({
                    'width': (shape['w'] * 3) + 'px',
                    'height': (shape['h'] * 3) + 'px',
                    'position': 'relative',
                    'top': '0px',
                    'left': '0px',
                    'transform': 'rotate(' + shape['deg'] + 'deg)',
                    'display': isActived ? 'block' : 'none',
                    'z-index': 0
                });

                let imgRotate = angular.element('<img/>');
                imgRotate.attr({
                    'src': 'assets/images/rotate.svg',
                    'width': (shape['w'] * 3) + 'px',
                    'height': (shape['h'] * 3) + 'px'
                });
                divRotate.append(imgRotate);

                $element.empty().append(divIcon).append(divRotate);
            };

            const _createText = (isActived, isHovered) => {
                svgText = document.createElementNS(svg.namespaceURI, 'text');
                svgText.setAttributeNS(null, 'id', _id);
                svgText.setAttributeNS(null, 'x', 0);
                svgText.setAttributeNS(null, 'y', shape['h'] / 2);
                svgText.setAttributeNS(null, 'height', shape['h']);
                svgText.setAttributeNS(null, 'width', shape['w']);
                svgText.setAttributeNS(null, 'font-size', shape['h'] / 2);
                svgText.setAttributeNS(null, 'fill', isActived ? colors['hotspotActiveColor']['color'] : (isHovered ? colors['hotspotHoverColor']['color'] : colors['hotspotColor']['color']));
                svgText.appendChild(document.createTextNode(shape['text']));

                svgG.appendChild(svgText);
                svg.appendChild(svgG);

                divIcon.css({
                    'width': shape['w'] + 'px',
                    'height': shape['h'] + 'px',
                    'position': 'absolute',
                    'top': '0',
                    'left': '0'
                }).append(svg);

                $element.empty().append(divIcon);
            };

            const _createPolygon = (isActived, isHovered) => {
                svgPolygon = document.createElementNS(svg.namespaceURI, 'polygon');
                svgPolygon.setAttributeNS(null, 'id', _id);
                svgPolygon.setAttributeNS(null, 'fill', 'rgba(0, 0, 0, .2)');
                svgPolygon.setAttributeNS(null, 'stroke', isActived ? colors['hotspotActiveColor']['color'] : (isHovered ? colors['hotspotHoverColor']['color'] : colors['hotspotColor']['color']));
                svgPolygon.setAttributeNS(null, 'points', (shape['points'].map(point => {
                    let coord = {
                        x: (point['x'] - shape['x']),
                        y:(point['y'] - shape['y'])
                    };

                    return Object.values(coord).join(',');
                })).join(' '));

                svgG.appendChild(svgPolygon);
                svg.appendChild(svgG);
                
                divIcon.css({
                    'width': shape['w'] + 'px',
                    'height': shape['h'] + 'px',
                    'position': 'absolute',
                    'top': '0',
                    'left': '0'
                }).append(svg);

                $element.empty().append(divIcon);
            };

            $scope.$watch('rebuild', (newVal, oldVal) => {                 
                let currentWidth = parseFloat(($scope.options.currentWidth + '').replace(/([a-z]+)$/i, ''));
                let currentHeight = parseFloat(($scope.options.currentHeight + '').replace(/([a-z]+)$/i, ''));
                let posRatio = (currentWidth > currentHeight ? currentWidth : currentHeight) / ($scope.ratio() || 10000);
                let _invalid = false;

                switch ($scope.hotspot.type) {
                    case 'icon':
                    case 'directionIcon':
                    case 'text':
                        $scope.hotspot['data']['shape']['__new'] = Object.assign({}, $scope.hotspot['data']['shape']['data']);
                        for (let _key in $scope.hotspot['data']['shape']['__new']) {
                            if (['w', 'h', 'x', 'y'].indexOf(_key) === -1) {
                                continue;
                            }
                            $scope.hotspot['data']['shape']['__new'][_key] = $scope.hotspot['data']['shape']['__new'][_key] * posRatio;
                        }
                        break;
                    case 'polygon':
                        if (!$scope.hotspot['data']['shape']['data'].hasOwnProperty('points') || !Array.isArray($scope.hotspot['data']['shape']['data']['points'])) {
                            _invalid = true;
                        } else {
                            let maxX = 0;
                            let minX = Infinity;
                            let maxY = 0;
                            let minY = Infinity;
                            let i = 0;
                            let _length = 0;
                            let coords = $scope.hotspot['data']['shape']['data']['points'].filter(coord => {
                                return !isNaN(parseFloat(coord['x'])) && !isNaN(parseFloat(coord['y']));
                            });

                            if ((_length = coords.length) === 0) {
                                _invalid = true;
                            } else {
                                while (i < _length) {
                                    if (isNaN(coords[i]['x']) || isNaN(coords[i]['y'])) {
                                        continue;
                                    }

                                    let x = parseInt(coords[i]['x'], 10),
                                        y = parseInt(coords[i]['y'], 10);

                                    if (x < minX) {
                                        minX = x;
                                    } else if (x > maxX) {
                                        maxX = x;
                                    }

                                    if (y < minY) {
                                        minY = y;
                                    } else if (y > maxY) {
                                        maxY = y;
                                    }

                                    i++;
                                }
                                
                                const xSubtraction = (maxX - minX);
                                const ySubtraction = (maxY - minY);
                                if ((xSubtraction === Infinity) || (ySubtraction === Infinity)) {
                                    _invalid = true;
                                } else {
                                    $scope.hotspot['data']['shape']['__new'] = {
                                        x: minX * posRatio,
                                        y: minY * posRatio,
                                        w: xSubtraction * posRatio,
                                        h: ySubtraction * posRatio,
                                        points: coords.map(coord => {
                                            return {
                                                x: coord['x'] * posRatio,
                                                y: coord['y'] * posRatio
                                            };
                                        })
                                    };
                                }
                            }
                        }
                        break;
                    default:
                        _invalid = true;                        
                        break;
                }

                if (_invalid) {
                    $element.remove();
                } else {
                    _rebuild($scope.actived() === $scope.order(), $scope.hovered() === $scope.order());
                }  
            });  
        }
    }
}]).name;