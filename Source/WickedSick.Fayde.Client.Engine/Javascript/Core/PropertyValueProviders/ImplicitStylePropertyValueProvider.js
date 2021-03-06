/// <reference path="../../Runtime/Nullstone.js" />
/// <reference path="PropertyValueProvider.js"/>
/// <reference path="Enums.js"/>
/// CODE

(function (Fayde) {
    var _ImplicitStylePropertyValueProvider = Nullstone.Create("_ImplicitStylePropertyValueProvider", Fayde._PropertyValueProvider, 1);

    _ImplicitStylePropertyValueProvider.Instance.Init = function (obj) {
        this.Init$_PropertyValueProvider(obj, _PropertyPrecedence.ImplicitStyle);
        this._Styles = null;
        this._StyleMask = _StyleMask.None;
        this._ht = [];

        this._RecomputesOnClear = true;
    }

    _ImplicitStylePropertyValueProvider.Instance.GetPropertyValue = function (propd) {
        return this._ht[propd._ID];
    };
    _ImplicitStylePropertyValueProvider.Instance.RecomputePropertyValue = function (propd, lower, higher, clear, error) {
        if (!clear)
            return;

        if (!this._Styles)
            return;

        var oldValue;
        var newValue;
        var prop;

        var walker = new Fayde._DeepStyleWalker(this._Styles);
        var setter;
        while (setter = walker.Step()) {
            prop = setter.Property;
            if (prop._ID !== propd._ID)
                continue;

            newValue = setter.ConvertedValue;
            oldValue = this._ht[propd._ID];
            this._ht[propd._ID] = newValue;
            this._Object._ProviderValueChanged(this._PropertyPrecedence, propd, oldValue, newValue, true, true, true, error);
            if (error.Message)
                return;
        }
    };
    _ImplicitStylePropertyValueProvider.Instance._ApplyStyles = function (styleMask, styles, error) {
        var isChanged = !this._Styles || styleMask != this._StyleMask;
        if (!isChanged) {
            for (var i = 0; i < _StyleIndex.Count; i++) {
                if (styles[i] !== this._Styles[i]) {
                    isChanged = true;
                    break;
                }
            }
        }
        if (!isChanged)
            return;

        var oldValue;
        var newValue;

        var oldWalker = new Fayde._DeepStyleWalker(this._Styles);
        var newWalker = new Fayde._DeepStyleWalker(styles);

        var oldSetter = oldWalker.Step();
        var newSetter = newWalker.Step();

        while (oldSetter || newSetter) {
            var oldProp;
            var newProp;
            if (oldSetter)
                oldProp = oldSetter.Property;
            if (newSetter)
                newProp = newSetter.Property;

            if (oldProp && (oldProp < newProp || !newProp)) { //WTF: Less than?
                //Property in old style, not in new style
                oldValue = oldSetter.ConvertedValue;
                newValue = undefined;
                delete this._ht[oldProp._ID];
                this._Object._ProviderValueChanged(this._PropertyPrecedence, oldProp, oldValue, newValue, true, true, false, error);
                oldSetter = oldWalker.Step();
            }
            else if (oldProp == newProp) {
                //Property in both styles
                oldValue = oldSetter.ConvertedValue;
                newValue = newSetter.ConvertedValue;
                this._ht[oldProp._ID] = newValue;
                this._Object._ProviderValueChanged(this._PropertyPrecedence, oldProp, oldValue, newValue, true, true, false, error);
                oldSetter = oldWalker.Step();
                newSetter = newWalker.Step();
            } else {
                //Property in new style, not in old style
                oldValue = undefined;
                newValue = newSetter.ConvertedValue;
                this._ht[newProp._ID] = newValue;
                this._Object._ProviderValueChanged(this._PropertyPrecedence, newProp, oldValue, newValue, true, true, false, error);
                newSetter = newWalker.Step();
            }
        }

        this._Styles = styles;
        this._StyleMask = styleMask;
    };
    _ImplicitStylePropertyValueProvider.Instance.SetStyles = function (styleMask, styles, error) {
        if (!styles)
            return;

        var newStyles = [];
        if (this._Styles) {
            newStyles[_StyleIndex.GenericXaml] = this._Styles[_StyleIndex.GenericXaml];
            newStyles[_StyleIndex.ApplicationResources] = this._Styles[_StyleIndex.ApplicationResources];
            newStyles[_StyleIndex.VisualTree] = this._Styles[_StyleIndex.VisualTree];
        }
        if (styleMask & _StyleMask.GenericXaml)
            newStyles[_StyleIndex.GenericXaml] = styles[_StyleIndex.GenericXaml];
        if (styleMask & _StyleMask.ApplicationResources)
            newStyles[_StyleIndex.ApplicationResources] = styles[_StyleIndex.ApplicationResources];
        if (styleMask & _StyleMask.VisualTree)
            newStyles[_StyleIndex.VisualTree] = styles[_StyleIndex.VisualTree];

        this._ApplyStyles(this._StyleMask | styleMask, newStyles, error);
    };
    _ImplicitStylePropertyValueProvider.Instance.ClearStyles = function (styleMask, error) {
        if (!this._Styles)
            return;

        var newStyles = this._Styles.slice(0);
        //TODO: Do we need a deep copy?
        if (styleMask & _StyleMask.GenericXaml)
            newStyles[_StyleIndex.GenericXaml] = null;
        if (styleMask & _StyleMask.ApplicationResources)
            newStyles[_StyleIndex.ApplicationResources] = null;
        if (styleMask & _StyleMask.VisualTree)
            newStyles[_StyleIndex.VisualTree] = null;

        this._ApplyStyles(this._StyleMask & ~styleMask, newStyles, error);
    };

    Fayde._ImplicitStylePropertyValueProvider = Nullstone.FinishCreate(_ImplicitStylePropertyValueProvider);
})(Nullstone.Namespace("Fayde"));