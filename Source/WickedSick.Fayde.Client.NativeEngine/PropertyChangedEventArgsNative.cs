using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public class PropertyChangedEventArgsNative
    {
        public PropertyChangedEventArgsNative(DependencyPropertyWrapper prop, object oldValue, object newValue)
        {
            Property = prop;
            OldValue = oldValue;
            NewValue = newValue;

            Object = HtmlPage.Window.CreateInstance("Object");
            Object.SetProperty("Property", Property.Object);
            Object.SetProperty("OldValue", OldValue);
            Object.SetProperty("NewValue", NewValue);
        }

        public ScriptObject Object { get; set; }

        public DependencyPropertyWrapper Property { get; protected set; }
        public object OldValue { get; protected set; }
        public object NewValue { get; protected set; }
    }
}