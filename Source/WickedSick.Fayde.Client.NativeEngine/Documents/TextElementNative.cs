using System.Collections.Generic;
using System.Linq;
using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Providers;

namespace WickedSick.Fayde.Client.NativeEngine.Documents
{
    [ScriptableType]
    public abstract class TextElementNative : DependencyObjectNative
    {
        public TextElementNative(ScriptObject @object)
            : base(@object)
        {
            _Providers[PropertyPrecedence.Inherited] = new InheritedPropertyValueProvider(this);
        }

        protected abstract DependencyPropertyWrapper GetChildrenDP();

        internal override IEnumerable<DependencyObjectNative> GetChildrenForInheritedPropagation()
        {
            var coll = GetValueNoAutoCreate(GetChildrenDP());
            if (coll != DependencyObjectNative.UNDEFINED)
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