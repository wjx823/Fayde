﻿(function (namespace) {
    namespace._PropertyPrecedence = {
        IsEnabled: 0,
        LocalValue: 1,
        DynamicValue: 2,

        LocalStyle: 3,
        ImplicitStyle: 4,

        Inherited: 5,
        InheritedDataContext: 6,
        DefaultValue: 7,
        AutoCreate: 8
    };
    _PropertyPrecedence.Highest = _PropertyPrecedence.IsEnabled;
    _PropertyPrecedence.Lowest = _PropertyPrecedence.AutoCreate;
    _PropertyPrecedence.Count = 9;

    namespace._StyleIndex = {
        VisualTree: 0,
        ApplicationResources: 1,
        GenericXaml: 2,
        Count: 3
    };
    namespace._StyleMask = {
        VisualTree: 1 << _StyleIndex.VisualTree,
        ApplicationResources: 1 << _StyleIndex.ApplicationResources,
        GenericXaml: 1 << _StyleIndex.GenericXaml
    };
    _StyleMask.All = _StyleMask.VisualTree | _StyleMask.ApplicationResources | _StyleMask.GenericXaml;
    _StyleMask.None = 0;

    namespace._Inheritable = {
        Foreground: 1 << 0,
        FontFamily: 1 << 1,
        FontStretch: 1 << 2,
        FontStyle: 1 << 3,
        FontWeight: 1 << 4,
        FontSize: 1 << 5,
        Language: 1 << 6,
        FlowDirection: 1 << 7,
        UseLayoutRounding: 1 << 8,
        TextDecorations: 1 << 9
    };
    _Inheritable.All = 0x7ff;
    _Inheritable.None = 0; //None must always be 0
})(window);