using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine.Documents
{
    public class ParagraphNative : TextElementNative
    {
        public static DependencyPropertyWrapper InlinesProperty;

        public ParagraphNative(ScriptObject @object)
            : base(@object)
        {
        }

        protected override DependencyPropertyWrapper GetChildrenDP()
        {
            return InlinesProperty;
        }
    }
}