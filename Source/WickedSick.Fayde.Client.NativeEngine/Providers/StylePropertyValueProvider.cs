using System;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class StylePropertyValueProvider : PropertyValueProvider
    {
        public StylePropertyValueProvider(DependencyObjectNative @do)
            : base(@do, PropertyPrecedence.LocalStyle)
        {
        }

        public override object GetPropertyValue(DependencyPropertyWrapper prop)
        {
            throw new NotImplementedException();
        }
    }
}
