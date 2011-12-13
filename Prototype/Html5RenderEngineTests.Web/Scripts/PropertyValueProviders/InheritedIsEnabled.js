﻿/// <reference path="PropertyValueProvider.js" />
/// <reference path="/Scripts/Control.js" />
/// <reference path="/Scripts/Error.js" />

function _InheritedIsEnabledPropertyValueProvider(obj, propPrecedence) {
    _PropertyValueProvider.apply(this, obj, propPrecedence, _ProviderFlags.RecomputesOnLowerPriorityChange);
    this._Source = null;
    this._CurrentValue = this._Object.GetValue(Control.IsEnabledProperty, _PropertyPrecedence.LocalValue);
    this.GetPropertyValue = function (propd) {
        if (propd == Control.IsEnabledProperty)
            return this._CurrentValue;
        return null;
    };
    this.SetDataSource = function (source) {
        if (source) {
            while (source) {
                if (source instanceof Control)
                    break;
                else if (source instanceof FrameworkElement)
                    source = source.GetLogicalParent();
                else
                    source = null;
            }
        }

        if (this._Source != source) {
            this._Source.RemovePropertyChangeListener(Control.IsEnabledProperty);
            this._Source = source;
            this._Source.AddPropertyChangeListener(Control.IsEnabledProperty, this.LocalValueChanged);
        }

        if (!source || this._Object.IsAttached())
            this.LocalValueChanged(null);
    };
    this.LocalValueChanged = function (propd) {
        if (propd && propd != Control.IsEnabledProperty)
            return false;

        var localEnabled = this._Object.GetValue(Control.IsEnabledProperty, _PropertyPrecedence.LocalValue);
        var parentEnabled = this._Source && this._Object.GetVisualParent() ? this._Source.GetValue(Control.IsEnabledProperty) : null;
        var newValue = localEnabled == true && (parentEnabled == null || parentEnabled == true);
        if (newValue != this._CurrentValue) {
            var oldValue = this._CurrentValue;
            this._CurrentValue = newValue;

            var error = new BError();
            this._Object.ProviderValueChanged(this._PropertyPrecedence, Control.IsEnabledProperty, oldValue, newValue, true, false, false, error);
            return true;
        }
        return false;
    };
}
_InheritedIsEnabledPropertyValueProvider.prototype = new _PropertyValueProvider();