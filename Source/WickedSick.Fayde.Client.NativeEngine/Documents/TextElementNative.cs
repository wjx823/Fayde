using System.Collections.Generic;
using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine.Documents
{
    public abstract class TextElementNative : DependencyObjectNative
    {
        public TextElementNative(ScriptObject @object)
            : base(@object)
        {
        }

        protected abstract DependencyPropertyWrapper GetChildrenDP();

        internal override IEnumerable<DependencyObjectNative> GetChildrenForInheritedPropagation()
        {
            var coll = GetValueNoAutoCreate(GetChildrenDP());
            if (coll != DependencyObjectNative.UNDEFINED)
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