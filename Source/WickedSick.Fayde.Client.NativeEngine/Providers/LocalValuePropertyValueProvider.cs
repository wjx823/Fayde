using System.Collections.Generic;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class LocalValuePropertyValueProvider : PropertyValueProvider
    {
        private Dictionary<int, object> _ht = new Dictionary<int, object>();

        public LocalValuePropertyValueProvider(DependencyObject @do)
            : base(@do, PropertyPrecedence.LocalValue)
        {
        }

        public override object GetPropertyValue(DependencyProperty prop)
        {
            if (!_ht.ContainsKey(prop._ID))
                return DependencyObject.UNDEFINED;
            return _ht[prop._ID];
        }

        public void SetValue(DependencyProperty prop, object value)
        {
            this._ht[prop._ID] = value;
        }

        public void ClearValue(DependencyProperty prop)
        {
            if (_ht.ContainsKey(prop._ID))
                _ht.Remove(prop._ID);
        }
    }
}