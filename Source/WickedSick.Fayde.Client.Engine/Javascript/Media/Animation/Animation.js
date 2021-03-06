﻿/// <reference path="Timeline.js"/>
/// CODE
/// <reference path="AnimationStorage.js"/>

(function (namespace) {
    var Animation = Nullstone.Create("Animation", namespace.Timeline);

    Animation.Instance.Resolve = function () { return true; };

    Animation.Instance.HookupStorage = function (targetObj, targetProp) {
        /// <param name="targetObj" type="DependencyObject"></param>
        /// <param name="targetProp" type="DependencyProperty"></param>
        /// <returns type="AnimationStorage" />
        this._Storage = new namespace.AnimationStorage(this, targetObj, targetProp);
        return this._Storage;
    };
    Animation.Instance.Disable = function () {
        if (this._Storage != null)
            this._Storage.Disable();
    };
    Animation.Instance.Stop = function () {
        if (this._Storage == null)
            return;
        this._Storage.Stop();
    };

    Animation.Instance.UpdateInternal = function (clockData) {
        if (this._Storage != null)
            this._Storage.UpdateCurrentValueAndApply(clockData);
    };

    Animation.Instance.GetNaturalDurationCore = function () {
        return Duration.CreateTimeSpan(new TimeSpan(0, 0, 1));
    };

    Animation.Instance.GetTargetValue = function (defaultOriginValue) { };
    Animation.Instance.GetCurrentValue = function (defaultOriginValue, defaultDestinationValue, clockData) { };

    namespace.Animation = Nullstone.FinishCreate(Animation);
})(Nullstone.Namespace("Fayde.Media.Animation"));
