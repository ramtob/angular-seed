'use strict';

describe('viewForceHorse module', function () {
    var graphDataSrv;

    beforeEach(module('viewForceHorse'));

    beforeEach(inject(function(_graphData_) {
        graphDataSrv = _graphData_;
    }));

    describe('graphData service', function () {
        it('should be defined', function () {
            expect(graphDataSrv).toBeDefined();
        });

        describe('getRandomScaleFreeGraphData()', function () {
            var graph;
            it ('should return a graph', function () {
                graph = graphDataSrv.getRandomScaleFreeGraphData(10);
                expect(graph.nodes).toBeDefined();
                expect(graph.links).toBeDefined();
            });
        })
    });

});