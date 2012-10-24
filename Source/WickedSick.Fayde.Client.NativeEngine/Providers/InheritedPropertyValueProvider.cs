using System;
using System.Collections.Generic;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class InheritedPropertyValueProvider : PropertyValueProvider
    {
        private Dictionary<int, object> _ht = new Dictionary<int, object>();

        public InheritedPropertyValueProvider(DependencyObjectNative @do)
            : base(@do, PropertyPrecedence.Inherited)
        {
        }

        public override object GetPropertyValue(DependencyPropertyWrapper prop)
        {
            var inheritable = GetInheritable(_Object, prop);
            if (inheritable == Inheritable.None)
                return DependencyObjectNative.UNDEFINED;

            var ancestor = GetPropertySource(inheritable);
            if (ancestor == null)
                return DependencyObjectNative.UNDEFINED;

            var ancestorProp = GetProperty(inheritable, ancestor);
            if (ancestorProp == null)
                return DependencyObjectNative.UNDEFINED;


            var val = (ancestor as DependencyObjectNative).GetValue(ancestorProp);
            if (val == null)
                return DependencyObjectNative.UNDEFINED;
            return val;
        }

        public object GetPropertySource(int inheritable)
        {
            if (_ht.ContainsKey(inheritable))
                return _ht[inheritable];
            return null;
        }
        public void SetPropertySource(int inheritable, object source)
        {
            if (source == null)
                _ht.Remove(inheritable);
            else
                _ht[inheritable] = source;
        }

        public void PropagateInheritedProperty(DependencyPropertyWrapper prop, DependencyObjectNative source, DependencyObjectNative subtree)
        {
            throw new NotImplementedException();
        }


        public static int GetInheritable(object ancestor, DependencyPropertyWrapper prop)
        {
            throw new NotImplementedException();
        }

        public static DependencyPropertyWrapper GetProperty(int inheritable, object ancestor)
        {
            throw new NotImplementedException();
        }
    }
}