using System.Collections.Generic;
using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Providers;
using WickedSick.Fayde.Client.NativeEngine.Walkers;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public class UIElementNative : DependencyObjectNative
    {
        public UIElementNative(ScriptObject @object)
            : base(@object)
        {
            _Providers[PropertyPrecedence.Inherited] = new InheritedPropertyValueProvider(this);
            _VisualParentLazy = new LazyMember<UIElementNative>(@object, "_VisualParent");
        }

        private LazyMember<UIElementNative> _VisualParentLazy;
        internal UIElementNative VisualParent { get { return _VisualParentLazy.Value; } }

        internal override IEnumerable<DependencyObjectNative> GetChildrenForInheritedPropagation()
        {
            var walker = new VisualTreeWalker(Object, VisualTreeWalker.VisualTreeWalkerDirection.Logical);
            UIElementNative uie = null;
            while ((uie = walker.Step()) != null)
            {
                yield return uie;
            }
        }

        [ScriptableMember]
        public void PropagateOnAdd(ScriptObject item)
        {
            InheritedProvider.PropagateInheritedPropertiesOnAddingToTree(DependencyObjectNative.GetFromScriptObject(item));
        }

        [ScriptableMember]
        public void PropagateOnRemove(ScriptObject item)
        {
            InheritedProvider.ClearInheritedPropertiesOnRemovingFromTree(DependencyObjectNative.GetFromScriptObject(item));
        }
    }
}