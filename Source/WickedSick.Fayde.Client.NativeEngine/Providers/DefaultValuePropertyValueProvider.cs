
namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class DefaultValuePropertyValueProvider : PropertyValueProvider
    {
        public DefaultValuePropertyValueProvider(DependencyObject @do)
            : base(@do, PropertyPrecedence.DefaultValue)
        {
        }
        
        public override object GetPropertyValue(DependencyProperty prop)
        {
            return prop.DefaultValue;
        }
    }
}
