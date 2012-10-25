using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Providers;

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
    }
}