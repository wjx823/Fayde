﻿/// <reference path="Geometry.js"/>
/// CODE
/// <reference path="PathFigureCollection.js"/>
/// <reference path="../Shapes/RawPath.js"/>

(function (namespace) {
    var PathGeometry = Nullstone.Create("PathGeometry", namespace.Geometry);

    //#region Properties

    PathGeometry.FillRuleProperty = DependencyProperty.RegisterCore("FillRule", function () { return new Enum(Fayde.Shapes.FillRule); }, PathGeometry);
    PathGeometry.FiguresProperty = DependencyProperty.RegisterFull("Figures", function () { return namespace.PathFigureCollection; }, PathGeometry, undefined, undefined, { GetValue: function () { return new namespace.PathFigureCollection(); } });

    Nullstone.AutoProperties(PathGeometry, [
        PathGeometry.FillRuleProperty,
        PathGeometry.FiguresProperty
    ]);

    //#endregion

    //#region Annotations

    PathGeometry.Annotations = {
        ContentProperty: PathGeometry.FiguresProperty
    };

    //#endregion

    PathGeometry.prototype._OnCollectionChanged = function (col, args) {
        if (!this._PropertyHasValueNoAutoCreate(PathGeometry.FiguresProperty, col)) {
            this._OnCollectionChanged$Geometry(col, args);
            return;
        }
        this._InvalidateCache();
        this.PropertyChanged.Raise(this, {
            Property: PathGeometry.FiguresProperty,
            OldValue: null,
            NewValue: this.Figures
        });
    };
    PathGeometry.prototype._OnCollectionItemChanged = function (col, obj, args) {
        if (!this._PropertyHasValueNoAutoCreate(PathGeometry.FiguresProperty, col)) {
            this._OnCollectionItemChanged$Geometry(col, obj, args);
            return;
        }
        this._InvalidateCache();
        this.PropertyChanged.Raise(this, {
            Property: PathGeometry.FiguresProperty,
            OldValue: null,
            NewValue: this.Figures
        });
    };

    PathGeometry.Instance._Build = function () {
        this.$Path = new Fayde.Shapes.RawPath();
        var figures = this.Figures;
        if (figures == null)
            return;

        var count = figures.GetCount();
        for (var i = 0; i < count; i++) {
            var f = figures.GetValueAt(i);
            f._EnsureBuilt();
            Fayde.Shapes.RawPath.Merge(this.$Path, f.$Path);
        }
    };

    PathGeometry.Instance.Serialize = function () {
        var path = this.$Path;
        if (!path)
            return;
        return path.Serialize();
    };

    namespace.PathGeometry = Nullstone.FinishCreate(PathGeometry);
})(Nullstone.Namespace("Fayde.Media"));
