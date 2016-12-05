export default class BaseController {
    constructor(...args) {
        // Assign injections to context
        const $ngInject = this.constructor.$inject;
        if (Array.isArray($ngInject)) {
            $ngInject.forEach((_inject, _index) => {
                this[_inject] = args[_index];
            });
        }
    }
}

BaseController.$inject = ['$scope'];