using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public class DependencyObjectFactory
    {
        [ScriptableMember]
        public DependencyObjectNative CreateObject(ScriptObject so)
        {
            return new DependencyObjectNative(so);
        }

        [ScriptableMember]
        public object CreateUndefined()
        {
            return DependencyObjectNative.UNDEFINED;
        }

        [ScriptableMember]
        public void RegisterNullstone(ScriptObject so)
        {
            Nullstone.ScriptObject = so;
        }
    }
}