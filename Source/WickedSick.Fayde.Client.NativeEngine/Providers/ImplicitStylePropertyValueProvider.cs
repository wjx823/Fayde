using System.Collections.Generic;
using System.Linq;
using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Walkers;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class ImplicitStylePropertyValueProvider : PropertyValueProvider
    {
        public class StyleIndex
        {
            public const int VisualTree = 0;
            public const int ApplicationResources = 1;
            public const int GenericXaml = 2;
            public const int Count = 3;
        }
        public class StyleMask
        {
            public const int VisualTree = 1 << 0;
            public const int ApplicationResources = 1 << 1;
            public const int GenericXaml = 1 << 2;
        }

        private ScriptObject[] _Styles;
        private int _StyleMask = 0;
        private Dictionary<DependencyPropertyWrapper, object> _ht = new Dictionary<DependencyPropertyWrapper, object>();

        public ImplicitStylePropertyValueProvider(DependencyObjectNative @do)
            : base(@do, PropertyPrecedence.ImplicitStyle)
        {
        }

        public override object GetPropertyValue(DependencyPropertyWrapper prop)
        {
            if (_ht.ContainsKey(prop))
                return _ht[prop];
            return DependencyObjectNative.UNDEFINED;
        }

        public override void RecomputePropertyValueOnClear(DependencyPropertyWrapper propd)
        {
            if (_Styles == null)
                return;

            var walker = new DeepStyleWalker(_Styles);
            SetterNative setter;
            while ((setter = walker.Step()) != null)
            {
                var prop = setter.Property;
                if (prop._ID != propd._ID)
                    continue;

                var newValue = setter.ConvertedValue;
                var oldValue = _ht[propd];
                _ht[propd] = newValue;
                _Object._ProviderValueChanged(_Precedence, propd, oldValue, newValue, true, true, true);
            }
        }

        internal void SetStyles(int styleMask, ScriptObject[] styles)
        {
            if (styles == null)
                return;

            var newStyles = new ScriptObject[3];
            if (_Styles != null)
            {
                newStyles[StyleIndex.GenericXaml] = _Styles[StyleIndex.GenericXaml];
                newStyles[StyleIndex.ApplicationResources] = _Styles[StyleIndex.ApplicationResources];
                newStyles[StyleIndex.VisualTree] = _Styles[StyleIndex.VisualTree];
            }

            if ((styleMask & StyleMask.GenericXaml) != 0)
                newStyles[StyleIndex.GenericXaml] = styles[StyleIndex.GenericXaml];

            if ((styleMask & StyleMask.ApplicationResources) != 0)
                newStyles[StyleIndex.ApplicationResources] = styles[StyleIndex.ApplicationResources];

            if ((styleMask & StyleMask.VisualTree) != 0)
                newStyles[StyleIndex.VisualTree] = styles[StyleIndex.VisualTree];

            ApplyStyles(_StyleMask | styleMask, newStyles);
        }
        internal void ClearStyles(int styleMask)
        {
            if (_Styles == null)
                return;

            var newStyles = _Styles.ToArray();
            //TODO: Deep copy?
            if ((styleMask & StyleMask.GenericXaml) != 0)
                newStyles[StyleIndex.GenericXaml] = null;
            if ((styleMask & StyleMask.ApplicationResources) != 0)
                newStyles[StyleIndex.ApplicationResources] = null;
            if ((styleMask & StyleMask.VisualTree) != 0)
                newStyles[StyleIndex.VisualTree] = null;

            ApplyStyles(_StyleMask & ~styleMask, newStyles);
        }
        private void ApplyStyles(int styleMask, ScriptObject[] styles)
        {
            if (!IsChanged(styleMask, styles))
                return;

            var oldWalker = new DeepStyleWalker(_Styles);
            var newWalker = new DeepStyleWalker(styles);

            var oldSetter = oldWalker.Step();
            var newSetter = newWalker.Step();
            DependencyPropertyWrapper oldProp = null;
            DependencyPropertyWrapper newProp = null;

            object oldValue = DependencyObjectNative.UNDEFINED;
            object newValue = DependencyObjectNative.UNDEFINED;

            while (oldSetter != null || newSetter != null)
            {
                if (oldSetter != null)
                    oldProp = oldSetter.Property;
                if (newSetter != null)
                    newProp = newSetter.Property;

                if (oldProp != null && (oldProp._ID < newProp._ID || newProp == null))
                {
                    oldValue = oldSetter.ConvertedValue;
                    newValue = DependencyObjectNative.UNDEFINED;
                    _ht.Remove(oldProp);
                    _Object._ProviderValueChanged(_Precedence, oldProp, oldValue, newValue, true, true, false);
                    oldSetter = oldWalker.Step();
                }
                else if (oldProp != null && newProp != null && oldProp._ID == newProp._ID)
                {
                    oldValue = oldSetter.ConvertedValue;
                    newValue = newSetter.ConvertedValue;
                    _ht[oldProp] = newValue;
                    _Object._ProviderValueChanged(_Precedence, oldProp, oldValue, newValue, true, true, false);
                    oldSetter = oldWalker.Step();
                    newSetter = newWalker.Step();
                }
                else
                {
                    oldValue = DependencyObjectNative.UNDEFINED;
                    newValue = newSetter.ConvertedValue;
                    _ht[newProp] = newValue;
                    _Object._ProviderValueChanged(_Precedence, newProp, oldValue, newValue, true, true, false);
                    newSetter = newWalker.Step();
                }
            }

            _Styles = styles;
            _StyleMask = styleMask;
        }

        private bool IsChanged(int styleMask, ScriptObject[] styles)
        {
            if (_Styles == null || styleMask != _StyleMask)
                return true;
            for (int i = 0; i < StyleIndex.Count; i++)
            {
                if (!Nullstone.RefEquals(styles[i], _Styles[i]))
                {
                    return true;
                }
            }
            return false;
        }
    }
}