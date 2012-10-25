using System.Collections.Generic;
using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine.Controls
{
    public class TextBlockNative : FrameworkElementNative
    {
        public static DependencyPropertyWrapper InlinesProperty;

        public TextBlockNative(ScriptObject @object)
            : base(@object)
        {
        }

        internal override IEnumerable<DependencyObjectNative> GetChildrenForInheritedPropagation()
        {
            var coll = GetValueNoAutoCreate(InlinesProperty);
            if (coll != DependencyObjectNative.UNDEFINED && coll is ScriptObject)
            {
                var ht = (coll as ScriptObject).GetProperty("_ht") as object[];
                if (ht != null)
                {
                    for (int i = 0; i < ht.Length; i++)
                    {
                        yield return ht[i] as DependencyObjectNative;
                    }
                }
            }
        }
    }
}