using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public class DependencyObjectFactory
    {
        [ScriptableMember]
        public DependencyObject CreateObject()
        {
            return new DependencyObject();
        }
    }
}