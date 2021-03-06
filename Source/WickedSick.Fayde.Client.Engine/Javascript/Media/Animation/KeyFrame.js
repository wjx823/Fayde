﻿/// <reference path="../../Core/DependencyObject.js"/>
/// CODE

(function (namespace) {
    var KeyFrame = Nullstone.Create("KeyFrame", Fayde.DependencyObject);

    KeyFrame.Instance.Init = function () {
        this.Init$DependencyObject();
        this._ResolvedKeyTime = null;
        this._Resolved = false;
    };

    Nullstone.AbstractProperty(KeyFrame, "KeyTime");

    KeyFrame.Instance.CoerceKeyTime = function (dobj, propd, value, coerced, error) {
        if (value == null)
            coerced.Value = this.KeyTime;
        else
            coerced.Value = value;
        return true;
    };
    KeyFrame.Instance.InterpolateValue = function (baseValue, keyFrameProgress) {
        throw new AbstractMethodException();
    };

    KeyFrame.Comparer = function (kf1, kf2) {
        /// <param name="kf1" type="KeyFrame"></param>
        /// <param name="kf2" type="KeyFrame"></param>
        var ts1 = kf1._ResolvedKeyTime;
        var ts2 = kf2._ResolvedKeyTime;
        return ts1.CompareTo(ts2);
    };

    namespace.KeyFrame = Nullstone.FinishCreate(KeyFrame);
})(Nullstone.Namespace("Fayde.Media.Animation"));
