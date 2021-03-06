/// <reference path="../../Runtime/Nullstone.js" />
/// <reference path="PropertyValueProvider.js"/>
/// <reference path="Enums.js"/>
/// CODE

(function (Fayde) {
    var _InheritedIsEnabledPropertyValueProvider = Nullstone.Create("_InheritedIsEnabledPropertyValueProvider", Fayde._PropertyValueProvider, 1);

    _InheritedIsEnabledPropertyValueProvider.Instance.Init = function (obj) {
        this.Init$_PropertyValueProvider(obj, _PropertyPrecedence.IsEnabled);
        this._Source = null;
        this._CurrentValue = this._Object._GetValue(Fayde.Controls.Control.IsEnabledProperty, _PropertyPrecedence.LocalValue);
    };

    _InheritedIsEnabledPropertyValueProvider.Instance.GetPropertyValue = function (propd) {
        if (propd._ID === Fayde.Controls.Control.IsEnabledProperty._ID)
            return this._CurrentValue;
        return undefined;
    };
    _InheritedIsEnabledPropertyValueProvider.Instance.SetDataSource = function (source) {
        if (source) {
            while (source) {
                if (source instanceof Fayde.Controls.Control)
                    break;
                else if (source instanceof Fayde.FrameworkElement)
                    source = source._GetLogicalParent();
                else
                    source = null;
            }
        }

        if (!Nullstone.RefEquals(this._Source, source)) {
            this._DetachListener(this._Source);
            this._Source = source;
            this._AttachListener(this._Source);
        }

        if (!source || this._Object._IsAttached)
            this.LocalValueChanged();
    };
    _InheritedIsEnabledPropertyValueProvider.Instance._AttachListener = function (source) {
        if (source) {
            var matchFunc = function (sender, args) {
                return this === args.Property; //Closure - Control.IsEnabledProperty
            };
            source.PropertyChanged.SubscribeSpecific(this._IsEnabledChanged, this, matchFunc, Fayde.Controls.Control.IsEnabledProperty);
            //TODO: Add Handler - Destroyed Event
        }
    };
    _InheritedIsEnabledPropertyValueProvider.Instance._DetachListener = function (source) {
        if (source) {
            source.PropertyChanged.Unsubscribe(this._IsEnabledChanged, this, Fayde.Controls.Control.IsEnabledProperty);
            //TODO: Remove Handler - Destroyed Event
        }
    };
    _InheritedIsEnabledPropertyValueProvider.Instance._IsEnabledChanged = function (sender, args) {
        this.LocalValueChanged(args.Property);
    };
    _InheritedIsEnabledPropertyValueProvider.Instance.LocalValueChanged = function (propd) {
        if (propd && propd._ID !== Fayde.Controls.Control.IsEnabledProperty._ID)
            return false;

        var localEnabled = this._Object._GetValue(Fayde.Controls.Control.IsEnabledProperty, _PropertyPrecedence.LocalValue);
        var parentEnabled = this._Source && this._Object.GetVisualParent() ? this._Source._GetValue(Fayde.Controls.Control.IsEnabledProperty) : undefined;
        var newValue = localEnabled === true && (!parentEnabled || parentEnabled === true);
        if (newValue !== this._CurrentValue) {
            var oldValue = this._CurrentValue;
            this._CurrentValue = newValue;

            var error = new BError();
            this._Object._ProviderValueChanged(this._PropertyPrecedence, Fayde.Controls.Control.IsEnabledProperty, oldValue, newValue, true, false, false, error);
            return true;
        }
        return false;
    };

    Fayde._InheritedIsEnabledPropertyValueProvider = Nullstone.FinishCreate(_InheritedIsEnabledPropertyValueProvider);
})(Nullstone.Namespace("Fayde"));