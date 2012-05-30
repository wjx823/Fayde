/// <reference path="../Runtime/Nullstone.js" />
/// <reference path="../Core/FrameworkTemplate.js"/>
/// CODE
/// <reference path="../Core/NameScope.js"/>
/// <reference path="../Markup/JsonParser.js"/>

//#region ControlTemplate
var ControlTemplate = Nullstone.Create("ControlTemplate", FrameworkTemplate, 2);

ControlTemplate.Instance.Init = function (targetType, json) {
    this.Init$FrameworkTemplate();
    this.TargetType = targetType;
    this._TempJson = json;
};

//#region Dependency Properties

ControlTemplate.TargetTypeProperty = DependencyProperty.Register("TargetType", function () { return Function; }, ControlTemplate);

Nullstone.AutoProperties(ControlTemplate, [
    ControlTemplate.TargetTypeProperty
]);

//#endregion

ControlTemplate.Instance._GetVisualTreeWithError = function (templateBindingSource, error) {
    /// <param name="templateBindingSource" type="FrameworkElement"></param>
    /// <returns type="DependencyObject" />
    if (this._TempJson) {
        var namescope = new NameScope();
        var parser = new JsonParser();
        parser._TemplateBindingSource = templateBindingSource;
        var root = parser.CreateObject(this._TempJson, namescope);
        NameScope.SetNameScope(root, namescope);
        return root;
    }
    return this._GetVisualTreeWithError$FrameworkTemplate(templateBindingSource, error);
};

Nullstone.FinishCreate(ControlTemplate);
//#endregion