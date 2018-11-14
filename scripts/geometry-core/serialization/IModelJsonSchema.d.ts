/** @module Serialization */
import { AngleProps, AngleSweepProps } from "../Geometry";
import { XYProps, XYZProps } from "../geometry3d/XYZProps";
import { Point3d } from "../geometry3d/Point3dVector3d";
import { YawPitchRollProps } from "../geometry3d/YawPitchRollAngles";
import { CoordinateXYZ } from "../curve/CoordinateXYZ";
import { TransitionSpiral3d } from "../curve/TransitionSpiral";
import { UnionRegion } from "../curve/UnionRegion";
import { BagOfCurves } from "../curve/CurveCollection";
import { ParityRegion } from "../curve/ParityRegion";
import { Loop } from "../curve/Loop";
import { Path } from "../curve/Path";
import { IndexedPolyface, PolyfaceAuxData } from "../polyface/Polyface";
import { BSplineCurve3d } from "../bspline/BSplineCurve";
import { BSplineSurface3d, BSplineSurface3dH } from "../bspline/BSplineSurface";
import { Sphere } from "../solid/Sphere";
import { Cone } from "../solid/Cone";
import { Box } from "../solid/Box";
import { TorusPipe } from "../solid/TorusPipe";
import { LinearSweep } from "../solid/LinearSweep";
import { RotationalSweep } from "../solid/RotationalSweep";
import { RuledSweep } from "../solid/RuledSweep";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { LineString3d } from "../curve/LineString3d";
import { PointString3d } from "../curve/PointString3d";
import { Arc3d } from "../curve/Arc3d";
import { LineSegment3d } from "../curve/LineSegment3d";
import { BSplineCurve3dH } from "../bspline/BSplineCurve3dH";
import { CurveCollection } from "../curve/CurveCollection";
import { BezierCurve3dH } from "../bspline/BezierCurve3dH";
import { BezierCurve3d } from "../bspline/BezierCurve3d";
export declare namespace IModelJson {
    interface GeometryProps extends CurvePrimitiveProps, SolidPrimitiveProps {
        indexedMesh?: IndexedMeshProps;
        point?: XYZProps;
        bsurf?: BSplineSurfaceProps;
    }
    interface CurvePrimitiveProps {
        lineSegment?: [XYZProps, XYZProps];
        lineString?: XYZProps[];
        bcurve?: BcurveProps;
        transitionSpiral?: TransitionSpiralProps;
        arc?: ArcByVectorProps | [XYZProps, XYZProps, XYZProps];
    }
    interface PointProps {
        point?: XYZProps;
    }
    /**
     * Right side (content) properties for {bsurf: BSplineSurfaceProps}
     *
     */
    interface BSplineSurfaceProps {
        orderU: number;
        orderV: number;
        points: [[[number]]];
        uKnots: [number];
        vKnots: [number];
    }
    /**
     * Interface for a collection of curves, eg. as used as a swept contour.
     *
     */
    interface CurveCollectionProps extends PlanarRegionProps {
        /** A sequence of curves joined head to tail: */
        path?: [CurvePrimitiveProps];
        /** A collection of curves with no required structure or connections: */
        bagofCurves?: [CurveCollectionProps];
    }
    /**
     * Interface for a collection of curves that bound a planar region
     *
     */
    interface PlanarRegionProps {
        /** A sequence of curves which connect head to tail, with the final connecting back to the first */
        loop?: [CurvePrimitiveProps];
        /** A collection of loops, with composite inside/outside determined by parity rules.
         * (The single outer boundary with one or more holes is a parityRegion)
         */
        parityRegion?: [{
            loop: [CurvePrimitiveProps];
        }];
        unionRegion?: [PlanarRegionProps];
    }
    /**
     * Interface for solid primitives: box, sphere, cylinder, cone, torusPipe, linear sweep, rotational sweep, ruled sweep.
     */
    interface SolidPrimitiveProps {
        cylinder?: CylinderProps;
        box?: BoxProps;
        sphere?: SphereProps;
        cone?: ConeProps;
        torusPipe?: TorusPipeProps;
        linearSweep?: LinearSweepProps;
        rotationalSweep?: RotationalSweepProps;
        ruledSweep?: RuledSweepProps;
    }
    /**
     * * There are multiple ways to specify an orientation
     * * A "Best" among these is application specific.
     * * An object with AxesProps should only specify one of the variants.
     * * YawPitchRollAngles uses 3 angles.
     * * * Cases where only one of the 3 is nonzero are intuitive
     * * * Cases where more than one is nonzero have difficult interactions and order issues.
     * * xyVectors uses a vector along the x direction and a vector into positive xy plane
     *    along any direction not parallel to x.
     * * * In most cases, users supply a normalized x and the actual normalized y vector.
     * * zxVectors uses a z vector and another vector into the positive zx plane.
     * * * In most cases, users supply a normalized z and the actual normalized x vector.
     */
    interface AxesProps {
        /**
         * See YawPitchAngles class for further information about using 3 rotations to specify orientation.
         */
        yawPitchRollAngles?: YawPitchRollProps;
        /**
         * Cartesian coordinate directions defined by X direction then Y direction.
         * * The right side contains two vectors in an array.
         * * The first vector gives the x axis direction
         * * * This is normalized to unit length.
         * * The second vector gives the positive y direction inthe xy plane.
         * * * This vector is adjusted to be unit length and perpendicular to the x direction.
         */
        xyVectors?: [XYZProps, XYZProps];
        /**
         * Cartesian coordinate directions defined by X direction then Y direction.
         * * The right side contains two vectors in an array.
         * * The first vector gives the z axis direction
         * * * This is normalized to unit length.
         * * The second vector gives the positive x direction inthe zx plane.
         * * * This vector is adjusted to be unit length and perpendicular to the z direction.
         */
        zxVectors?: [XYZProps, XYZProps];
    }
    /**
     * Interface for Arc3d value defined by center, vectorX, vectorY and sweepStartEnd.
     */
    interface ArcByVectorProps {
        center: XYZProps;
        vectorX: XYZProps;
        vectorY: XYZProps;
        sweepStartEnd: AngleSweepProps;
    }
    /**
     * Interface for Cone value defined by centers, radii, and (optional) vectors for circular section planes.
     */
    interface ConeProps extends AxesProps {
        start: XYZProps;
        end: XYZProps;
        /** radius at `start` */
        startRadius: number;
        /** radius at `end` */
        endRadius?: number;
        /**
         * * VectorX and vectorY are optional.
         * * If either one is missing, both vectors are constructed perpendicular to the vector from start to end.
         */
        vectorX?: XYZProps;
        vectorY?: XYZProps;
        /** flag for circular end caps. */
        capped?: boolean;
    }
    /**
     * Interface for cylinder defined by a radius and axis start and end centers.
     */
    interface CylinderProps {
        /** axis point at start */
        start: XYZProps;
        /** axis point at end */
        end: XYZProps;
        radius: number;
        /** flag for circular end caps. */
        capped?: boolean;
    }
    /**
     * Interface for a linear sweep of a base curve or region.
     */
    interface LinearSweepProps {
        /** The swept curve or region.  Any curve collection */
        contour: CurveCollectionProps;
        /** The sweep vector  */
        vector: XYZProps;
        /** flag for circular end caps. */
        capped?: boolean;
    }
    /**
     * Interface for a rotational sweep of a base curve or region around an axis.
     */
    interface RotationalSweepProps {
        /** The swept curve or region.  Any curve collection */
        contour: CurveCollectionProps;
        /** any point on the axis of rotation. */
        center: XYZProps;
        /** The axis of rotation  */
        axis: XYZProps;
        /** sweep angle */
        sweepAngle: AngleProps;
        /** flag for circular end caps. */
        capped?: boolean;
    }
    /**
     * Interface for a surface with ruled sweeps between corresponding curves on successvie contours
     */
    interface RuledSweepProps {
        /** The swept curve or region.  An array of curve collections.  */
        contour: [CurveCollectionProps];
        /** flag for circular end caps. */
        capped?: boolean;
    }
    /**
     * Interface for spiral
     * * Any 4 (but not 5) of the 5 values `[startBearing, endBearing, startRadius, endRadius, length]`
     *       may be defined.
     * * In radius data, zero radius indicates straight line (infinite radius)
     * * Note that the inherited AxesProps allows multiple ways to specify orientation of the placement..
     */
    interface TransitionSpiralProps extends AxesProps {
        /** origin of the coordinate system. */
        origin: XYZProps;
        /** angle at departure from origin. */
        startBearing?: AngleProps;
        endBearing?: AngleProps;
        startRadius?: number;
        endRadius?: number;
        curveLength?: number;
        fractionInterval?: number[];
        /** TransitionSpiral type.   Default is `"clothoid"` */
        type?: string;
        /** A fractional portion of the spiral may be selected.
         * * If this is missing, fraction range is `[0,1]`
         */
        intervalFractions?: [number, number];
    }
    /**
     * Interface for bspline curve (aka bcurve)
     */
    interface BcurveProps {
        /** control points */
        point: [XYZProps];
        /** knots. */
        knot: [number];
        /** order of polynomial
         * * The order is the number of basis functions that are in effect at any knot value.
         * * The order is the number of points that affect the curve at any knot value,
         *     i.e. the size of the "local support" set
         * * `order=2` is lines (degree 1)
         * * `order=3` is quadratic (degree 2)
         * * `order=4` is cubic (degree 3)
         * * The number of knots follows the convention "poles+order= knots".
         * * In this convention (for example), a clamped cubic with knots `[0,0,0,0, 1,2,3,4,4,4,4]`
         * has:
         * * * 4 (`order`) copies of the start and end knot (0 and 4) and
         * * * 3 interior knots
         * * Hence expect 7 poles.
         */
        order: number;
    }
    /**
     * Interface for Box (or frustum with all rectangular sections parallel to primary xy section)
     * * Orientation may be given in any `AxesProp`s way (yawPitchRoll, xyVectors, zxVectors)
     * * if topX or topY are omitted, each defaults to its baseX or baseY peer.
     * * `topOrigin` is determined with this priority order:
     * * * `topOrigin` overrides given `height`
     * * * on the z axis at distance `height`
     * * * If both `topOrigin` and `height` are omitted, `height` defaults to `baseX`
     */
    interface BoxProps extends AxesProps {
        /** Origin of the box coordinate system  (required) */
        origin: XYZProps;
        /** base x size (required) */
        baseX: number;
        /** base size
         * * if omitted, defaults to baseX.
         */
        baseY: number;
        /** top origin.
         * * This is NOT required to be on the z axis.
         * * If omitted, a `heigh` must be present to given topOrigin on z axis.
         */
        topOrigin?: XYZProps;
        /** optional height.  This is only used if `topOrigin` is omitted. */
        height?: number;
        /** x size on top section.
         * * If omitted, `baseX` is used
         */
        topX?: number;
        /** y size on top section.
         * * If omitted, `baseY` is used
         */
        topY?: number;
        /** optional capping flag. */
        capped?: boolean;
    }
    /**
     * Interface for Sphere (with optionally different radius to pole versus equator)
     * * Orientation may be given in any `AxesProp`s way (yawPitchRoll, xyVectors, zxVectors)
     */
    interface SphereProps extends AxesProps {
        /** Center of the sphere coordinate system */
        center: XYZProps;
        /** primary radius */
        radius?: number;
        /** optional x radius */
        radiusX?: number;
        /** optional y radius */
        radiusY?: number;
        /** optonal radius at poles.  */
        radiusZ?: number;
        /** optional sweep range for latitude.  Default latitude limits are [-90,90 ] degrees. */
        latitudeStartEnd?: AngleSweepProps;
        /** optional capping flag. If missing, implied false */
        capped?: boolean;
    }
    /**
     * Interface for TorusPipe data
     * * Orientation may be given in any `AxesProp`s way (yawPitchRoll, xyVectors, zxVectors)
     * * Both radii are required.
     * * axes are required
     * * Axis definintion is
     * * xy plane contains the major circle
     * * x axis points from donut hole center to flow center at start of pipe.
     * * z axis points through the hole.
     */
    interface TorusPipeProps extends AxesProps {
        /** Center of the full torus coordinate system. (donut hole center) */
        center: XYZProps;
        /** primary radius  (elbow radius) */
        majorRadius: number;
        /** pipe radius */
        minorRadius?: number;
        /** sweep angle.
         * * if omitted, full 360 degree sweep.
         */
        sweepAngle?: AngleProps;
        /** optional capping flag. If missing, implied false */
        capped?: boolean;
    }
    /**
     * Interface for a ruleds sweep.
     *
     */
    interface RuledSweepProps {
        countour: [CurveCollectionProps];
        /** optional capping flag. */
        capped?: boolean;
    }
    /**
     * Interface for an indexed mesh.
     * * IMPORTANT: All indices are one-based.
     * * i.e. vertex index given as 11 appears at index 10 in the data array.
     * * This is to allow a negated index to mean "don't draw the followinge edge"
     * * Although negative indices are not allowed for normalIndex, colorIndex, or paramIndex, the "one based" style
     *     is used for them so that all indices within the indexedMesh json object are handled similarly.
     * * In all index arrays, a ZERO indicates "end of facet".
     * *
     */
    interface IndexedMeshProps {
        /** vertex coordinates */
        point: [XYZProps];
        /** surface normals */
        normal?: [XYZProps];
        /** texture space (uv parameter) coordinates */
        param?: [XYProps];
        /** 32 bit color values */
        color?: [number];
        /** SIGNED ONE BASED ZERO TERMINATED array of point indices. */
        pointIndex: [number];
        /** ONE BASED ZERO TERMINATED array of param indices.  ZERO is terminator for single facet. */
        paramIndex?: [number];
        /** ONE BASED ZERO TERMINATED array of normal indices. ZERO is terminator for single facet. */
        normalIndex?: [number];
        /** ONE BASED ZERO TERMINATED array of color indices. ZERO is terminator for single facet. */
        colorIndex?: [number];
    }
    /** parser servoces for "iModelJson" schema
     * * 1: create a reader with `new ImodelJsonReader`
     * * 2: parse json fragment to strongly typed geometry: `const g = reader.parse (fragment)`
     */
    class Reader {
        constructor();
        private static parseVector3dProperty;
        private static parsePoint3dProperty;
        private static parseSegment1dProperty;
        private static parseNumberProperty;
        private static parseAngleProperty;
        /**
         * @param defaultFunction function to call if needed to produce a default value
         */
        private static parseAngleSweepProps;
        private static parseBooleanProperty;
        private static loadContourArray;
        private static parseYawPitchRollAngles;
        private static parseStringProperty;
        private static parseAxesFromVectors;
        /**
         * Look for orientation data and convert to Matrix3d.
         * * Search order is:
         * * * yawPitchRollAngles
         * * * xyVectors
         * * * zxVectors
         * @param json [in] json source data
         * @param createDefaultIdentity [in] If true and no orientation is present, return an identity matrix.  If false and no orientation is present, return undefined.
         */
        private static parseOrientation;
        private static parseArcByVectorProps;
        private static parseArcBy3Points;
        private static parseArcObject;
        static parseCoordinate(data?: any): CoordinateXYZ | undefined;
        static parseTransitionSpiral(data?: any): TransitionSpiral3d | undefined;
        static parseBcurve(data?: any): BSplineCurve3d | BSplineCurve3dH | undefined;
        static parseArray(data?: any): any[] | undefined;
        private static addZeroBasedIndicesFromSignedOneBased;
        static parsePolyfaceAuxData(data?: any): PolyfaceAuxData | undefined;
        static parseIndexedMesh(data?: any): any | undefined;
        static parseCurveCollectionMembers(result: CurveCollection, data?: any): CurveCollection | undefined;
        static parseBsurf(data?: any): BSplineSurface3d | BSplineSurface3dH | undefined;
        /**
         * Create a cone with data from a `ConeByCCRRV`.
         */
        static parseConeProps(json?: ConeProps): any;
        /**
         * Create a cylinder.
         */
        static parseCylinderProps(json?: CylinderProps): any;
        private static parseLineSegmentProps;
        static parseLinearSweep(json?: any): any;
        static parseRotationalSweep(json?: any): any;
        static parseBox(json?: any): any;
        static parseSphere(json?: SphereProps): any;
        static parseRuledSweep(json?: any): any;
        static parseTorusPipe(json?: any): any;
        static parsePointArray(json?: any): Point3d[];
        static parse(json?: any): any;
    }
    class Writer extends GeometryHandler {
        handleLineSegment3d(data: LineSegment3d): any;
        handleCoordinateXYZ(data: CoordinateXYZ): any;
        handleArc3d(data: Arc3d): any;
        /**
         * Insert orientation description to a data object.
         * @param matrix matrix with orientation
         * @param omitIfIdentity omit the axis data if the matrix is an identity.
         * @param data AxesProps object to be annotated.
         */
        private static insertOrientationFromMatrix;
        private static isIdentityXY;
        /**
         * Insert orientation description to a data object.
         * @param matrix matrix with orientation
         * @param omitIfIdentity omit the axis data if the matrix is an identity.
         * @param data AxesProps object to be annotated.
         */
        private static insertOrientationFromXYVectors;
        /**
         * Insert orientation description to a data object, with orientation defined by u and v direction
         * vectors.
         * @param vectorX u direction
         * @param vectorV v direction
         * @param omitIfIdentity omit the axis data if the vectorU and vectorV are global x and y vectors.
         * @param data AxesProps object to be annotated.
         */
        private static insertXYOrientation;
        handleTransitionSpiral(data: TransitionSpiral3d): any;
        handleCone(data: Cone): any;
        handleSphere(data: Sphere): any;
        handleTorusPipe(data: TorusPipe): any;
        handleLineString3d(data: LineString3d): any;
        handlePointString3d(data: PointString3d): any;
        handlePath(data: Path): any;
        handleLoop(data: Loop): any;
        handleParityRegion(data: ParityRegion): any;
        handleUnionRegion(data: UnionRegion): any;
        handleBagOfCurves(data: BagOfCurves): any;
        private collectChildren;
        handleLinearSweep(data: LinearSweep): any;
        handleRuledSweep(data: RuledSweep): any;
        handleRotationalSweep(data: RotationalSweep): any;
        handleBox(box: Box): any;
        private handlePolyfaceAuxData;
        handleIndexedPolyface(pf: IndexedPolyface): any;
        handleBSplineCurve3d(curve: BSplineCurve3d): any;
        handleBezierCurve3d(curve: BezierCurve3d): any;
        handleBSplineCurve3dH(curve: BSplineCurve3dH): any;
        handleBSplineSurface3d(surface: BSplineSurface3d): any;
        handleBezierCurve3dH(curve: BezierCurve3dH): any;
        handleBSplineSurface3dH(surface: BSplineSurface3dH): any;
        emitArray(data: object[]): any;
        emit(data: any): any;
        /** One-step static method to create a writer and emit a json object */
        static toIModelJson(data: any): any;
    }
}
//# sourceMappingURL=IModelJsonSchema.d.ts.map