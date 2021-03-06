﻿/// <reference path="Primitives/RangeBase.js"/>
/// CODE

(function (namespace) {
    var ProgressBar = Nullstone.Create("ProgressBar", namespace.Primitives.RangeBase);

    ProgressBar.Instance.Init = function () {
        this.Init$RangeBase();
        this.DefaultStyleKey = this.constructor;
    };

    //#region Properties

    ProgressBar.IsIndeterminatePropertyChanged = function (d, args) {
        if (d instanceof ProgressBar) {
            d._OnIsIndeterminateChanged();
            d._UpdateIndicator();
        }
    };
    ProgressBar.IsIndeterminateProperty = DependencyProperty.RegisterCore("IsIndeterminate", function () { return Boolean; }, ProgressBar, false, ProgressBar.IsIndeterminatePropertyChanged);

    Nullstone.AutoProperties(ProgressBar, [
        ProgressBar.IsIndeterminateProperty
    ]);

    //#endregion

    ProgressBar.Instance.OnApplyTemplate = function () {
        this.OnApplyTemplate$RangeBase();

        var track = this.$Track;
        if (track)
            track.SizeChanged.Unsubscribe(this._OnTrackSizeChanged, this);

        track = this.$Track = this.GetTemplateChild("ProgressBarTrack");
        this.$Indicator = this.GetTemplateChild("ProgressBarIndicator");

        if (track)
            track.SizeChanged.Subscribe(this._OnTrackSizeChanged, this);

        this.$UpdateVisualState(false);
    };

    ProgressBar.Instance.$OnValueChanged = function (oldValue, newValue) {
        this.$OnValueChanged$RangeBase(oldValue, newValue);
        this._UpdateIndicator();
    };
    ProgressBar.Instance._OnTrackSizeChanged = function (sender, e) {
        this._UpdateIndicator();
    };

    ProgressBar.Instance._OnIsIndeterminateChanged = function () {
        this.$UpdateVisualState();
    };
    ProgressBar.Instance._UpdateIndicator = function () {
        var min = this.Minimum;
        var max = this.Maximum;
        var val = this.Value;

        if (this.$Track == null)
            return;
        if (this.$Indicator == null)
            return;

        var parent = Fayde.VisualTreeHelper.GetParent(this);
        if (parent == null)
            return;

        var margin = this.$Indicator.Margin.Left + this.$Indicator.Margin.Right;
        if (parent instanceof namespace.Border || parent instanceof namespace.Control) {
            margin += parent.Padding.Left;
            margin += parent.Padding.Right;
        }

        var progress = this.IsIndeterminate || max === min ? 1.0 : (val - min) / (max - min);
        var fullWidth = Math.max(0, parent.ActualWidth - margin);
        this.$Indicator.Width = fullWidth * progress;
    };

    ProgressBar.Instance.$GetVisualStateNamesToActivate = function () {
        return this.IsIndeterminate ? ["Indeterminate"] : ["Determinate"];
    };

    namespace.ProgressBar = Nullstone.FinishCreate(ProgressBar);
})(Nullstone.Namespace("Fayde.Controls"));