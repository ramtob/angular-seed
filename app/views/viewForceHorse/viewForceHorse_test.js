'use strict';

describe('viewForceHorse module', function () {
    var graphDataSrv, constants;

    beforeEach(module('viewForceHorse'));

    beforeEach(inject(function(_graphData_, ViewForceHorseConstants) {
        graphDataSrv = _graphData_;
        constants = ViewForceHorseConstants;
    }));

    describe('graphData service', function () {
        it('should be defined', function () {
            expect(graphDataSrv).toBeDefined();
        });

        describe('getRandomScaleFreeGraphData()', function () {
            var graph, nodes, links;
            it ('should return a graph', function () {
                graph = graphDataSrv.getRandomScaleFreeGraphData(10);
                nodes = graph[0].data;
                links = graph[1].data;
                expect(nodes).toBeDefined();
                expect(links).toBeDefined();
                expect(nodes.length).toEqual(10);
            });
        })
    });

});