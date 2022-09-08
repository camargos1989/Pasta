(function () {

    angular.module('services', []).
    factory('service', function ($http) {
        var service = {};

        service.getLastModifiedDate = function () {
            return $http.head("//spreadsheets.google.com/feeds/list/1T7MpDLrNndOFKDnzEZvG0tFDsphZx6BW7Qg-o4xmr_o/od6/public/basic");
        };

        service.getCards = function () {
            //return $http.get("//jsonp.afeld.me/?url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1T7MpDLrNndOFKDnzEZvG0tFDsphZx6BW7Qg-o4xmr_o%2Fpub%3Fgid%3D0%26single%3Dtrue%26output%3Dtsv");
            //return $http.get("//cors.io/?u=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1T7MpDLrNndOFKDnzEZvG0tFDsphZx6BW7Qg-o4xmr_o%2Fpub%3Fgid%3D0%26single%3Dtrue%26output%3Dtsv");
            //return $http.get("//crossorigin.me/https://docs.google.com/spreadsheets/d/1T7MpDLrNndOFKDnzEZvG0tFDsphZx6BW7Qg-o4xmr_o/pub?gid=0&single=true&output=tsv");
            return $http.get("//magicshowcase.apphb.com/home/proxy?address=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1T7MpDLrNndOFKDnzEZvG0tFDsphZx6BW7Qg-o4xmr_o%2Fpub%3Fgid%3D0%26single%3Dtrue%26output%3Dtsv");
        };

        service.getCategories = function () {
            //return $http.get("//jsonp.afeld.me/?url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1T7MpDLrNndOFKDnzEZvG0tFDsphZx6BW7Qg-o4xmr_o%2Fpub%3Fgid%3D766174211%26single%3Dtrue%26output%3Dtsv");
            //return $http.get("//cors.io/?u=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1T7MpDLrNndOFKDnzEZvG0tFDsphZx6BW7Qg-o4xmr_o%2Fpub%3Fgid%3D766174211%26single%3Dtrue%26output%3Dtsv");
            //return $http.get("//crossorigin.me/https://docs.google.com/spreadsheets/d/1T7MpDLrNndOFKDnzEZvG0tFDsphZx6BW7Qg-o4xmr_o/pub?gid=766174211&single=true&output=tsv");
            return $http.get("//magicshowcase.apphb.com/home/proxy?address=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1T7MpDLrNndOFKDnzEZvG0tFDsphZx6BW7Qg-o4xmr_o%2Fpub%3Fgid%3D766174211%26single%3Dtrue%26output%3Dtsv");
        };

        return service;
    });

    var app = angular.module("CartasFaria", ["ngRoute", "services"]);

    app.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: 'partials/home.html',
                    controller: 'HomeController'
                }).
                when('/cards', {
                    templateUrl: 'partials/cards.html',
                    controller: 'CardsController'
                }).
                when('/cards/category/:category', {
                    templateUrl: 'partials/cards.html',
                    controller: 'CardsController'
                }).
                otherwise({
                    redirectTo: '/'
        });
    }]);

    app.config(['$httpProvider', function ($httpProvider) {
        // enable http caching
        $httpProvider.defaults.cache = true;
    }]);

    app.controller("HomeController", function ($scope, service) {
        $scope.lastModified = null;
        $scope.categories = [];

        service.getLastModifiedDate()
            .success(function (data, status, headers) {
                $scope.lastModified = new Date(headers("last-modified"));
            });
        
        
        service.getCategories()
            .success(function (data) {
                var allCategoriesData = data.split('\n');
                var columns = allCategoriesData[0].split('\t');

                for (var i = 1; i < allCategoriesData.length; i++) {
                    var categoryData = allCategoriesData[i].split('\t');

                    var category = {};

                    if (categoryData[0]) {
                        for (var columnIndex = 0; columnIndex < columns.length; columnIndex++) {
                            category[columns[columnIndex].trim()] = categoryData[columnIndex].trim();
                        }

                        $scope.categories.push(category);
                    }
                }
            });
    });

    app.controller("CardsController", function ($scope, $routeParams, service) {

        $scope.currentCategory = $routeParams.category;
        $scope.cards = [];
        $scope.categories = {};
        $scope.selectedColor = '';

        if (!$routeParams.category) {
            $scope.sort = [ "-price", "name" ];
        }

        $scope.filterCards = function (card) {

            if ($routeParams.cardID) {
                return card.id == $routeParams.cardID;
            }

            if ($routeParams.category) {
                return card.category.indexOf($routeParams.category) >= 0;
            }
            else {
                return card.price;
            }
        }

        // Carrega as cartas
        service.getCards()
            .success(function (data) {

                var allCardsData = data.split('\n');
                var columns = allCardsData[0].split('\t');

                for (var i = 1; i < allCardsData.length; i++) {
                    var cardData = allCardsData[i].split('\t');

                    var card = {};

                    if (cardData[0]) {
                        for (var columnIndex = 0; columnIndex < columns.length; columnIndex++) {
                            card[columns[columnIndex].trim()] = cardData[columnIndex].trim();
                        }

                        card.category = card.category.split(',');
                        card.price = parseFloat(card.price);

                        $scope.cards.push(card);
                    }
                }
                
            });

        $scope.categories = [];

        service.getCategories()
            .success(function (data) {
                var allCategoriesData = data.split('\n');
                var columns = allCategoriesData[0].split('\t');

                for (var i = 1; i < allCategoriesData.length; i++) {
                    var categoryData = allCategoriesData[i].split('\t');

                    var category = {};

                    if (categoryData[0]) {
                        for (var columnIndex = 0; columnIndex < columns.length; columnIndex++) {
                            category[columns[columnIndex].trim()] = categoryData[columnIndex].trim();
                        }

                        $scope.categories[category.id] = category;
                    }
                }
            });
    });

})();