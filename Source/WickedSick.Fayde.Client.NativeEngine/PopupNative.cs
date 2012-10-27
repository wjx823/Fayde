using System.Collections.Generic;
using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine
{
    [ScriptableType]
    public class PopupNative : FrameworkElementNative
    {
        public static DependencyPropertyWrapper ChildProperty;

        public PopupNative(ScriptObject @object)
            : base(@object)
        {
        }

        internal override IEnumerable<DependencyObjectNative> GetChildrenForInheritedPropagation()
        {
            var child = GetValue(ChildProperty);
            if (child != DependencyObjectNative.UNDEFINED)
            {
                var childNative = GetFromObject(child);
                if (childNative != null)
                    yield return childNative;
            }
        }
    }
}