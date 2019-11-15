"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Polyface */
// import { Point2d } from "./Geometry2d";
/* tslint:disable:variable-name jsdoc-format no-empty*/
// import { Point3d, Vector3d, Point2d } from "./PointVector";
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Polyface_1 = require("./Polyface");
const Matrix4d_1 = require("../geometry4d/Matrix4d");
const CurveCollection_1 = require("../curve/CurveCollection");
const Loop_1 = require("../curve/Loop");
const LineString3d_1 = require("../curve/LineString3d");
const PolygonOps_1 = require("../geometry3d/PolygonOps");
const MomentData_1 = require("../geometry4d/MomentData");
const IndexedEdgeMatcher_1 = require("./IndexedEdgeMatcher");
const Transform_1 = require("../geometry3d/Transform");
const Segment1d_1 = require("../geometry3d/Segment1d");
const PolyfaceBuilder_1 = require("./PolyfaceBuilder");
const Geometry_1 = require("../Geometry");
const LineSegment3d_1 = require("../curve/LineSegment3d");
const ChainMerge_1 = require("../topology/ChainMerge");
const UnionFind_1 = require("../numerics/UnionFind");
const StrokeOptions_1 = require("../curve/StrokeOptions");
const RangeLengthData_1 = require("./RangeLengthData");
const XYPointBuckets_1 = require("./multiclip/XYPointBuckets");
const Range_1 = require("../geometry3d/Range");
/** PolyfaceQuery is a static class whose methods implement queries on a polyface or polyface visitor provided as a parameter to each method.
 * @public
 */
class PolyfaceQuery {
    /** copy the points from a visitor into a Linestring3d in a Loop object */
    static visitorToLoop(visitor) {
        const ls = LineString3d_1.LineString3d.createPoints(visitor.point.getPoint3dArray());
        return Loop_1.Loop.create(ls);
    }
    /** Create a linestring loop for each facet of the polyface. */
    static indexedPolyfaceToLoops(polyface) {
        const result = CurveCollection_1.BagOfCurves.create();
        const visitor = polyface.createVisitor(1);
        while (visitor.moveToNextFacet()) {
            const loop = PolyfaceQuery.visitorToLoop(visitor);
            result.tryAddChild(loop);
        }
        return result;
    }
    /** Return the sum of all facets areas. */
    static sumFacetAreas(source) {
        let s = 0;
        if (source instanceof Polyface_1.Polyface)
            return PolyfaceQuery.sumFacetAreas(source.createVisitor(1));
        const visitor = source;
        visitor.reset();
        while (visitor.moveToNextFacet()) {
            s += PolygonOps_1.PolygonOps.sumTriangleAreas(visitor.point.getPoint3dArray());
        }
        return s;
    }
    /** sum volumes of tetrahedra from origin to all facets.
     * * if origin is omitted, the first point encountered (by the visitor) is used as origin.
     * * If the mesh is closed, this sum is the volume.
     * * If the mesh is not closed, this sum is the volume of a mesh with various additional facets
     * from the origin to facets.
    */
    static sumTetrahedralVolumes(source, origin) {
        let s = 0;
        if (source instanceof Polyface_1.Polyface)
            return PolyfaceQuery.sumTetrahedralVolumes(source.createVisitor(0), origin);
        let myOrigin = origin;
        const visitor = source;
        const facetOrigin = Point3dVector3d_1.Point3d.create();
        const targetA = Point3dVector3d_1.Point3d.create();
        const targetB = Point3dVector3d_1.Point3d.create();
        visitor.reset();
        while (visitor.moveToNextFacet()) {
            if (myOrigin === undefined)
                myOrigin = visitor.point.getPoint3dAtUncheckedPointIndex(0);
            visitor.point.getPoint3dAtUncheckedPointIndex(0, facetOrigin);
            for (let i = 1; i + 1 < visitor.point.length; i++) {
                visitor.point.getPoint3dAtUncheckedPointIndex(i, targetA);
                visitor.point.getPoint3dAtUncheckedPointIndex(i + 1, targetB);
                s += myOrigin.tripleProductToPoints(facetOrigin, targetA, targetB);
            }
        }
        return s / 6.0;
    }
    /** sum (signed) volumes between facets and a plane.
     * Return a structure with multiple sums:
     * * volume = the sum of (signed) volumes between facets and the plane.
     * * positiveAreaMomentData, negativeProjectedFacetAreaMoments = moment data with centroid, area, and second moments with respect to the centroid.
     *
    */
    static sumVolumeBetweenFacetsAndPlane(source, plane) {
        if (source instanceof Polyface_1.Polyface)
            return PolyfaceQuery.sumVolumeBetweenFacetsAndPlane(source.createVisitor(0), plane);
        const visitor = source;
        const facetOrigin = Point3dVector3d_1.Point3d.create();
        const targetA = Point3dVector3d_1.Point3d.create();
        const targetB = Point3dVector3d_1.Point3d.create();
        const triangleNormal = Point3dVector3d_1.Vector3d.create();
        const planeNormal = plane.getNormalRef();
        let h0, hA, hB;
        let signedVolumeSum = 0.0;
        let signedTriangleArea;
        let singleFacetArea;
        const positiveAreaMomentSums = MomentData_1.MomentData.create(undefined, true);
        const negativeAreaMomentSums = MomentData_1.MomentData.create(undefined, true);
        const singleFacetProducts = Matrix4d_1.Matrix4d.createZero();
        const projectToPlane = plane.getProjectionToPlane();
        visitor.reset();
        // For each facet ..
        //   Form triangles from facet origin to each far edge.
        //   Sum signed area and volume contributions
        // each "projectedArea" contribution is twice the area of a triangle.
        // each volume contribution is  3 times the actual volume -- (1/3) of the altitude sums was the centroid altitude.
        while (visitor.moveToNextFacet()) {
            visitor.point.getPoint3dAtUncheckedPointIndex(0, facetOrigin);
            h0 = plane.altitude(facetOrigin);
            singleFacetArea = 0;
            // within a single facets, the singleFacetArea sum is accumulated with signs of individual triangles.
            // For a non-convex facet, this can be a mixture of positive and negative areas.
            // The absoluteProjectedAreaSum contribution is forced positive after the sum for the facet.
            for (let i = 1; i + 1 < visitor.point.length; i++) {
                visitor.point.getPoint3dAtUncheckedPointIndex(i, targetA);
                visitor.point.getPoint3dAtUncheckedPointIndex(i + 1, targetB);
                facetOrigin.crossProductToPoints(targetA, targetB, triangleNormal);
                hA = plane.altitude(targetA);
                hB = plane.altitude(targetB);
                signedTriangleArea = planeNormal.dotProduct(triangleNormal);
                singleFacetArea += signedTriangleArea;
                signedVolumeSum += signedTriangleArea * (h0 + hA + hB);
            }
            singleFacetProducts.setZero();
            visitor.point.multiplyTransformInPlace(projectToPlane);
            PolygonOps_1.PolygonOps.addSecondMomentAreaProducts(visitor.point, facetOrigin, singleFacetProducts);
            if (singleFacetArea > 0) {
                positiveAreaMomentSums.accumulateProductsFromOrigin(facetOrigin, singleFacetProducts, 1.0);
            }
            else {
                negativeAreaMomentSums.accumulateProductsFromOrigin(facetOrigin, singleFacetProducts, 1.0);
            }
        }
        positiveAreaMomentSums.shiftOriginAndSumsToCentroidOfSums();
        negativeAreaMomentSums.shiftOriginAndSumsToCentroidOfSums();
        const positiveAreaMoments = MomentData_1.MomentData.inertiaProductsToPrincipalAxes(positiveAreaMomentSums.origin, positiveAreaMomentSums.sums);
        const negativeAreaMoments = MomentData_1.MomentData.inertiaProductsToPrincipalAxes(negativeAreaMomentSums.origin, negativeAreaMomentSums.sums);
        return {
            volume: signedVolumeSum / 6.0,
            positiveProjectedFacetAreaMoments: positiveAreaMoments,
            negativeProjectedFacetAreaMoments: negativeAreaMoments,
        };
    }
    /** Return the inertia products [xx,xy,xz,xw, yw, etc] integrated over all all facets, as viewed from origin. */
    static sumFacetSecondAreaMomentProducts(source, origin) {
        if (source instanceof Polyface_1.Polyface)
            return PolyfaceQuery.sumFacetSecondAreaMomentProducts(source.createVisitor(0), origin);
        const products = Matrix4d_1.Matrix4d.createZero();
        const visitor = source;
        visitor.reset();
        while (visitor.moveToNextFacet()) {
            PolygonOps_1.PolygonOps.addSecondMomentAreaProducts(visitor.point, origin, products);
        }
        return products;
    }
    /** Return the inertia products [xx,xy,xz,xw, yw, etc] integrated over all tetrahedral volumes from origin */
    static sumFacetSecondVolumeMomentProducts(source, origin) {
        if (source instanceof Polyface_1.Polyface)
            return PolyfaceQuery.sumFacetSecondVolumeMomentProducts(source.createVisitor(0), origin);
        const products = Matrix4d_1.Matrix4d.createZero();
        const visitor = source;
        visitor.reset();
        while (visitor.moveToNextFacet()) {
            PolygonOps_1.PolygonOps.addSecondMomentVolumeProducts(visitor.point, origin, products);
        }
        return products;
    }
    /** Compute area moments for the mesh. In the returned MomentData:
     * * origin is the centroid.
     * * localToWorldMap has the origin and principal directions
     * * radiiOfGyration radii for rotation around the x,y,z axes.
     */
    static computePrincipalAreaMoments(source) {
        const origin = source.data.getPoint(0);
        if (!origin)
            return undefined;
        const inertiaProducts = PolyfaceQuery.sumFacetSecondAreaMomentProducts(source, origin);
        return MomentData_1.MomentData.inertiaProductsToPrincipalAxes(origin, inertiaProducts);
    }
    /** Compute area moments for the mesh. In the returned MomentData:
     * * origin is the centroid.
     * * localToWorldMap has the origin and principal directions
     * * radiiOfGyration radii for rotation around the x,y,z axes.
     * * The result is only valid if the mesh is closed.
     * * There is no test for closure.  Use `PolyfaceQuery.isPolyfaceClosedByEdgePairing(polyface)` to test for closure.
     */
    static computePrincipalVolumeMoments(source) {
        const origin = source.data.getPoint(0);
        if (!origin)
            return undefined;
        const inertiaProducts = PolyfaceQuery.sumFacetSecondVolumeMomentProducts(source, origin);
        return MomentData_1.MomentData.inertiaProductsToPrincipalAxes(origin, inertiaProducts);
    }
    /**
     * Test if the facets in `source` occur in perfectly mated pairs, as is required for a closed manifold volume.
     * @param source
     */
    static isPolyfaceClosedByEdgePairing(source) {
        const edges = new IndexedEdgeMatcher_1.IndexedEdgeMatcher();
        const visitor = source.createVisitor(1);
        visitor.reset();
        while (visitor.moveToNextFacet()) {
            const numEdges = visitor.pointCount - 1;
            for (let i = 0; i < numEdges; i++) {
                edges.addEdge(visitor.clientPointIndex(i), visitor.clientPointIndex(i + 1), visitor.currentReadIndex());
            }
        }
        const badClusters = [];
        edges.sortAndCollectClusters(undefined, badClusters, undefined, badClusters);
        return badClusters.length === 0;
    }
    /**
    * Test if the facets in `source` occur in perfectly mated pairs, as is required for a closed manifold volume.
    * If not, extract the boundary edges as lines.
    * @param source
    */
    static boundaryEdges(source, includeDanglers = true, includeMismatch = true, includeNull = true) {
        const edges = new IndexedEdgeMatcher_1.IndexedEdgeMatcher();
        const visitor = source.createVisitor(1);
        visitor.reset();
        while (visitor.moveToNextFacet()) {
            const numEdges = visitor.pointCount - 1;
            for (let i = 0; i < numEdges; i++) {
                edges.addEdge(visitor.clientPointIndex(i), visitor.clientPointIndex(i + 1), visitor.currentReadIndex());
            }
        }
        const bad1 = [];
        const bad2 = [];
        const bad0 = [];
        edges.sortAndCollectClusters(undefined, bad1, bad0, bad2);
        const badList = [];
        if (includeDanglers && bad1.length > 0)
            badList.push(bad1);
        if (includeMismatch && bad2.length > 0)
            badList.push(bad2);
        if (includeNull && bad0.length > 0)
            badList.push(bad0);
        if (badList.length === 0)
            return undefined;
        const result = new CurveCollection_1.BagOfCurves();
        for (const list of badList) {
            for (const e of list) {
                const e1 = e instanceof IndexedEdgeMatcher_1.SortableEdge ? e : e[0];
                const indexA = e1.vertexIndexA;
                const indexB = e1.vertexIndexB;
                const pointA = source.data.getPoint(indexA);
                const pointB = source.data.getPoint(indexB);
                if (pointA && pointB)
                    result.tryAddChild(LineSegment3d_1.LineSegment3d.create(pointA, pointB));
            }
        }
        return result;
    }
    /** Find segments (within the linestring) which project to facets.
     * * Announce each pair of linestring segment and on-facet segment through a callback.
     * * Facets are ASSUMED to be convex and planar.
     */
    static announceSweepLinestringToConvexPolyfaceXY(linestringPoints, polyface, announce) {
        const visitor = polyface.createVisitor(0);
        const numLinestringPoints = linestringPoints.length;
        const segmentPoint0 = Point3dVector3d_1.Point3d.create();
        const segmentPoint1 = Point3dVector3d_1.Point3d.create();
        const localSegmentPoint0 = Point3dVector3d_1.Point3d.create();
        const localSegmentPoint1 = Point3dVector3d_1.Point3d.create();
        const clipFractions = Segment1d_1.Segment1d.create(0, 1);
        const localFrame = Transform_1.Transform.createIdentity();
        let frame;
        for (visitor.reset(); visitor.moveToNextFacet();) {
            // For each triangle within the facet ...
            for (let k1 = 1; k1 + 1 < visitor.point.length; k1++) {
                frame = visitor.point.fillLocalXYTriangleFrame(0, k1, k1 + 1, localFrame);
                if (frame) {
                    // For each stroke of the linestring ...
                    for (let i1 = 1; i1 < numLinestringPoints; i1++) {
                        linestringPoints.getPoint3dAtCheckedPointIndex(i1 - 1, segmentPoint0);
                        linestringPoints.getPoint3dAtCheckedPointIndex(i1, segmentPoint1);
                        frame.multiplyInversePoint3d(segmentPoint0, localSegmentPoint0);
                        frame.multiplyInversePoint3d(segmentPoint1, localSegmentPoint1);
                        clipFractions.set(0, 1);
                        /** (x,y,1-x-y) are barycentric coordinates in the triangle !!! */
                        if (clipFractions.clipBy01FunctionValuesPositive(localSegmentPoint0.x, localSegmentPoint1.x)
                            && clipFractions.clipBy01FunctionValuesPositive(localSegmentPoint0.y, localSegmentPoint1.y)
                            && clipFractions.clipBy01FunctionValuesPositive(1 - localSegmentPoint0.x - localSegmentPoint0.y, 1 - localSegmentPoint1.x - localSegmentPoint1.y)) {
                            /* project the local segment point to the plane. */
                            const localClippedPointA = localSegmentPoint0.interpolate(clipFractions.x0, localSegmentPoint1);
                            const localClippedPointB = localSegmentPoint0.interpolate(clipFractions.x1, localSegmentPoint1);
                            const worldClippedPointA = localFrame.multiplyPoint3d(localClippedPointA);
                            const worldClippedPointB = localFrame.multiplyPoint3d(localClippedPointB);
                            const planePointA = localFrame.multiplyXYZ(localClippedPointA.x, localClippedPointA.y, 0.0);
                            const planePointB = localFrame.multiplyXYZ(localClippedPointB.x, localClippedPointB.y, 0.0);
                            const splitParameter = Geometry_1.Geometry.inverseInterpolate01(localSegmentPoint0.z, localSegmentPoint1.z);
                            // emit 1 or 2 panels, oriented so panel normal is always to the left of the line.
                            if (splitParameter !== undefined && splitParameter > clipFractions.x0 && splitParameter < clipFractions.x1) {
                                const piercePointX = segmentPoint0.interpolate(splitParameter, segmentPoint1);
                                const piercePointY = piercePointX.clone(); // so points are distinct for the two triangle announcements.
                                announce(linestringPoints, i1 - 1, polyface, visitor.currentReadIndex(), [worldClippedPointA, piercePointX, planePointA], 2, 1);
                                announce(linestringPoints, i1 - 1, polyface, visitor.currentReadIndex(), [worldClippedPointB, piercePointY, planePointB], 1, 2);
                            }
                            else if (localSegmentPoint0.z > 0) { // segment is entirely above
                                announce(linestringPoints, i1 - 1, polyface, visitor.currentReadIndex(), [worldClippedPointA, worldClippedPointB, planePointB, planePointA], 3, 2);
                            }
                            else // segment is entirely under
                                announce(linestringPoints, i1 - 1, polyface, visitor.currentReadIndex(), [worldClippedPointB, worldClippedPointA, planePointA, planePointB], 2, 3);
                        }
                    }
                }
            }
        }
    }
    /** Search the facets for facet subsets that are connected with at least vertex contact.
     * * Return array of arrays of facet indices.
     */
    static partitionFacetIndicesByVertexConnectedComponent(polyface) {
        if (polyface instanceof Polyface_1.Polyface) {
            return this.partitionFacetIndicesByVertexConnectedComponent(polyface.createVisitor(0));
        }
        // The polyface is really a visitor !!!
        const context = new UnionFind_1.UnionFindContext(polyface.clientPolyface().data.point.length);
        for (polyface.reset(); polyface.moveToNextFacet();) {
            const firstVertexIndexOnThisFacet = polyface.pointIndex[0];
            for (const vertexIndex of polyface.pointIndex)
                context.mergeSubsets(firstVertexIndexOnThisFacet, vertexIndex);
        }
        const roots = context.collectRootIndices();
        const facetsInComponent = [];
        const numRoots = roots.length;
        for (let i = 0; i < numRoots; i++) {
            facetsInComponent.push([]);
        }
        for (polyface.reset(); polyface.moveToNextFacet();) {
            const firstVertexIndexOnThisFacet = polyface.pointIndex[0];
            const rootVertexForThisFacet = context.findRoot(firstVertexIndexOnThisFacet);
            for (let rootIndex = 0; rootIndex < numRoots; rootIndex++) {
                if (roots[rootIndex] === rootVertexForThisFacet) {
                    facetsInComponent[rootIndex].push(polyface.currentReadIndex());
                    break;
                }
            }
        }
        return facetsInComponent;
    }
    /** Clone the facets in each partition to a separate polyface.
     *
     */
    static clonePartitions(polyface, partitions) {
        if (polyface instanceof Polyface_1.Polyface) {
            return this.clonePartitions(polyface.createVisitor(0), partitions);
        }
        polyface.setNumWrap(0);
        const polyfaces = [];
        const options = StrokeOptions_1.StrokeOptions.createForFacets();
        options.needNormals = polyface.normal !== undefined;
        options.needParams = polyface.param !== undefined;
        options.needColors = polyface.color !== undefined;
        options.needTwoSided = polyface.twoSided;
        for (const partition of partitions) {
            const builder = PolyfaceBuilder_1.PolyfaceBuilder.create(options);
            polyface.reset();
            for (const facetIndex of partition) {
                polyface.moveToReadIndex(facetIndex);
                builder.addFacetFromVisitor(polyface);
            }
            polyfaces.push(builder.claimPolyface(true));
        }
        return polyfaces;
    }
    /** Search the facets for facet subsets that are connected with at least edge contact.
     * * Return array of arrays of facet indices.
     */
    static partitionFacetIndicesByEdgeConnectedComponent(polyface) {
        if (polyface instanceof Polyface_1.Polyface) {
            return this.partitionFacetIndicesByEdgeConnectedComponent(polyface.createVisitor(0));
        }
        polyface.setNumWrap(1);
        const matcher = new IndexedEdgeMatcher_1.IndexedEdgeMatcher();
        polyface.reset();
        let numFacets = 0;
        while (polyface.moveToNextFacet()) {
            const numEdges = polyface.pointCount - 1;
            numFacets++;
            for (let i = 0; i < numEdges; i++) {
                matcher.addEdge(polyface.clientPointIndex(i), polyface.clientPointIndex(i + 1), polyface.currentReadIndex());
            }
        }
        const allEdges = [];
        matcher.sortAndCollectClusters(allEdges, allEdges, allEdges, allEdges);
        const context = new UnionFind_1.UnionFindContext(numFacets);
        for (const cluster of allEdges) {
            if (cluster instanceof IndexedEdgeMatcher_1.SortableEdge) {
                // this edge does not connect anywhere.  Ignore it!!
            }
            else {
                const edge0 = cluster[0];
                for (let i = 1; i < cluster.length; i++)
                    context.mergeSubsets(edge0.facetIndex, cluster[i].facetIndex);
            }
        }
        const roots = context.collectRootIndices();
        const facetsInComponent = [];
        const numRoots = roots.length;
        for (let i = 0; i < numRoots; i++) {
            facetsInComponent.push([]);
        }
        for (let facetIndex = 0; facetIndex < numFacets; facetIndex++) {
            const rootOfFacet = context.findRoot(facetIndex);
            for (let rootIndex = 0; rootIndex < numRoots; rootIndex++) {
                if (roots[rootIndex] === rootOfFacet) {
                    facetsInComponent[rootIndex].push(facetIndex);
                    break;
                }
            }
        }
        return facetsInComponent;
    }
    /** Find segments (within the linestring) which project to facets.
     * * Assemble each segment pair as a facet in a new polyface
     * * Facets are ASSUMED to be convex and planar.
     */
    static sweepLinestringToFacetsXYreturnSweptFacets(linestringPoints, polyface) {
        const builder = PolyfaceBuilder_1.PolyfaceBuilder.create();
        this.announceSweepLinestringToConvexPolyfaceXY(linestringPoints, polyface, (_linestring, _segmentIndex, _polyface, _facetIndex, points) => {
            if (points.length === 4)
                builder.addQuadFacet(points);
            else if (points.length === 3)
                builder.addTriangleFacet(points);
        });
        return builder.claimPolyface(true);
    }
    /** Find segments (within the linestring) which project to facets.
     * * Return collected line segments
     */
    static sweepLinestringToFacetsXYReturnLines(linestringPoints, polyface) {
        const drapeGeometry = [];
        this.announceSweepLinestringToConvexPolyfaceXY(linestringPoints, polyface, (_linestring, _segmentIndex, _polyface, _facetIndex, points, indexA, indexB) => {
            drapeGeometry.push(LineSegment3d_1.LineSegment3d.create(points[indexA], points[indexB]));
        });
        return drapeGeometry;
    }
    /** Find segments (within the linestring) which project to facets.
     * * Return chains.
     */
    static sweepLinestringToFacetsXYReturnChains(linestringPoints, polyface) {
        const chainContext = ChainMerge_1.ChainMergeContext.create();
        this.announceSweepLinestringToConvexPolyfaceXY(linestringPoints, polyface, (_linestring, _segmentIndex, _polyface, _facetIndex, points, indexA, indexB) => {
            chainContext.addSegment(points[indexA], points[indexB]);
        });
        chainContext.clusterAndMergeVerticesXYZ();
        return chainContext.collectMaximalChains();
    }
    /** Find segments (within the linestring) which project to facets.
     * * Return chains.
     */
    static collectRangeLengthData(polyface) {
        if (polyface instanceof Polyface_1.Polyface) {
            return this.collectRangeLengthData(polyface.createVisitor(0));
        }
        const rangeData = new RangeLengthData_1.RangeLengthData();
        // polyface is a visitor ...
        for (polyface.reset(); polyface.moveToNextFacet();)
            rangeData.accumulateGrowableXYZArrayRange(polyface.point);
        return rangeData;
    }
    /** Clone the facets, inserting vertices (within edges) where points not part of each facet's vertex indices impinge within edges.
     *
     */
    static cloneWithTVertexFixup(polyface) {
        const oldFacetVisitor = polyface.createVisitor(1); // This is to visit the existing facets.
        const newFacetVisitor = polyface.createVisitor(0); // This is to build the new facets.
        const rangeSearcher = XYPointBuckets_1.XYPointBuckets.create(polyface.data.point, 30);
        const builder = PolyfaceBuilder_1.PolyfaceBuilder.create();
        const edgeRange = Range_1.Range3d.createNull();
        const point0 = Point3dVector3d_1.Point3d.create();
        const point1 = Point3dVector3d_1.Point3d.create();
        const spacePoint = Point3dVector3d_1.Point3d.create();
        const segment = LineSegment3d_1.LineSegment3d.create(point0, point1);
        for (oldFacetVisitor.reset(); oldFacetVisitor.moveToNextFacet();) {
            newFacetVisitor.clearArrays();
            for (let i = 0; i + 1 < oldFacetVisitor.point.length; i++) {
                // each base vertex is part of the result ...
                oldFacetVisitor.point.getPoint3dAtUncheckedPointIndex(i, point0);
                oldFacetVisitor.point.getPoint3dAtUncheckedPointIndex(i + 1, point1);
                newFacetVisitor.pushDataFrom(oldFacetVisitor, i);
                edgeRange.setNull();
                LineSegment3d_1.LineSegment3d.create(point0, point1, segment);
                let detailArray;
                edgeRange.extend(point0);
                edgeRange.extend(point1);
                rangeSearcher.announcePointsInRange(edgeRange, (index, _x, _y, _z) => {
                    // x,y,z has x,y within the range of the search ... test for exact on (in full 3d!)
                    polyface.data.point.getPoint3dAtUncheckedPointIndex(index, spacePoint);
                    const detail = segment.closestPoint(spacePoint, false);
                    if (undefined !== detail) {
                        if (detail.fraction >= 0.0 && detail.fraction < 1.0 && !detail.point.isAlmostEqual(point0) && !detail.point.isAlmostEqual(point1)) {
                            if (detailArray === undefined)
                                detailArray = [];
                            detail.a = index;
                            detailArray.push(detail);
                        }
                    }
                    return true;
                });
                if (detailArray !== undefined) {
                    detailArray.sort((a, b) => (a.fraction - b.fraction));
                    for (const d of detailArray) {
                        newFacetVisitor.pushInterpolatedDataFrom(oldFacetVisitor, i, d.fraction, i + 1);
                    }
                }
            }
            builder.addFacetFromGrowableArrays(newFacetVisitor.point, newFacetVisitor.normal, newFacetVisitor.param, newFacetVisitor.color);
        }
        return builder.claimPolyface();
    }
    /** Clone the facets, inserting removing points that are simply within colinear edges.
     *
     */
    static cloneWithColinearEdgeFixup(polyface) {
        const oldFacetVisitor = polyface.createVisitor(2); // This is to visit the existing facets.
        const newFacetVisitor = polyface.createVisitor(0); // This is to build the new facets.
        const builder = PolyfaceBuilder_1.PolyfaceBuilder.create();
        const vector01 = Point3dVector3d_1.Vector3d.create();
        const vector12 = Point3dVector3d_1.Vector3d.create();
        const numPoint = polyface.data.point.length;
        const pointState = new Int32Array(numPoint);
        // FIRST PASS -- in each sector of each facet, determine if the sector has colinear incoming and outgoing vectors.
        //   Mark each point as
        //  0 unvisited
        // -1 incident to a non-colinear sector
        //  n incident to n colinear sectors
        for (oldFacetVisitor.reset(); oldFacetVisitor.moveToNextFacet();) {
            for (let i = 0; i + 2 < oldFacetVisitor.point.length; i++) {
                // each base vertex is part of the result ...
                oldFacetVisitor.point.vectorIndexIndex(i, i + 1, vector01);
                oldFacetVisitor.point.vectorIndexIndex(i + 1, i + 2, vector12);
                const pointIndex = oldFacetVisitor.clientPointIndex(i + 1);
                if (pointState[pointIndex] >= 0) {
                    const theta = vector01.angleTo(vector12);
                    if (theta.isAlmostZero) {
                        pointState[pointIndex]++;
                    }
                    else {
                        pointState[pointIndex] = -1;
                    }
                }
            }
        }
        // SECOND PASS -- make copies, omitting references to points at colinear sectors
        for (oldFacetVisitor.reset(); oldFacetVisitor.moveToNextFacet();) {
            newFacetVisitor.clearArrays();
            for (let i = 0; i + 2 < oldFacetVisitor.point.length; i++) {
                const pointIndex = oldFacetVisitor.clientPointIndex(i);
                if (pointState[pointIndex] < 0) {
                    newFacetVisitor.pushDataFrom(oldFacetVisitor, i);
                }
            }
            if (newFacetVisitor.point.length > 2)
                builder.addFacetFromGrowableArrays(newFacetVisitor.point, newFacetVisitor.normal, newFacetVisitor.param, newFacetVisitor.color);
        }
        return builder.claimPolyface();
    }
}
exports.PolyfaceQuery = PolyfaceQuery;
//# sourceMappingURL=PolyfaceQuery.js.map