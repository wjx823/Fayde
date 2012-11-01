using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine.Documents
{
    public class InlineNative : TextElementNative
    {
        public InlineNative(ScriptObject @object)
            : base(@object)
        {
        }

        protected override DependencyPropertyWrapper GetChildrenDP()
        {
            return null;
        }
    }
}