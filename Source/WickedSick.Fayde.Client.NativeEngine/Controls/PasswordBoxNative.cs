using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Providers;

namespace WickedSick.Fayde.Client.NativeEngine.Controls
{
    [ScriptableType]
    public class PasswordBoxNative : ControlNative
    {
        public static DependencyPropertyWrapper SelectionForegroundProperty;
        public static DependencyPropertyWrapper SelectionBackgroundProperty;
        public static DependencyPropertyWrapper BaselineOffsetProperty;

        public PasswordBoxNative(ScriptObject @object)
            : base(@object)
        {
            _Providers[PropertyPrecedence.DynamicValue] = new TextBoxBaseDynamicPropertyValueProvider(this, SelectionForegroundProperty, SelectionBackgroundProperty, BaselineOffsetProperty);
        }

        public static void InitializeProperties(ScriptObject ctor)
        {
            ScriptObject prop;

            prop = ctor.GetProperty("SelectionBackgroundProperty") as ScriptObject;
            if (prop != null)
                PasswordBoxNative.SelectionBackgroundProperty = DependencyPropertyWrapper.Lookup(prop);

            prop = ctor.GetProperty("SelectionForegroundProperty") as ScriptObject;
            if (prop != null)
                PasswordBoxNative.SelectionForegroundProperty = DependencyPropertyWrapper.Lookup(prop);

            prop = ctor.GetProperty("BaselineOffsetProperty") as ScriptObject;
            if (prop != null)
                PasswordBoxNative.BaselineOffsetProperty = DependencyPropertyWrapper.Lookup(prop);
        }

        protected TextBoxBaseDynamicPropertyValueProvider TextBoxBaseProvider { get { return _Providers[PropertyPrecedence.DynamicValue] as TextBoxBaseDynamicPropertyValueProvider; } }

        [ScriptableMember]
        public void InitializeSelectionBrushes(object foreground, object background)
        {
            TextBoxBaseProvider.InitSelectionBrushes(foreground, background);
        }
    }
}