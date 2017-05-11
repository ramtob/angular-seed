'use strict';

describe('viewForceHorse module', function () {
    var graphData;

    beforeEach(module('viewForceHorse'));

    beforeEach(inject(function(_graphData_) {
        graphData = _graphData_;
    }));

    describe('graphData service', function () {
        it('should be defined', function () {
            expect(graphData).toBeDefined();
        })
    });

});