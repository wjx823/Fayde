/// <reference path="../../Runtime/Nullstone.js" />
/// <reference path="DependencyObjectCollection.js"/>
/// CODE

(function (namespace) {
    var UIElementCollection = Nullstone.Create("UIElementCollection", Fayde.DependencyObjectCollection);

    UIElementCollection.Instance.Init = function () {
        this.Init$DependencyObjectCollection();
        this._ZSorted = [];
    };

    UIElementCollection.Instance.GetValueAtZIndex = function (index) {
        return this._ZSorted[index];
    };
    UIElementCollection.Instance.GetZSortedCount = function () {
        return this._ZSorted.length;
    };
    UIElementCollection.Instance.ResortByZIndex = function () {
        var count = this.GetCount();
        this._ZSorted = new Array(count);
        if (count < 1)
            return;

        for (var i = 0; i < count; i++) {
            this._ZSorted[i] = this._ht[i];
        }

        if (count > 1) {
            this._ZSorted.sort(Fayde.UIElement.ZIndexComparer);
        }
    };
    UIElementCollection.Instance.IsElementType = function (value) {
        return value instanceof Fayde.UIElement;
    };

    namespace.UIElementCollection = Nullstone.FinishCreate(UIElementCollection);
})(Nullstone.Namespace("Fayde"));