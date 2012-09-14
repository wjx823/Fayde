/// <reference path="../Runtime/Nullstone.js" />
/// <reference path="BindingExpressionBase.js"/>
/// CODE

//#region BindingExpression
var BindingExpression = Nullstone.Create("BindingExpression", BindingExpressionBase, 3);

BindingExpression.Instance.Init = function (binding, target, propd) {
    this.Init$BindingExpressionBase(binding, target, propd);
};

//#region Properties

Nullstone.Property(BindingExpression, "ParentBinding", {
    get: function () { return this.Binding; }
});
Nullstone.Property(BindingExpression, "DataItem", {
    get: function () { return this.DataSource; }
});

//#endregion

BindingExpression.Instance.UpdateSource = function () {
    return this._UpdateSourceObject(undefined, true);
};

Nullstone.FinishCreate(BindingExpression);
//#endregion