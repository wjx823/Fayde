/// <reference path="../../Core/PropertyValueProviders/Enums.js"/>
/// <reference path="../../Core/PropertyValueProviders/FrameworkElementPropertyValueProvider.js"/>
/// CODE

(function (namespace) {
    var _TextBoxBaseDynamicPropertyValueProvider = Nullstone.Create("_TextBoxBaseDynamicPropertyValueProvider", Fayde.FrameworkElementPropertyValueProvider, 5);

    _TextBoxBaseDynamicPropertyValueProvider.Instance.Init = function (obj, propPrecedence, foregroundPropd, backgroundPropd, baselineOffsetPropd) {
        this.Init$FrameworkElementPropertyValueProvider(obj, propPrecedence);

        this._ForegroundPropd = foregroundPropd;
        this._BackgroundPropd = backgroundPropd;
        this._BaselineOffsetPropd = baselineOffsetPropd;
        this._SelectionBackground = undefined;
        this._SelectionForeground = undefined;
        this._BaselineOffset = undefined;
    };

    _TextBoxBaseDynamicPropertyValueProvider.Instance.RecomputePropertyValueOnClear = function (propd, error) {
        if (propd._ID === this._BackgroundPropd._ID)
            this._SelectionBackground = undefined;
        else if (propd._ID === this._ForegroundPropd._ID)
            this._SelectionForeground = undefined;
    };
    _TextBoxBaseDynamicPropertyValueProvider.Instance.RecomputePropertyValueOnLower = function (propd, error) {
        if (propd._ID === this._BackgroundPropd._ID)
            this._SelectionBackground = undefined;
        else if (propd._ID === this._ForegroundPropd._ID)
            this._SelectionForeground = undefined;
    };
    _TextBoxBaseDynamicPropertyValueProvider.Instance.GetPropertyValue = function (propd) {
        var v;
        if (propd._ID === this._BackgroundPropd._ID) {
            v = this._Object._GetValue(propd, this._PropertyPrecedence + 1);
            if (!v)
                v = this._SelectionBackground;
        } else if (propd._ID === this._ForegroundPropd._ID) {
            v = this._Object._GetValue(propd, this._PropertyPrecedence + 1);
            if (!v)
                v = this._SelectionForeground;
        } else if (propd._ID === this._BaselineOffsetPropd._ID) {
            var tbv = this._Object._View;
            this._BaselineOffset = (tbv == null) ? 0 : tbv.GetBaselineOffset();
            v = this._BaselineOffset;
        }
        if (v != undefined)
            return v;
        return this.GetPropertyValue$FrameworkElementPropertyValueProvider(propd);
    };

    _TextBoxBaseDynamicPropertyValueProvider.Instance._InitializeSelectionBrushes = function () {
        if (!this._SelectionBackground)
            this._SelectionBackground = new Fayde.Media.SolidColorBrush(Color.FromHex("#FF444444"));
        if (!this._SelectionForeground)
            this._SelectionForeground = new Fayde.Media.SolidColorBrush(Color.FromHex("#FFFFFFFF"));
    };

    namespace._TextBoxBaseDynamicPropertyValueProvider = Nullstone.FinishCreate(_TextBoxBaseDynamicPropertyValueProvider);
})(Nullstone.Namespace("Fayde.Controls"));