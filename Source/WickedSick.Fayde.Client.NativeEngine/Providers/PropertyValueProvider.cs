
namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public abstract class PropertyValueProvider
    {
        protected DependencyObject _Object;
        protected int _Precedence;

        public PropertyValueProvider(DependencyObject @do, int precedence)
        {
            _Object = @do;
            _Precedence = precedence;
        }

        public abstract object GetPropertyValue(DependencyProperty prop);
    }
}