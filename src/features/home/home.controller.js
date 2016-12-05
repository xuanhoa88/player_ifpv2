import BaseController from '../base.controller';

export default class HomeController extends BaseController {
    constructor(...args) {
        super(...args);

        this.name = 'World';

        // Subscribe on property change 
        this.$scope.$watch(() => this.name, (newVal, oldVal) => {
            console.log(newVal, oldVal);
        });
    }

    /**
     * 
     */
    changeName() {
        this.name = 'angular-tips';
    }

    /**
     * 
     */
    randomName() {
        this.name = this.randomNames.getName();
    }
}

HomeController.$inject = [
    ...BaseController.$inject,
    'randomNames',
    '$http'
];