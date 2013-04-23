/// <reference path="Geometry.ts" />
/// CODE
/// <reference path="../Primitives/Point.ts" />
/// <reference path="../Shapes/Enums.ts" />

module Fayde.Media {
    export class LineGeometry extends Geometry {
        static StartPointProperty: DependencyProperty = DependencyProperty.Register("StartPoint", () => Point, LineGeometry, undefined, (d, args) => (<Geometry>d)._InvalidateGeometry());
        static EndPointProperty: DependencyProperty = DependencyProperty.Register("EndPoint", () => Point, LineGeometry, undefined, (d, args) => (<Geometry>d)._InvalidateGeometry());
        StartPoint: Point;
        EndPoint: Point;

        private _Build(): Shapes.RawPath {
            var p1 = this.StartPoint;
            var p2 = this.EndPoint;

            var p = new Shapes.RawPath();
            p.Move(p1.X, p1.Y);
            p.Line(p2.X, p2.Y);
            return p;
        }
    }
    Nullstone.RegisterType(LineGeometry, "LineGeometry");
}