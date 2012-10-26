using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Providers;

namespace WickedSick.Fayde.Client.NativeEngine.Controls
{
    public class TextBoxNative : ControlNative
    {
        public static DependencyPropertyWrapper ForegroundProperty;
        public static DependencyPropertyWrapper BackgroundProperty;
        public static DependencyPropertyWrapper BaselineOffsetProperty;

        public TextBoxNative(ScriptObject @object)
            : base(@object)
        {
            _Providers[PropertyPrecedence.DynamicValue] = new TextBoxBaseDynamicPropertyValueProvider(this, ForegroundProperty, BackgroundProperty, BaselineOffsetProperty);
        }

        public static void InitializeProperties(ScriptObject ctor)
        {
            ScriptObject prop;

            prop = ctor.GetProperty("BackgroundProperty") as ScriptObject;
            if (prop != null)
                TextBoxNative.BackgroundProperty = DependencyPropertyWrapper.Lookup(prop);

            prop = ctor.GetProperty("ForegroundProperty") as ScriptObject;
            if (prop != null)
                TextBoxNative.ForegroundProperty = DependencyPropertyWrapper.Lookup(prop);

            prop = ctor.GetProperty("BaselineOffsetProperty") as ScriptObject;
            if (prop != null)
                TextBoxNative.BaselineOffsetProperty = DependencyPropertyWrapper.Lookup(prop);
        }

        protected TextBoxBaseDynamicPropertyValueProvider TextBoxBaseProvider { get { return _Providers[PropertyPrecedence.DynamicValue] as TextBoxBaseDynamicPropertyValueProvider; } }

        [ScriptableMember]
        public void InitializeSelectionBrushes(object foreground, object background)
        {
            TextBoxBaseProvider.InitSelectionBrushes(foreground, background);
        }
    }
}