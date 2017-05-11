'use strict';

angular.module('viewForceHorse', ['ui.router', 'forceHorse'])

    //---------------------------------------------------------------//
    .config(['$stateProvider', function ($stateProvider) {
        //.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('index.viewForceHorse', {
            url: '/viewForceHorse',
            templateUrl: 'views/viewForceHorse/viewForceHorse.html',
            controller: 'view3Ctrl as ctrl',
            data: {
                title: 'force-horse'
            }
        });
    }])

    //---------------------------------------------------------------//
    .controller('view3Ctrl', ['$scope','$http', 'graphData', 'ViewForceHorseConstants', function ($scope, $http, graphData, constants) {
        //console.log('In view3Ctrl');
        var vm = this;
        
        vm.constants = constants;

        // Set the options, which are passed as a parameter to the directive
        vm.options = {
            data:[
                {
                    data:[]
                },
                {
                    data:[]
                }
            ]
        };

        vm.predefinedFile = 'footballBarcelona';
        createGraphFromPredefinedFile();
        // vm.options.data = graphData.getRandomData(vm.numOfNodes = constants.INITIAL_NUM_OF_NODES);

        // Watch the variable where the directive will reference its instance.
        // Register my event handlers when the directive is ready
        $scope.$watch(function () {
            return vm.options.forceHorseInstance;
        }, function(newValue) {
            newValue.addEventListener.call(newValue, 'hover', vm.onHoverOutside)
                .addEventListener.call(newValue, 'select', vm.onSelectOutside)
                .addEventListener.call(newValue, 'filter', vm.onFilterOutside)
            .addEventListener.call(newValue, 'dblclick', vm.onDblClickOutside);
        });

        // Other initializations
        vm.setArrays = function () {
            vm.data = [];
            vm.data[constants.NODES] = vm.options.data[constants.NODES].data;
            vm.data[constants.EDGES] = vm.options.data[constants.EDGES].data;
            vm.nodeById = {};
            vm.data[constants.NODES].forEach(function (item) {
                vm.nodeById[item.id] = item;
            });
        };
        vm.setArrays();

        vm.NODES = constants.NODES;
        vm.EDGES = constants.EDGES;

        vm.createRandomGraph = function () {
            vm.options.data = graphData.getRandomData(vm.numOfNodes);
            vm.setArrays();
            vm.options.forceHorseInstance.redraw();
        };

        vm.createGraphFromFile = function () {
            var f = event.target.files[0];
            if (f) {
                var r = new FileReader();
                r.onload = function(evt2) {
                    var data = JSON.parse(evt2.target.result);
                    vm.options.data = vm.options.forceHorseInstance.convertFileDataFormat(data);
                    vm.setArrays();
                    vm.numOfNodes = vm.data[constants.NODES].length; // show no. of nodes on screen
                    vm.options.forceHorseInstance.redraw();
                };
                r.readAsText(f);
            } else {
                console.warn('File read error');
            }
        };

        function createGraphFromPredefinedFile() {
          $http.get(constants.FILES_SERVER_ADDR + vm.predefinedFile + ".json")
              .then(function (response) {
                  vm.options.data = vm.options.forceHorseInstance.convertFileDataFormat(response.data);
                  vm.setArrays();
                  vm.numOfNodes = vm.data[constants.NODES].length; // show no. of nodes on screen
                  vm.options.forceHorseInstance.redraw();
              })
              .catch(function (response) {
                  console.warn('File read error: ' + response.status + " " + response.statusText);
              })
        }

        vm.createGraphFromPredefinedFile = createGraphFromPredefinedFile;

        vm.selectedItems = [new Set(), new Set()]; // selected nodes, edges

        //----- Event handlers -----//

        // An element was hovered inside this view
        vm.onHoverInside = function (item, on) {
            item.hovered = on;
            vm.setHoverState(item);
            if (angular.isDefined(vm.options.forceHorseInstance)) {
                vm.options.forceHorseInstance.onHoverOutside(item);
            }
        };

        // An element was hovered outside this view (in the graph component)
        vm.onHoverOutside = function (item) {
            $scope.$apply(function () {
                //console.log("onHoverOutside: label=" + item.label + " hovered=" + item.hovered);
                vm.setHoverState(item);
            });
        };

        // Update hover-related fields
        vm.setHoverState = function (item) {
            if (item) {
                if (item.hovered) {
                    if (item.class === constants.CLASS_NODE) {
                        vm.lastHoveredNode = item;
                    } else if (item.class === constants.CLASS_EDGE) {
                        vm.lastHoveredEdge = item;
                    }
                }
            }
        };

        // An element was clicked on
        vm.onClick = function (event, item) {
            var element = event.currentTarget;
            // If the Ctrl key was pressed during the click ..
            // If the clicked element was marked as selected, unselect it, and vice versa
            if (event.ctrlKey) {
                vm.onSelectInside(element, item, !item.selected);
            } else {
                // If the Ctrl key was not pressed ..
                // If the clicked node is selected, ignore the click
                // Else, clear the current selection, and select the clicked node
                if (!item.selected) {
                    vm.onSelectInside(element, item, true, true);
                }
            }
        };

        // Elements were selected inside this view
        vm.onSelectInside = function (element, item, on, clearOldSelection) {
            var itemType = (item.class === constants.CLASS_NODE ? constants.NODES : constants.EDGES);

            if (clearOldSelection) {
                vm.data[itemType].filter(function (d) {
                    return vm.selectedItems[itemType].has(d.id);
                }).forEach(function (d) {
                    d.selected = false;
                });
                vm.selectedItems[itemType].clear();
            }

            // Update the selectedItems set
            if (item.selected = on) {
                vm.selectedItems[itemType].add(item.id);
            } else {
                vm.selectedItems[itemType].delete(item.id);
            }

            if (angular.isDefined(vm.options.forceHorseInstance)) {
                vm.options.forceHorseInstance.onSelectOutside();
            }
        };

        // Elements were selected and/or unselected somewhere
        vm.onSelectOutside = function () {
            $scope.$apply(function () {
                for (var itemType = constants.NODES; itemType <= constants.EDGES; itemType++) {
                    vm.selectedItems[itemType].clear();
                    vm.data[itemType].forEach(function (item) {
                        if (item.selected) {
                            vm.selectedItems[itemType].add(item.id);
                        }
                    });
                }
            });
        };

        // Elements were filtered out inside this view
        vm.onFilterInside = function () {
            // Mark the selected items as filtered, and unselect them
            // Also clear the selected-items sets
            for (let itemType = constants.NODES; itemType <= constants.EDGES; itemType++) {
                vm.data[itemType].filter(function (d) {
                    return d.selected;
                }).forEach(function (d) {
                    d.filtered = true;
                    d.selected = false;
                });
                vm.selectedItems[itemType].clear();
            }

            // Remove edges connected to filtered nodes
            vm.data[constants.EDGES].filter(function (d) {
                return vm.nodeById[d.sourceID].filtered || vm.nodeById[d.targetID].filtered;
            }).forEach(function (d) {
                d.filtered = true;
            });

            // Broadcast event
            if (angular.isDefined(vm.options.forceHorseInstance)) {
                vm.options.forceHorseInstance.onFilterOutside();
            }
        };

        // Elements were filtered out somewhere
        vm.onFilterOutside = function () {
            //$scope.$apply(function () {
                // Referesh the selected-items sets
                for (var itemType = constants.NODES; itemType <= constants.EDGES; itemType++) {
                    vm.selectedItems[itemType].clear();
                    vm.data[itemType].forEach(function (item) {
                        if (item.selected) {
                            vm.selectedItems[itemType].add(item.id);
                        }
                    });
                }
            //});
        };

        // A node was double-clicked on outside the view
        vm.onDblClickOutside = function (node) {
            console.log(`view3: got a double-click on node ${node.label}`);
        };

        }]) // .controller


    //---------------------------------------------------------------//
    .service('graphData', ['ViewForceHorseConstants', 'graphDataHelper', function (constants, helper) {
        return {
            //---------------------------------------------------
            // Get data for a random graph
            //---------------------------------------------------
            getRandomData: function (numOfNodes) {
                var graphData = [
                    {id: constants.NODES_ID, data: []},
                    {id: constants.EDGES_ID, data: []}
                ];

                // Generate a random graph

                var i;
                for (i = 0; i < numOfNodes; i++) {
                    helper.fillNodeAttributes(i, graphData[constants.NODES].data);
                }

                var numEdges = numOfNodes * 3 / 2;
                for (i = 0; i < numEdges; i++) {
                    helper.AddEdgeWithAttributes(
                        Math.floor(Math.random() * numOfNodes),
                        Math.floor(Math.random() * numOfNodes),
                        graphData[constants.NODES].data,
                        graphData[constants.EDGES].data
                    );
                }

                return graphData;
            },

            getRandomScaleFreeGraphData: function (requiredNumOfNodes) {

                // Start with two connected nodes
                var nodes = [],
                    currentNumOfNodes = 0;
                helper.fillNodeAttributes(currentNumOfNodes++, nodes);
                helper.fillNodeAttributes(currentNumOfNodes++, nodes);
                var edges = [];
                helper.AddEdgeWithAttributes(0, 1, nodes, edges);
                // An array for preferential attachment distribution selection
                var selectionArray = [0, 1],
                    selectionArrayLength = 2,
                    randomIndex;

                // Add nodes one by one, add edges with preferential attachment distribution
                while (currentNumOfNodes < requiredNumOfNodes) {
                    // allocate a new node
                    helper.fillNodeAttributes(currentNumOfNodes++, nodes);
                    // get random index in selection array
                    randomIndex = _.random(0, selectionArrayLength - 1);
                    // connect the new node to the randomally selected one
                    helper.AddEdgeWithAttributes(currentNumOfNodes-1, selectionArray[randomIndex], nodes, edges);
                    // add the indexes of the newly connected nodes to the selection array
                    selectionArray.push(currentNumOfNodes-1);
                    selectionArray.push(selectionArray[randomIndex]);
                    selectionArrayLength += 2;
                }
                return {
                    nodes: nodes,
                    links: edges
                }
            }

        }; // return
    }])


    //---------------------------------------------------------------//
    .service('graphDataHelper', ['ViewForceHorseConstants', function (constants) {
        return {
            fillNodeAttributes: function(nodeIndex, nodesArray) {
                var node = nodesArray[nodeIndex] = {};
                node.class = constants.CLASS_NODE;
                node.label = (new Array(constants.LABEL_LENGTH)).fill(null).map(function() { return constants.ALEPHBET.charAt(Math.floor(Math.random() * constants.ALEPHBET.length)); }).join('');
                node.shape = d3.symbols[Math.floor(Math.random() * d3.symbols.length)];
                node.id = nodeIndex;
                node.color = '#' + Math.floor(Math.random() * constants.MAX_COLOR).toString(16);
                // node.weight = constants.MIN_WEIGHT + Math.floor(Math.random() * (constants.MAX_WEIGHT - constants.MIN_WEIGHT + 1));
            },

            AddEdgeWithAttributes: function(sourceNodeIdx, targetNodeIdx, nodesArray, edgesArray) {
                var edge = {};
                edge.class = constants.CLASS_EDGE;
                edge.source = sourceNodeIdx;
                edge.sourceLabel = nodesArray[sourceNodeIdx].label;
                edge.target = targetNodeIdx;
                edge.targetLabel = nodesArray[targetNodeIdx].label;
                edge.color = '#' + Math.floor(Math.random() * constants.MAX_COLOR).toString(16);
                // edge.id = edgeIdx;
                // edge.weight = constants.MIN_WEIGHT + Math.floor(Math.random() * (constants.MAX_WEIGHT - constants.MIN_WEIGHT + 1));
                edgesArray.push(edge);
            }
        };
    }])


    //---------------------------------------------------------------//
    .constant('ViewForceHorseConstants', {
        INITIAL_NUM_OF_NODES: 20,
        MAX_COLOR: parseInt("0xffffff"),
        NODES: 0,
        EDGES: 1,
        NODES_ID: 1,
        EDGES_ID: 2,
        CLASS_NODE: 'Node',
        CLASS_EDGE: 'Edge',
        MIN_WEIGHT: 0,
        MAX_WEIGHT: 4,
        LABEL_LENGTH: 5,
        PREDEFINED_FILES: ['footballBarcelona', 'Les Miserables', 'FSQ 100', 'FSQ 1000'],
        FILES_SERVER_ADDR: '/force-horse-demo/app/assets/',
        ALEPHBET: "abcdefghijklmnopqrstuvwxyz0123456789"
    })


    //---------------------------------------------------------------//
        // A special on-change attribute for <input type="file">
        // which is not currently supported by angular's ng-change.
        // Borrowed from http://stackoverflow.com/a/19647381/4402222
    //---------------------------------------------------------------//
    .directive('fileInputOnChange', function() {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeFunc = scope.$eval(attrs.fileInputOnChange);
            element.bind('change', onChangeFunc);
        }
    }
});
