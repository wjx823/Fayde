
namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class DefaultValuePropertyValueProvider : PropertyValueProvider
    {
        public DefaultValuePropertyValueProvider(DependencyObjectNative @do)
            : base(@do, PropertyPrecedence.DefaultValue)
        {
        }

        public override object GetPropertyValue(DependencyPropertyWrapper prop)
        {
            return prop.DefaultValue;
        }
    }
}