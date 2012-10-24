using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public interface INullstoneObjectWrapper
    {
        ScriptObject Object { get; }
        int _ID { get; }
    }
}