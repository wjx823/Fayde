/// <reference path="../../Runtime/Nullstone.js" />
/// <reference path="Animation.js"/>
/// CODE
/// <reference path="../../Primitives/Color.js"/>
/// <reference path="IEasingFunction.js"/>

(function (namespace) {
    var ColorAnimation = Nullstone.Create("ColorAnimation", namespace.Animation);

    //#region Properties

    ColorAnimation.ByProperty = DependencyProperty.Register("By", function () { return Color; }, ColorAnimation);
    ColorAnimation.EasingFunctionProperty = DependencyProperty.Register("EasingFunction", function () { return namespace.IEasingFunction; }, ColorAnimation);
    ColorAnimation.FromProperty = DependencyProperty.Register("From", function () { return Color; }, ColorAnimation);
    ColorAnimation.ToProperty = DependencyProperty.Register("To", function () { return Color; }, ColorAnimation);

    Nullstone.AutoProperties(ColorAnimation, [
        ColorAnimation.ByProperty,
        ColorAnimation.EasingFunctionProperty,
        ColorAnimation.FromProperty,
        ColorAnimation.ToProperty
    ]);

    //#endregion

    ColorAnimation.Instance.GetTargetValue = function (defaultOriginValue) {
        this._EnsureCache();

        var start = new Color();
        if (this._FromCached != null)
            start = this._FromCached;
        else if (defaultOriginValue != null && defaultOriginValue instanceof Color)
            start = defaultOriginValue;

        if (this._ToCached != null)
            return this._ToCached;
        else if (this._ByCached != null)
            return start.Add(this._ByCached);
        return start;
    };
    ColorAnimation.Instance.GetCurrentValue = function (defaultOriginValue, defaultDestinationValue, clockData) {
        this._EnsureCache();

        var start = new Color();
        if (this._FromCached != null)
            start = this._FromCached;
        else if (defaultOriginValue != null && defaultOriginValue instanceof Color)
            start = defaultOriginValue;

        var end = start;
        if (this._ToCached != null)
            end = this._ToCached;
        else if (this._ByCached != null)
            end = start.Add(this._ByCached);
        else if (defaultDestinationValue != null && defaultDestinationValue instanceof Color)
            end = defaultDestinationValue;

        var easingFunc = this.EasingFunction;
        if (easingFunc != null)
            clockData.Progress = easingFunc.Ease(clockData.Progress);

        return Color.LERP(start, end, clockData.Progress);
    };
    ColorAnimation.Instance._EnsureCache = function () {
        if (this._HasCached)
            return;
        this._FromCached = this.From;
        this._ToCached = this.To;
        this._ByCached = this.By;
        this._HasCached = true;
    };

    namespace.ColorAnimation = Nullstone.FinishCreate(ColorAnimation);
})(Nullstone.Namespace("Fayde.Media.Animation"));
