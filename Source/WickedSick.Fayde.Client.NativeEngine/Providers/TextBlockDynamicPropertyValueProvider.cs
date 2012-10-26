
namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class TextBlockDynamicPropertyValueProvider : FrameworkElementPropertyValueProvider
    {
        public TextBlockDynamicPropertyValueProvider(DependencyObjectNative @do)
            : base(@do)
        {
        }

        public override object GetPropertyValue(DependencyPropertyWrapper prop)
        {
            //TODO: Implement BaselineOffsetProperty
            return base.GetPropertyValue(prop);
        }
    }
}