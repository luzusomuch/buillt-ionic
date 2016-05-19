angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider.state("threadDetail", {
        url: "/:threadId/thread",
        templateUrl: "js/modules/thread/view.html",
        controller: "ThreadDetailCtrl",
        authenticate: true,
    });
});