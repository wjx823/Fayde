using System.Collections.Generic;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class AutoCreatePropertyValueProvider : PropertyValueProvider
    {
        private Dictionary<int, object> _ht = new Dictionary<int, object>();

        public AutoCreatePropertyValueProvider(DependencyObject @do)
            : base(@do, PropertyPrecedence.AutoCreate)
        {
        }

        public override object GetPropertyValue(DependencyProperty prop)
        {
            var val = ReadLocalValue(prop);
            if (val != DependencyObject.UNDEFINED)
                return val;

            val = prop._IsAutoCreated ? prop._GetAutoCreatedValue(_Object) : DependencyObject.UNDEFINED;
            if (val == DependencyObject.UNDEFINED)
                return val;

            _ht[prop._ID] = val;
            _Object._ProviderValueChanged(_Precedence, prop, DependencyObject.UNDEFINED, val, false, true, false);
            return val;
        }

        public object ReadLocalValue(DependencyProperty prop)
        {
            if (_ht.ContainsKey(prop._ID))
                return _ht[prop._ID];
            return DependencyObject.UNDEFINED;
        }

        public void RecomputePropertyValueOnClear(DependencyProperty prop)
        {
            ClearValue(prop);
        }

        public void ClearValue(DependencyProperty prop)
        {
            if (_ht.ContainsKey(prop._ID))
                _ht.Remove(prop._ID);
        }
    }
}