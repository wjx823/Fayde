
namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class FrameworkElementPropertyValueProvider : PropertyValueProvider
    {
        public static DependencyPropertyWrapper ActualWidthProperty;
        public static DependencyPropertyWrapper ActualHeightProperty;

        private double _ActualWidth;
        private double _ActualHeight;

        private double _LastWidth;
        private double _LastHeight;

        public FrameworkElementPropertyValueProvider(DependencyObjectNative @do)
            : base(@do, PropertyPrecedence.DynamicValue)
        {
            _LastWidth = double.NegativeInfinity;
            _LastHeight = double.NegativeInfinity;
        }

        public override object GetPropertyValue(DependencyPropertyWrapper prop)
        {
            if (prop._ID != ActualWidthProperty._ID && prop._ID != ActualHeightProperty._ID)
                return DependencyObjectNative.UNDEFINED;

            var actual = (_Object as FrameworkElementNative).CallComputeActualSize();
            var actualWidth = (double)actual.GetProperty("Width");
            var actualHeight = (double)actual.GetProperty("Height");

            if (actualWidth != _LastWidth || actualHeight != _LastHeight)
            {
                _LastWidth = actualWidth;
                _LastHeight = actualHeight;
                _ActualWidth = actualWidth;
                _ActualHeight = actualHeight;
            }

            if (prop._ID == ActualWidthProperty._ID)
                return actualWidth;
            return actualHeight;
        }
    }
}