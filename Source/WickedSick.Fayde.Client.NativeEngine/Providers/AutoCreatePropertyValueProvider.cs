using System.Collections.Generic;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class AutoCreatePropertyValueProvider : PropertyValueProvider
    {
        private Dictionary<DependencyPropertyWrapper, object> _ht = new Dictionary<DependencyPropertyWrapper, object>();

        public AutoCreatePropertyValueProvider(DependencyObjectNative @do)
            : base(@do, PropertyPrecedence.AutoCreate)
        {
        }

        public override object GetPropertyValue(DependencyPropertyWrapper prop)
        {
            var val = ReadLocalValue(prop);
            if (val != DependencyObjectNative.UNDEFINED)
                return val;

            val = prop._IsAutoCreated ? prop._GetAutoCreatedValue(_Object) : DependencyObjectNative.UNDEFINED;
            if (val == DependencyObjectNative.UNDEFINED)
                return val;

            _ht[prop] = val;
            _Object._ProviderValueChanged(_Precedence, prop, DependencyObjectNative.UNDEFINED, val, false, true, false);
            return val;
        }

        public object ReadLocalValue(DependencyPropertyWrapper prop)
        {
            if (_ht.ContainsKey(prop))
                return _ht[prop];
            return DependencyObjectNative.UNDEFINED;
        }

        public override void RecomputePropertyValueOnClear(DependencyPropertyWrapper prop)
        {
            ClearValue(prop);
        }

        public void ClearValue(DependencyPropertyWrapper prop)
        {
            if (_ht.ContainsKey(prop))
                _ht.Remove(prop);
        }

        public override void ForeachValue(System.Action<DependencyPropertyWrapper, object> action)
        {
            foreach (var kvp in _ht)
            {
                action(kvp.Key, kvp.Value);
            }
        }
    }
}