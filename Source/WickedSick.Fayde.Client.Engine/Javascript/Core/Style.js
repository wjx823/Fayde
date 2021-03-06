/// <reference path="../Runtime/Nullstone.js" />
/// <reference path="DependencyObject.js"/>
/// CODE
/// <reference path="SetterBaseCollection.js"/>
/// <reference path="Core.js"/>

(function (namespace) {
    var Style = Nullstone.Create("Style", Fayde.DependencyObject);

    //#region Properties

    Style.SettersProperty = DependencyProperty.RegisterFull("Setters", function () { return Fayde.SetterBaseCollection; }, Style, undefined, undefined, { GetValue: function () { return new Fayde.SetterBaseCollection(); } });
    Style.IsSealedProperty = DependencyProperty.RegisterCore("IsSealed", function () { return Boolean; }, Style);
    Style.BasedOnProperty = DependencyProperty.RegisterCore("BasedOn", function () { return Function; }, Style);
    Style.TargetTypeProperty = DependencyProperty.RegisterCore("TargetType", function () { return Function; }, Style);

    Nullstone.AutoProperties(Style, [
        Style.SettersProperty,
        Style.IsSealedProperty,
        Style.BasedOnProperty,
        Style.TargetTypeProperty
    ]);

    //#endregion

    //#region Annotations

    Style.Annotations = {
        ContentProperty: Style.SettersProperty
    };

    //#endregion

    Style.Instance._Seal = function () {
        if (this.IsSealed)
            return;

        this._ConvertSetterValues();
        this.$SetValueInternal(Style.IsSealedProperty, true);
        this.Setters._Seal();

        var base = this.BasedOn;
        if (base)
            base._Seal();
    };
    Style.Instance._ConvertSetterValues = function () {
        var setters = this.Setters;
        var count = setters.GetCount();
        for (var i = 0; i < count; i++) {
            this._ConvertSetterValue(setters.GetValueAt(i));
        }
    };
    Style.Instance._ConvertSetterValue = function (setter) {
        /// <param name="setter" type="Setter"></param>
        var propd = setter.Property;
        var val = setter.Value;

        if (typeof propd.GetTargetType() === "string") {
            //if (val === undefined)
            //throw new ArgumentException("Empty value in setter.");
            if (typeof val !== "string")
                throw new XamlParseException("Setter value does not match property type.");
        }

        try {
            setter._SetValue(Fayde.Setter.ConvertedValueProperty, Fayde.TypeConverter.ConvertObject(propd, val, this.TargetType, true));
        } catch (err) {
            throw new XamlParseException(err.message);
        }
    };
    
    namespace.Style = Nullstone.FinishCreate(Style);
})(Nullstone.Namespace("Fayde"));