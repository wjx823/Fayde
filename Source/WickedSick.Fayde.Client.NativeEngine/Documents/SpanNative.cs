using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine.Documents
{
    [ScriptableType]
    public class SpanNative : TextElementNative
    {
        public static DependencyPropertyWrapper InlinesProperty;

        public SpanNative(ScriptObject @object)
            : base(@object)
        {
        }

        protected override DependencyPropertyWrapper GetChildrenDP()
        {
            return InlinesProperty;
        }
    }
}