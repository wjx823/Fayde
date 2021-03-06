/// <reference path="../Runtime/Nullstone.js" />
/// <reference path="../Runtime/LinkedListNode.js"/>
/// CODE
/// <reference path="UIElement.js"/>

(function (Fayde) {
    var UIElementNode = Nullstone.Create("UIElementNode", LinkedListNode, 1);

    UIElementNode.Instance.Init = function (element) {
        /// <param name="element" type="UIElement"></param>
        this.UIElement = element;
    };

    Fayde.UIElementNode = Nullstone.FinishCreate(UIElementNode);
})(Nullstone.Namespace("Fayde"));