﻿/// <reference path="ContentControl.js"/>
/// <reference path="Enums.js"/>
/// CODE

(function (namespace) {
    var ToolTip = Nullstone.Create("ToolTip", namespace.ContentControl);

    //#region Properties

    ToolTip.HorizontalOffsetProperty = DependencyProperty.Register("HorizontalOffset", function () { return Number; }, ToolTip);
    ToolTip.IsOpenProperty = DependencyProperty.Register("IsOpen", function () { return Boolean; }, ToolTip);
    ToolTip.PlacementProperty = DependencyProperty.Register("Placement", function () { return new Enum(namespace.PlacementMode); }, ToolTip);
    ToolTip.PlacementTargetProperty = DependencyProperty.Register("PlacementTarget", function () { return Fayde.UIElement; }, ToolTip);
    ToolTip.VerticalOffsetProperty = DependencyProperty.Register("VerticalOffset", function () { return Number; }, ToolTip);

    Nullstone.AutoProperties(ToolTip, [
        ToolTip.HorizontalOffsetProperty,
        ToolTip.IsOpenProperty,
        ToolTip.PlacementProperty,
        ToolTip.PlacementTargetProperty,
        ToolTip.VerticalOffsetProperty
    ]);

    //#endregion

    namespace.ToolTip = Nullstone.FinishCreate(ToolTip);
})(Nullstone.Namespace("Fayde.Controls"));