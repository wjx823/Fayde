using System.Collections.Generic;
using System.Linq;
using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Providers;

namespace WickedSick.Fayde.Client.NativeEngine.Controls
{
    [ScriptableType]
    public class TextBlockNative : FrameworkElementNative
    {
        public static DependencyPropertyWrapper InlinesProperty;

        public TextBlockNative(ScriptObject @object)
            : base(@object)
        {
            _Providers[PropertyPrecedence.DynamicValue] = new TextBlockDynamicPropertyValueProvider(this);
        }

        internal override IEnumerable<DependencyObjectNative> GetChildrenForInheritedPropagation()
        {
            var coll = GetValueNoAutoCreate(InlinesProperty);
            if (coll != DependencyObjectNative.UNDEFINED && coll is ScriptObject)
            {
                var ht = (coll as ScriptObject).GetProperty("_ht") as ScriptObject;
                if (ht != null)
                {
                    return ht.GetItems<ScriptObject>()
                        .Select(GetFromScriptObject);
                }
            }
            return Enumerable.Empty<DependencyObjectNative>();
        }
    }
}