using System.Collections.Generic;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class InheritedPropertyValueProvider : PropertyValueProvider
    {
        private Dictionary<int, DependencyObjectNative> _ht = new Dictionary<int, DependencyObjectNative>();

        public InheritedPropertyValueProvider(DependencyObjectNative @do)
            : base(@do, PropertyPrecedence.Inherited)
        {
        }

        public override object GetPropertyValue(DependencyPropertyWrapper prop)
        {
            var inheritable = prop.GetInheritable(_Object);
            if (inheritable == Inheritable.None)
                return DependencyObjectNative.UNDEFINED;

            var ancestor = GetPropertySource(inheritable);
            if (ancestor == null)
                return DependencyObjectNative.UNDEFINED;

            var ancestorProp = DependencyPropertyWrapper.GetFromInheritable(inheritable, ancestor);
            if (ancestorProp == null)
                return DependencyObjectNative.UNDEFINED;


            var val = (ancestor as DependencyObjectNative).GetValue(ancestorProp);
            if (val == null)
                return DependencyObjectNative.UNDEFINED;
            return val;
        }

        public DependencyObjectNative GetPropertySource(int inheritable)
        {
            if (_ht.ContainsKey(inheritable))
                return _ht[inheritable];
            return null;
        }
        public void SetPropertySource(int inheritable, DependencyObjectNative source)
        {
            if (source == null)
                _ht.Remove(inheritable);
            else
                _ht[inheritable] = source;
        }

        public void PropagateInheritedProperty(DependencyPropertyWrapper prop, DependencyObjectNative source, DependencyObjectNative subtree)
        {
            var inheritable = prop.GetInheritable(source);
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
            foreach (var child in element.GetChildrenForInheritedPropagation())
            {
                WalkTree(rootParent, child, context, props, adding);
            }
        }
        private void WalkTree(DependencyObjectNative rootParent, DependencyObjectNative element, InheritedContext context, int props, bool adding)
        {
            if (props == Inheritable.None)
                return;

            if (adding)
            {
                MaybePropagateInheritedValue(context.ForegroundSource, Inheritable.Foreground, props, element);
                MaybePropagateInheritedValue(context.FontFamilySource, Inheritable.FontFamily, props, element);
                MaybePropagateInheritedValue(context.FontStretchSource, Inheritable.FontStretch, props, element);
                MaybePropagateInheritedValue(context.FontStyleSource, Inheritable.FontStyle, props, element);
                MaybePropagateInheritedValue(context.FontWeightSource, Inheritable.FontWeight, props, element);
                MaybePropagateInheritedValue(context.FontSizeSource, Inheritable.FontSize, props, element);
                MaybePropagateInheritedValue(context.LanguageSource, Inheritable.Language, props, element);
                MaybePropagateInheritedValue(context.FlowDirectionSource, Inheritable.FlowDirection, props, element);
                MaybePropagateInheritedValue(context.UseLayoutRoundingSource, Inheritable.UseLayoutRounding, props, element);
                MaybePropagateInheritedValue(context.TextDecorationsSource, Inheritable.TextDecorations, props, element);

                var eleContext = InheritedContext.FromObject(element, context);
                props = eleContext.Compare(context, props);
                if (props == Inheritable.None)
                    return;

                WalkSubTree(rootParent, element, eleContext, props, adding);
            }
            else
            {
                var eleContext = InheritedContext.FromObject(element, context);

                MaybeRemoveInheritedValue(context.ForegroundSource, Inheritable.Foreground, props, element);
                MaybeRemoveInheritedValue(context.FontFamilySource, Inheritable.FontFamily, props, element);
                MaybeRemoveInheritedValue(context.FontStretchSource, Inheritable.FontStretch, props, element);
                MaybeRemoveInheritedValue(context.FontStyleSource, Inheritable.FontStyle, props, element);
                MaybeRemoveInheritedValue(context.FontWeightSource, Inheritable.FontWeight, props, element);
                MaybeRemoveInheritedValue(context.FontSizeSource, Inheritable.FontSize, props, element);
                MaybeRemoveInheritedValue(context.LanguageSource, Inheritable.Language, props, element);
                MaybeRemoveInheritedValue(context.FlowDirectionSource, Inheritable.FlowDirection, props, element);
                MaybeRemoveInheritedValue(context.UseLayoutRoundingSource, Inheritable.UseLayoutRounding, props, element);
                MaybeRemoveInheritedValue(context.TextDecorationsSource, Inheritable.TextDecorations, props, element);

                props = eleContext.Compare(context, props);
                if (props == Inheritable.None)
                    return;

                WalkSubTree(rootParent, element, eleContext, props, adding);
            }
        }
        private void MaybePropagateInheritedValue(DependencyObjectNative source, int prop, int props, DependencyObjectNative element)
        {
            if (source == null) return;
            if ((props & prop) == 0) return;
            var sourceProp = DependencyPropertyWrapper.GetFromInheritable(prop, source);
            var val = source.GetValue(sourceProp);
            if (val != null && val != DependencyObjectNative.UNDEFINED)
                element._PropagateInheritedValue(prop, source, val);
        }
        private void MaybeRemoveInheritedValue(DependencyObjectNative source, int prop, int props, DependencyObjectNative element)
        {
            if (source == null) return;
            if ((props & prop) == 0) return;
            if (Nullstone.RefEquals(source, element._GetInheritedValueSource(prop)))
                element._PropagateInheritedValue(prop, null, DependencyObjectNative.UNDEFINED);
        }
    }
}