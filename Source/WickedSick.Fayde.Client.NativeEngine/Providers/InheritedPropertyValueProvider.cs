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
            var inheritable = GetInheritable(source, prop);
            if (inheritable == 0)
                return;
            var objContext = InheritedContext.FromObject(_Object, new InheritedContext());
            WalkSubTree(source, subtree, objContext, inheritable, true);
        }

        public void PropagateInheritedPropertiesOnAddingToTree(DependencyObjectNative subtree)
        {
            var baseContext = new InheritedContext
            {
                ForegroundSource = GetPropertySource(Inheritable.Foreground),
                FontFamilySource = GetPropertySource(Inheritable.FontFamily),
                FontStretchSource = GetPropertySource(Inheritable.FontStretch),
                FontStyleSource = GetPropertySource(Inheritable.FontStyle),
                FontWeightSource = GetPropertySource(Inheritable.FontWeight),
                FontSizeSource = GetPropertySource(Inheritable.FontSize),
                LanguageSource = GetPropertySource(Inheritable.Language),
                FlowDirectionSource = GetPropertySource(Inheritable.FlowDirection),
                UseLayoutRoundingSource = GetPropertySource(Inheritable.UseLayoutRounding),
                TextDecorationsSource = GetPropertySource(Inheritable.TextDecorations),
            };
            var objContext = InheritedContext.FromObject(_Object, baseContext);
            WalkTree(_Object, subtree, objContext, Inheritable.All, true);
        }
        public void ClearInheritedPropertiesOnRemovingFromTree(DependencyObjectNative subtree)
        {
            var baseContext = new InheritedContext
            {
                ForegroundSource = GetPropertySource(Inheritable.Foreground),
                FontFamilySource = GetPropertySource(Inheritable.FontFamily),
                FontStretchSource = GetPropertySource(Inheritable.FontStretch),
                FontStyleSource = GetPropertySource(Inheritable.FontStyle),
                FontWeightSource = GetPropertySource(Inheritable.FontWeight),
                FontSizeSource = GetPropertySource(Inheritable.FontSize),
                LanguageSource = GetPropertySource(Inheritable.Language),
                FlowDirectionSource = GetPropertySource(Inheritable.FlowDirection),
                UseLayoutRoundingSource = GetPropertySource(Inheritable.UseLayoutRounding),
                TextDecorationsSource = GetPropertySource(Inheritable.TextDecorations),
            };
            var objContext = InheritedContext.FromObject(_Object, baseContext);
            WalkTree(_Object, subtree, objContext, Inheritable.All, false);
        }


        private void WalkSubTree(DependencyObjectNative rootParent, DependencyObjectNative element, InheritedContext context, int props, bool adding)
        {
            throw new NotImplementedException();
        }
        private void WalkTree(DependencyObjectNative rootParent, DependencyObjectNative element, InheritedContext context, int props, bool adding)
        {
            throw new NotImplementedException();
        }
        private void MaybePropagateInheritedValue(DependencyObjectNative source, int prop, int props, DependencyObjectNative element)
        {
            if (source == null) return;
            if ((props & prop) == 0) return;
            var sourceProp = GetProperty(prop, source);
            var val = source.GetValue(sourceProp);
            if (val != null && val != DependencyObjectNative.UNDEFINED)
                element._PropagateInheritedValue(prop, source, val);
        }
        private void MaybeRemoveInheritedValue(DependencyObjectNative source, int prop, int props, DependencyObjectNative element)
        {
            if (source == null) return;
            if ((props & prop) == 0) return;
            if (Nullstone.RefEquals(source, element._GetInheritedValueSource(prop)))
                element._PropagateInheritedValue(prop, DependencyObjectNative.UNDEFINED, DependencyObjectNative.UNDEFINED);
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