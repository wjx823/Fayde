using System.Collections.Generic;
using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Providers;
using WickedSick.Fayde.Client.NativeEngine.Walkers;

namespace WickedSick.Fayde.Client.NativeEngine
{
    [ScriptableType]
    public class UIElementNative : DependencyObjectNative
    {
        public UIElementNative(ScriptObject @object)
            : base(@object)
        {
            _Providers[PropertyPrecedence.Inherited] = new InheritedPropertyValueProvider(this);
            _VisualParentLazy = new LazyMember<ScriptObject>(@object, "_VisualParent");
        }

        private LazyMember<ScriptObject> _VisualParentLazy;
        internal UIElementNative VisualParent { get { return DependencyObjectNative.GetFromScriptObject(_VisualParentLazy.Value) as UIElementNative; } }

        internal override IEnumerable<DependencyObjectNative> GetChildrenForInheritedPropagation()
        {
            var walker = new VisualTreeWalker(Object, VisualTreeWalker.VisualTreeWalkerDirection.Logical);
            UIElementNative uie = null;
            while ((uie = walker.Step()) != null)
            {
                yield return uie;
            }
        }
    }
}