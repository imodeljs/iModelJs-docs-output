"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class GeometryHandler {
    handleCurveCollection(_g) { }
    handlePath(g) { return this.handleCurveCollection(g); }
    handleLoop(g) { return this.handleCurveCollection(g); }
    handleParityRegion(g) { return this.handleCurveCollection(g); }
    handleUnionRegion(g) { return this.handleCurveCollection(g); }
    handleBagOfCurves(g) { return this.handleCurveCollection(g); }
}
exports.GeometryHandler = GeometryHandler;
/**
 * `NullGeometryHandler` is a base class for dispatching various geometry types to
 * appliation specific implementation of some service.
 *
 * To use:
 * * Derive a class from `NullGeometryHandler`
 * * Reimplement any or all of the specific `handleXXXX` methods
 * * Create a handler instance `myHandler`
 * * To send a `GeometryQuery` object `candidateGeometry` through the (fast) dispatch, invoke   `candidateGeometry.dispatchToHandler (myHandler)
 * * The appropriate method or methods will get called with a strongly typed `_g ` value.
 */
class NullGeometryHandler extends GeometryHandler {
    handleLineSegment3d(_g) { return undefined; }
    handleLineString3d(_g) { return undefined; }
    handleArc3d(_g) { return undefined; }
    handleCurveCollection(_g) { return undefined; }
    handleBSplineCurve3d(_g) { return undefined; }
    handleBSplineSurface3d(_g) { return undefined; }
    handleCoordinateXYZ(_g) { return undefined; }
    handleBSplineSurface3dH(_g) { return undefined; }
    handleIndexedPolyface(_g) { return undefined; }
    handleTransitionSpiral(_g) { return undefined; }
    handlePath(_g) { return undefined; }
    handleLoop(_g) { return undefined; }
    handleParityRegion(_g) { return undefined; }
    handleUnionRegion(_g) { return undefined; }
    handleBagOfCurves(_g) { return undefined; }
    handleSphere(_g) { return undefined; }
    handleCone(_g) { return undefined; }
    handleBox(_g) { return undefined; }
    handleTorusPipe(_g) { return undefined; }
    handleLinearSweep(_g) { return undefined; }
    handleRotationalSweep(_g) { return undefined; }
    handleRuledSweep(_g) { return undefined; }
    handlePointString3d(_g) { return undefined; }
}
exports.NullGeometryHandler = NullGeometryHandler;
//# sourceMappingURL=GeometryHandler.js.map