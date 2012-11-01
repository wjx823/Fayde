/// <reference path="../Runtime/Nullstone.js" />
/// <reference path="../Core/DependencyObject.js"/>
/// CODE
/// <reference path="PropertyValueProviders.js"/>

//#region TextElement
var TextElement = Nullstone.Create("TextElement", DependencyObject);

TextElement.Instance.Init = function () {
    this.Init$DependencyObject();
    this.AddProvider(new _InheritedPropertyValueProvider(this, _PropertyPrecedence.Inherited));
    this._Font = new Font();
    this._UpdateFont(true);
};

//#region Properties

TextElement.ForegroundProperty = DependencyProperty.RegisterInheritable("Foreground", function () { return Brush; }, TextElement, undefined, undefined, { GetValue: function () { return new SolidColorBrush(new Color(0, 0, 0)); } }, _Inheritable.Foreground);
TextElement.FontFamilyProperty = DependencyProperty.RegisterInheritable("FontFamily", function () { return String; }, TextElement, Font.DEFAULT_FAMILY, undefined, undefined, _Inheritable.FontFamily);
TextElement.FontStretchProperty = DependencyProperty.RegisterInheritable("FontStretch", function () { return String; }, TextElement, Font.DEFAULT_STRETCH, undefined, undefined, _Inheritable.FontStretch);
TextElement.FontStyleProperty = DependencyProperty.RegisterInheritable("FontStyle", function () { return String; }, TextElement, Font.DEFAULT_STYLE, undefined, undefined, _Inheritable.FontStyle);
TextElement.FontWeightProperty = DependencyProperty.RegisterInheritable("FontWeight", function () { return new Enum(FontWeight); }, TextElement, Font.DEFAULT_WEIGHT, undefined, undefined, _Inheritable.FontWeight);
TextElement.FontSizeProperty = DependencyProperty.RegisterInheritable("FontSize", function () { return Number; }, TextElement, Font.DEFAULT_SIZE, undefined, undefined, _Inheritable.FontSize);
TextElement.LanguageProperty = DependencyProperty.RegisterInheritable("Language", function () { return String; }, TextElement, undefined, undefined, undefined, _Inheritable.Language);
TextElement.TextDecorationsProperty = DependencyProperty.RegisterInheritable("TextDecorations", function () { return new Enum(TextDecorations); }, TextElement, TextDecorations.None, undefined, undefined, _Inheritable.TextDecorations);

Nullstone.AutoProperties(TextElement, [
    TextElement.ForegroundProperty,
    TextElement.FontFamilyProperty,
    TextElement.FontStretchProperty,
    TextElement.FontStyleProperty,
    TextElement.FontWeightProperty,
    TextElement.FontSizeProperty,
    TextElement.LanguageProperty,
    TextElement.TextDecorationsProperty
]);

//#endregion

//#region TextAttributes Methods

TextElement.Instance.GetBackground = function (selected) { return null; }
//TextElement.Instance.GetForeground (DP)
TextElement.Instance.GetFont = function () { return this._Font; };
TextElement.Instance.GetDirection = function () { return FlowDirection.LeftToRight; };
//TextElement.Instance.GetTextDecorations (DP)

//#endregion

TextElement.Instance._SerializeText = function (str) { return str; };
TextElement.Instance._UpdateFont = function (force) {
    this._Font.Family = this.FontFamily;
    this._Font.Stretch = this.FontStretch;
    this._Font.Style = this.FontStyle;
    this._Font.Weight = this.FontWeight;
    this._Font.Size = this.FontSize;
    return this._Font.IsChanged || force;
};
TextElement.Instance._OnPropertyChanged = function (args, error) {
    if (args.Property.OwnerType !== TextElement) {
        this._OnPropertyChanged$DependencyObject(args, error);
        return;
    }

    if (args.Property._ID === TextElement.FontFamilyProperty._ID
        || args.Property._ID === TextElement.FontSizeProperty._ID
        || args.Property._ID === TextElement.FontStretchProperty._ID
        || args.Property._ID === TextElement.FontStyleProperty._ID
        || args.Property._ID === TextElement.FontWeightProperty._ID) {
        this._UpdateFont(false);
    }
    this.PropertyChanged.Raise(this, args);
};

Nullstone.FinishCreate(TextElement);
//#endregion