﻿/// <reference path="GeneralTransform.js"/>
/// CODE
/// <reference path="MatrixTransform.js"/>

(function (namespace) {
    var Transform = Nullstone.Create("Transform", namespace.GeneralTransform);

    Transform.Instance.Init = function () {
        this.Init$GeneralTransform();
        this.ValueChanged = new MulticastEvent();
    };

    //#region Properties

    Nullstone.Property(Transform, "Value", {
        get: function () {
            if (!this._Value) {
                var val = new Matrix();
                val.raw = this._BuildValue();
                this._Value = val;
            }
            return this._Value;
        }
    });
    Nullstone.Property(Transform, "Inverse", {
        get: function () {
            var inverse = this.Value.Inverse;
            if (inverse == null)
                return;

            var mt = new namespace.MatrixTransform();
            mt.Matrix = inverse;
            return mt;
        }
    });

    //#endregion

    Transform.Instance.Transform = function (point) {
        var v = mat3.transformVec2(this.Value.raw, vec2.createFrom(point.X, point.Y));
        return new Point(v[0], v[1]);
    };
    Transform.Instance.TransformBounds = function (irect) {
        /// <param name="irect" type="rect"></param>
        /// <returns type="rect" />
        if (!irect)
            return;
        var rv = rect.clone(irect);
        rect.transform(rv, this.Value.raw);
        return rv;
    };

    Transform.Instance._BuildValue = function () {
        AbstractMethod("Transform.BuildValue");
    };
    Transform.Instance._ClearValue = function () {
        delete this._Value;
        this.ValueChanged.Raise(this, new EventArgs());
    };

    namespace.Transform = Nullstone.FinishCreate(Transform);
})(Nullstone.Namespace("Fayde.Media"));