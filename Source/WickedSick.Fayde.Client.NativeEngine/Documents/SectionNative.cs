using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine.Documents
{
    [ScriptableType]
    public class SectionNative : BlockNative
    {
        public static DependencyPropertyWrapper BlocksProperty;

        public SectionNative(ScriptObject @object)
            : base(@object)
        {
        }

        protected override DependencyPropertyWrapper GetChildrenDP()
        {
            return BlocksProperty;
        }
    }
}