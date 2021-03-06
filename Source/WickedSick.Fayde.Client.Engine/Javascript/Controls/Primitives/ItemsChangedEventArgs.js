﻿/// <reference path="../../Runtime/Nullstone.js"/>
/// <reference path="../../Runtime/EventArgs.js"/>
/// CODE

(function (namespace) {
    var ItemsChangedEventArgs = Nullstone.Create("ItemsChangedEventArgs", EventArgs, 5);

    ItemsChangedEventArgs.Instance.Init = function (action, itemCount, itemUICount, oldPosition, position) {
        this.Action = action;
        this.ItemCount = itemCount;
        this.ItemUICount = itemUICount;
        this.OldPosition = oldPosition;
        this.Position = position;
    };

    namespace.ItemsChangedEventArgs = Nullstone.FinishCreate(ItemsChangedEventArgs);
})(Nullstone.Namespace("Fayde.Controls.Primitives"));